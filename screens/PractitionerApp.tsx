import React, { useState, useEffect } from 'react';
import type { Practitioner, Consultation, Order, OrderItem, Patient } from '../types';
import { ProfileScreen, InventoryManagementScreen } from './SharedScreens';
import { ConsultationScreen } from './ConsultationScreen';
import { Card, Button, Modal, Textarea } from '../components/ui';
import { CheckCircleIcon, ChevronRightIcon } from '../components/Icons';
import { MOCK_PATIENTS, ORDER_STATUS_DETAILS, MOCK_ALL_CENTRAL_PRODUCTS, MOCK_PRACTITIONERS } from '../constants';
import { ConsultationType, OrderStatus, DeliveryMethod, FulfillmentSource, PractitionerType } from '../types';

const PhoneHangUpIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.467,15.033c-1.332,0-2.665-0.299-3.902-0.897c-0.499-0.232-1.092-0.126-1.465,0.247l-2.19,2.19 c-3.41-1.742-6.175-4.507-7.917-7.917l2.19-2.19c0.373-0.373,0.479-0.966,0.247-1.465c-0.598-1.237-0.897-2.57-0.897-3.902 C5.533,0.467,5.067,0,4.533,0H1C0.467,0,0,0.467,0,1c0,10.771,8.729,19.5,19.5,19.5c0.533,0,1-0.467,1-1v-3.533 C20.5,15.5,20.033,15.033,19.467,15.033z"/>
    </svg>
);


const CallScreen = ({ patient, onHangUp }: { patient: Patient; onHangUp: () => void; }) => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center z-[60] animate-fade-in">
            <img src={patient.avatarUrl} alt={patient.name} className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover" />
            <h2 className="text-3xl font-bold text-white mt-6">{patient.name}</h2>
            <p className="text-xl text-gray-300 mt-2">{patient.phone}</p>
            <p className="text-gray-400 mt-8 animate-pulse">กำลังโทรออก...</p>
            <div className="absolute bottom-16">
                <Button onClick={onHangUp} variant="danger" className="!w-20 !h-20 !rounded-full">
                    <PhoneHangUpIcon />
                </Button>
            </div>
        </div>
    );
};

const OrderDetailModal = ({ isOpen, onClose, order, onUpdateStatus, onInitiateCall }: {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, updates: Partial<Order>) => void;
  onInitiateCall: (patient: Patient) => void;
}) => {
  if (!order) return null;

  const statusDetail = ORDER_STATUS_DETAILS[order.status];

  const handleNextStep = () => {
    const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
        [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
        [OrderStatus.PREPARING]: order.deliveryMethod === DeliveryMethod.PICKUP ? OrderStatus.READY_FOR_PICKUP : OrderStatus.READY_FOR_DELIVERY,
        [OrderStatus.READY_FOR_PICKUP]: OrderStatus.COMPLETED,
        [OrderStatus.READY_FOR_DELIVERY]: OrderStatus.DELIVERED,
    };
    const nextStatus = nextStatusMap[order.status];
    if (nextStatus) {
        onUpdateStatus(order.id, { status: nextStatus });
    }
  };

  const getButtonConfig = (): { text: string; actionable: boolean } => {
    switch (order.status) {
      case OrderStatus.CONFIRMED: return { text: 'เริ่มเตรียม', actionable: true };
      case OrderStatus.PREPARING: return { text: order.deliveryMethod === DeliveryMethod.PICKUP ? 'พร้อมให้รับ' : 'พร้อมจัดส่ง', actionable: true };
      case OrderStatus.READY_FOR_PICKUP: return { text: 'ยืนยันการรับ', actionable: true };
      case OrderStatus.READY_FOR_DELIVERY: return { text: 'ยืนยันการส่ง', actionable: true };
      default: return { text: statusDetail.text, actionable: false };
    }
  };

  const { text: buttonText, actionable: isActionable } = getButtonConfig();

  const renderFullDeliveryDetails = () => {
    switch(order.deliveryMethod) {
      case DeliveryMethod.PICKUP:
        return <p><strong>วิธีรับ:</strong> รับเองที่ร้าน</p>;
      case DeliveryMethod.FACILITY_DELIVERY:
        return (
          <>
            <p><strong>วิธีรับ:</strong> จัดส่งโดยสถานบริการ</p>
            <p className="mt-1"><strong>ที่อยู่:</strong> {order.deliveryAddress || 'ไม่ได้ระบุ'}</p>
          </>
        );
      case DeliveryMethod.EXPRESS:
        return (
          <>
            <p><strong>วิธีรับ:</strong> จัดส่งด่วน (Messenger)</p>
            <p className="mt-1"><strong>คนขับ:</strong> {order.messengerInfo?.driverName || 'N/A'}</p>
            <p><strong>เบอร์โทร:</strong> {order.messengerInfo?.driverPhone || 'N/A'}</p>
            <p><strong>Booking No:</strong> {order.messengerInfo?.bookingNumber || 'N/A'}</p>
          </>
        );
      default:
        return <p><strong>วิธีรับ:</strong> ไม่ได้ระบุ</p>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`รายละเอียดคำสั่งซื้อ #${order.id.substring(8, 13)}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b">
          <img src={order.patient.avatarUrl} alt={order.patient.name} className="w-16 h-16 rounded-full object-cover" />
          <div>
            <p className="font-bold text-lg">{order.patient.name}</p>
            <p className="text-gray-600">สถานะ: <span className="font-semibold text-green-600">{statusDetail.text}</span></p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-2">รายการ</h3>
          <ul className="list-disc list-inside bg-gray-50 p-3 rounded-lg">
            {order.items.map(item => (
              <li key={item.product.id}>{item.product.name} x {item.quantity}</li>
            ))}
          </ul>
           <div className="text-right font-bold text-lg mt-2">รวม: {order.totalCost.toLocaleString()} บาท</div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-2">ข้อมูลการจัดส่ง</h3>
          <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
            {renderFullDeliveryDetails()}
          </div>
        </div>
        
        <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
            <Button onClick={() => onInitiateCall(order.patient)} variant="light" className="w-full">โทรติดต่อผู้ป่วย</Button>
            {isActionable && <Button onClick={handleNextStep} variant="secondary" className="w-full">{buttonText}</Button>}
        </div>
      </div>
    </Modal>
  );
};

const ConsultationRequestDetailModal = ({
    isOpen, onClose, consultation, onAccept, onReject, onRefer
}: {
    isOpen: boolean;
    onClose: () => void;
    consultation: Consultation | null;
    onAccept: (c: Consultation) => void;
    onReject: (c: Consultation) => void;
    onRefer: (c: Consultation) => void;
}) => {
    if (!consultation) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดคำขอคำปรึกษา">
            <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b">
                    <img src={consultation.patient.avatarUrl} alt={consultation.patient.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <p className="font-bold text-lg">{consultation.patient.name}</p>
                        <p className="text-gray-600">ขอปรึกษาผ่าน {consultation.type}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-2">ข้อมูลเบื้องต้น</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-700 space-y-1">
                        <p><strong>อาการ:</strong> {consultation.preliminaryInfo.symptoms || 'N/A'}</p>
                        <p><strong>โรคประจำตัว:</strong> {consultation.preliminaryInfo.diseases || 'N/A'}</p>
                        <p><strong>ประวัติการแพ้ยา:</strong> {consultation.preliminaryInfo.allergies || 'N/A'}</p>
                        <p><strong>น้ำหนัก/ส่วนสูง:</strong> {consultation.preliminaryInfo.weight || 'N/A'} kg / {consultation.preliminaryInfo.height || 'N/A'} cm</p>
                    </div>
                </div>
                 <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button onClick={() => onReject(consultation)} variant="danger" className="w-full">ปฏิเสธ</Button>
                    <Button onClick={() => onRefer(consultation)} variant="light" className="w-full">แนะนำท่านอื่น</Button>
                    <Button onClick={() => onAccept(consultation)} variant="secondary" className="w-full sm:col-span-1">รับเคส</Button>
                </div>
            </div>
        </Modal>
    );
};

const RejectReasonModal = ({ isOpen, onClose, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('กรุณาระบุเหตุผลในการปฏิเสธ');
            return;
        }
        onSubmit(reason);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ระบุเหตุผลในการปฏิเสธ">
            <div className="space-y-4">
                <Textarea
                    id="rejectionReason"
                    label="เหตุผล"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="เช่น เคสนี้อยู่นอกเหนือความเชี่ยวชาญของฉัน..."
                />
                <div className="flex justify-end gap-3">
                    <Button onClick={onClose} variant="ghost" className="w-auto px-6">ยกเลิก</Button>
                    <Button onClick={handleSubmit} variant="danger" className="w-auto px-6">ยืนยันการปฏิเสธ</Button>
                </div>
            </div>
        </Modal>
    );
};

const ReferPractitionerModal = ({ isOpen, onClose, onSubmit, currentPractitionerId }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (practitioner: Practitioner) => void;
    currentPractitionerId: number;
}) => {
    const otherPractitioners = MOCK_PRACTITIONERS.filter(p => p.id !== currentPractitionerId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="แนะนำผู้เชี่ยวชาญท่านอื่น">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {otherPractitioners.map(p => (
                    <Card key={p.id} className="!p-3 flex items-center justify-between">
                        <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.specialty}</p>
                        </div>
                        <Button onClick={() => onSubmit(p)} variant="light" className="w-auto px-4 !py-2">แนะนำ</Button>
                    </Card>
                ))}
            </div>
        </Modal>
    );
};

const OrderManagementCard = ({ order, onViewDetails }: { 
    order: Order; 
    onViewDetails: (order: Order) => void;
}) => {
    const statusDetail = ORDER_STATUS_DETAILS[order.status];

    const renderDeliveryDetailsPreview = () => {
        if (!order.deliveryMethod) return null;
        let icon = '';
        let detail = '';

        switch(order.deliveryMethod) {
            case DeliveryMethod.PICKUP: icon = '🏠'; detail = 'รับเองที่ร้าน'; break;
            case DeliveryMethod.FACILITY_DELIVERY: icon = '🚚'; detail = order.deliveryAddress || 'จัดส่งโดยร้านยา'; break;
            case DeliveryMethod.EXPRESS: icon = '🛵'; detail = `คนขับ: ${order.messengerInfo?.driverName}`; break;
            case DeliveryMethod.CENTRAL_DELIVERY: icon = '📦'; detail = 'จัดส่งจากคลังกลาง'; break;
        }

        return (
             <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span title={detail}>{icon}</span>
                <span className="truncate" title={detail}>{detail}</span>
            </div>
        )
    }

    return (
        <Card 
            className="mb-4 border-l-4 border-green-500 hover:shadow-md transition-shadow !p-4 cursor-pointer"
            onClick={() => onViewDetails(order)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-grow min-w-0">
                    <img src={order.patient.avatarUrl} alt={order.patient.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                        <p className="font-bold truncate">{order.patient.name}</p>
                        <p className="text-sm text-gray-500">
                            Order #{order.id.substring(8, 13)} &bull; <span className="font-semibold text-green-600">{statusDetail.text}</span>
                        </p>
                        {renderDeliveryDetailsPreview()}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StatCard = ({ title, value, icon, colorClass }: { title: string; value: string | number; icon: string; colorClass: string; }) => (
    <Card className={`!p-4 flex items-center justify-between ${colorClass}`}>
        <div>
            <p className="font-medium text-sm opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
    </Card>
);

const PractitionerDashboard = ({ 
    practitioner,
    consultations, 
    orders,
    onNavigate,
    onViewOrderDetails,
    onViewConsultationRequest,
}: { 
    practitioner: Practitioner; 
    consultations: Consultation[];
    orders: Order[];
    onNavigate: (view: string) => void; 
    onViewOrderDetails: (order: Order) => void;
    onViewConsultationRequest: (consultation: Consultation) => void;
}) => {
    const consultationQueue = consultations.filter(c => c.status === 'pending');
    
    const isFacility = practitioner.practitionerType === PractitionerType.FACILITY_BASED;
    
    const ordersToManage = isFacility ? orders.filter(o => ![OrderStatus.COMPLETED, OrderStatus.DELIVERED, OrderStatus.PAYMENT_PENDING].includes(o.status)) : [];
    
    const incomeToday = orders
        .filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED)
        .reduce((sum, order) => sum + order.totalCost, 0);

    const casesServed = orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED).length;
    

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h1>
                    <p className="text-gray-500 mt-1">ภาพรวมกิจกรรมของคุณในวันนี้</p>
                </div>
                <Button onClick={() => onNavigate('profile')} variant="light" className="w-auto px-6 !py-2">จัดการโปรไฟล์</Button>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="รายได้ (วันนี้)" value={`฿${incomeToday.toLocaleString()}`} icon="💰" colorClass="bg-yellow-100/60 border border-yellow-200 text-yellow-900" />
                <StatCard title="เคสที่ดูแลแล้ว" value={casesServed} icon="✅" colorClass="bg-purple-100/60 border border-purple-200 text-purple-900" />
                <StatCard title="คิวรอให้คำปรึกษา" value={consultationQueue.length} icon="👥" colorClass="bg-green-100/60 border border-green-200 text-green-900" />
                {isFacility && (
                    <StatCard title="คำสั่งซื้อที่ต้องจัดการ" value={ordersToManage.length} icon="📦" colorClass="bg-blue-100/60 border border-blue-200 text-blue-900" />
                )}
            </div>

            {isFacility && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">จัดการคำสั่งซื้อ</h2>
                    {ordersToManage.length > 0 ? (
                        ordersToManage.map(order => <OrderManagementCard key={order.id} order={order} onViewDetails={onViewOrderDetails}/>)
                    ) : (
                        <Card><p className="text-gray-500 text-center py-8">ไม่มีคำสั่งซื้อที่ต้องดำเนินการ</p></Card>
                    )}
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">คิวให้คำปรึกษา</h2>
                <Card>
                    {consultationQueue.length > 0 ? (
                        <ul className="divide-y divide-y-gray-200">
                            {consultationQueue.map(c => (
                                <li key={c.id} className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-lg -mx-2 px-2 cursor-pointer" onClick={() => onViewConsultationRequest(c)}>
                                    <div className="flex items-center space-x-4">
                                        <img src={c.patient.avatarUrl} alt={c.patient.name} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-lg">{c.patient.name}</p>
                                            <p className="text-sm text-gray-500">ขอปรึกษาผ่าน {c.type}</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="text-gray-400 w-5 h-5"/>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-8">ไม่มีคิวในขณะนี้</p>
                    )}
                </Card>
            </div>
        </div>
    );
};


export const PractitionerApp = ({ 
    practitioner, 
    consultations,
    orders,
    onUpdateUser, 
    addOrder, 
    addConsultation,
    updateOrderStatus,
    updateConsultationStatus
}: { 
    practitioner: Practitioner; 
    consultations: Consultation[];
    orders: Order[];
    onUpdateUser: (updatedUser: Practitioner) => void;
    addOrder: (order: Order) => void;
    addConsultation: (consultation: Consultation) => void;
    updateOrderStatus: (orderId: string, updates: Partial<Order>) => void;
    updateConsultationStatus: (consultationId: number, status: 'active' | 'finished') => void;
}) => {
    const [view, setView] = useState('dashboard');
    const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [callingPatient, setCallingPatient] = useState<Patient | null>(null);
    const [viewingConsultationRequest, setViewingConsultationRequest] = useState<Consultation | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isReferModalOpen, setIsReferModalOpen] = useState(false);


    // Simulation Effect
    useEffect(() => {
        if (consultations.length > 0 || orders.some(o => o.id.startsWith('ORD-SIM'))) return;

        const timers: (NodeJS.Timeout | number)[] = [];

        // Request 1 (Chat)
        timers.push(setTimeout(() => {
            addConsultation({
                id: Date.now(),
                patient: MOCK_PATIENTS[0],
                practitioner,
                type: ConsultationType.CHAT,
                preliminaryInfo: { symptoms: 'คันตา จามบ่อย', diseases: 'ภูมิแพ้', allergies: 'ไม่มี', weight: '55', height: '160' },
                status: 'pending',
            });
        }, 3000));

        // Request 2 (Video)
        timers.push(setTimeout(() => {
            addConsultation({
                id: Date.now() + 1,
                patient: MOCK_PATIENTS[1],
                practitioner,
                type: ConsultationType.VIDEO,
                preliminaryInfo: { symptoms: 'ปวดหัว มีไข้เล็กน้อย', diseases: 'ไมเกรน', allergies: 'ไม่มี', weight: '70', height: '175' },
                status: 'pending',
            });
        }, 4000));

        // Request 3 (Voice)
        timers.push(setTimeout(() => {
            addConsultation({
                id: Date.now() + 2,
                patient: MOCK_PATIENTS[0],
                practitioner,
                type: ConsultationType.VOICE,
                preliminaryInfo: { symptoms: 'นอนไม่หลับ', diseases: 'ความดันโลหิตสูง', allergies: 'Penicillin', weight: '55', height: '160' },
                status: 'pending',
            });
        }, 5000));


        if (practitioner.practitionerType === PractitionerType.FACILITY_BASED) {
            timers.push(setTimeout(() => {
                const mockItems: OrderItem[] = [{ product: MOCK_ALL_CENTRAL_PRODUCTS[0], quantity: 2 }];
                const productsCost = mockItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                
                addOrder({
                    id: `ORD-SIM-${Date.now() + 1}`,
                    patient: MOCK_PATIENTS[0],
                    practitioner,
                    items: mockItems,
                    productsCost: productsCost,
                    consultationFee: practitioner.consultationFee || 0,
                    totalDiscount: 0,
                    totalCost: productsCost + (practitioner.consultationFee || 0),
                    status: OrderStatus.CONFIRMED,
                    fulfillmentSource: FulfillmentSource.CENTRAL, 
                    deliveryMethod: DeliveryMethod.FACILITY_DELIVERY, 
                    deliveryAddress: MOCK_PATIENTS[0].address,
                    soapNote: "Patient requires Vitamin C for immune support.",
                });
            }, 6000));
        }
        
        return () => {
            timers.forEach(t => clearTimeout(t as any));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStartConsultation = (consultation: Consultation) => {
        setViewingConsultationRequest(null);
        setActiveConsultation(consultation);
        updateConsultationStatus(consultation.id, 'active');
        setView('consultation');
    };

    const handleEndConsultation = (newOrder: Order) => {
        if (!activeConsultation) return;
        addOrder(newOrder);
        updateConsultationStatus(activeConsultation.id, 'finished');
        setIsConfirmationModalOpen(true);
        setActiveConsultation(null);
        setView('dashboard');
    };

    const handleUpdateAndCloseModal = (orderId: string, updates: Partial<Order>) => {
        updateOrderStatus(orderId, updates);
        setViewingOrder(null);
    };

    const handleInitiateCall = (patient: Patient) => {
        setViewingOrder(null); 
        setCallingPatient(patient);
    };
    
    // --- New Handlers for Consultation Request ---
    const handleViewConsultationRequest = (consultation: Consultation) => {
        setViewingConsultationRequest(consultation);
    };

    const handleAcceptConsultation = (consultation: Consultation) => {
        setViewingConsultationRequest(null);
        handleStartConsultation(consultation);
    };

    const handleOpenRejectModal = (consultation: Consultation) => {
        setViewingConsultationRequest(consultation);
        setIsRejectModalOpen(true);
    };
    
    const handleConfirmReject = (reason: string) => {
        if (!viewingConsultationRequest) return;
        console.log(`Consultation ${viewingConsultationRequest.id} rejected. Reason: ${reason}`);
        updateConsultationStatus(viewingConsultationRequest.id, 'finished');
        setIsRejectModalOpen(false);
        setViewingConsultationRequest(null);
    };

    const handleOpenReferModal = (consultation: Consultation) => {
        setViewingConsultationRequest(consultation);
        setIsReferModalOpen(true);
    };

    const handleConfirmRefer = (practitioner: Practitioner) => {
        if (!viewingConsultationRequest) return;
        console.log(`Consultation ${viewingConsultationRequest.id} referred to ${practitioner.name}`);
        updateConsultationStatus(viewingConsultationRequest.id, 'finished');
        setIsReferModalOpen(false);
        setViewingConsultationRequest(null);
    };


    const renderContent = () => {
        switch (view) {
            case 'dashboard':
                return <PractitionerDashboard 
                            practitioner={practitioner} 
                            consultations={consultations}
                            orders={orders}
                            onNavigate={setView}
                            onViewOrderDetails={setViewingOrder}
                            onViewConsultationRequest={handleViewConsultationRequest}
                        />;
            case 'profile':
                return <ProfileScreen 
                    user={practitioner} 
                    onSave={(u) => { onUpdateUser(u as Practitioner); setView('dashboard'); }} 
                    onBack={() => setView('dashboard')}
                    onNavigateToInventory={() => setView('inventory')}
                />;
            case 'inventory':
                 return <InventoryManagementScreen onBack={() => setView('profile')} />;
            case 'consultation':
                if (activeConsultation) {
                    return <ConsultationScreen 
                                consultation={activeConsultation} 
                                practitioner={practitioner}
                                onEndConsultation={handleEndConsultation}
                            />;
                }
                return null;
            default:
                return <div>ไม่พบหน้าที่ต้องการ</div>;
        }
    };

    return (
        <div className="animate-fade-in">
            {renderContent()}

            <OrderDetailModal
                isOpen={!!viewingOrder}
                order={viewingOrder}
                onClose={() => setViewingOrder(null)}
                onUpdateStatus={handleUpdateAndCloseModal}
                onInitiateCall={handleInitiateCall}
            />

            <ConsultationRequestDetailModal
                isOpen={!!viewingConsultationRequest && !isRejectModalOpen && !isReferModalOpen}
                onClose={() => setViewingConsultationRequest(null)}
                consultation={viewingConsultationRequest}
                onAccept={handleAcceptConsultation}
                onReject={handleOpenRejectModal}
                onRefer={handleOpenReferModal}
            />

            <RejectReasonModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setViewingConsultationRequest(null);
                }}
                onSubmit={handleConfirmReject}
            />

            <ReferPractitionerModal
                isOpen={isReferModalOpen}
                onClose={() => {
                    setIsReferModalOpen(false);
                    setViewingConsultationRequest(null);
                }}
                onSubmit={handleConfirmRefer}
                currentPractitionerId={practitioner.id}
            />

            <Modal isOpen={isConfirmationModalOpen} onClose={() => setIsConfirmationModalOpen(false)} title="ส่งข้อมูลให้ผู้ป่วยสำเร็จ">
                <div className="text-center">
                    <CheckCircleIcon className="text-green-500 text-5xl mb-4 mx-auto"/>
                    <p className="text-lg text-gray-700 mb-2">ข้อมูลถูกส่งไปยังผู้ป่วยเรียบร้อยแล้ว</p>
                    <p className="text-gray-500">รอผู้ป่วยชำระเงินเพื่อดำเนินการในขั้นตอนต่อไป</p>
                </div>
            </Modal>

            {callingPatient && <CallScreen patient={callingPatient} onHangUp={() => setCallingPatient(null)} />}
        </div>
    );
};