
import React, 'react';
import { useState, useEffect } from 'react';
import { MOCK_PRACTITIONERS, ORDER_STATUS_DETAILS, MOCK_ALL_CENTRAL_PRODUCTS } from '../constants';
import { ConsultationType, DeliveryMethod, OrderStatus, UserRole, PractitionerRole, PractitionerType, FulfillmentSource } from '../types';
import type { Patient, Practitioner, Consultation, PreliminaryInfo, Order, OrderItem, MessengerInfo } from '../types';
import { Card, Button, Input, Textarea, Modal } from '../components/ui';
import { ArrowLeftIcon, ChevronRightIcon, SpinnerIcon, CheckCircleIcon } from '../components/Icons';
import { summarizeSoapNoteForPatient } from '../services/geminiService';
import { ProfileScreen } from './SharedScreens';

// --- NEW PRACTITIONER LANDING PAGE ---
export const PractitionerLandingPage = ({ practitioner, onStartConsultation }: { practitioner: Practitioner; onStartConsultation: () => void; }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full text-center animate-fade-in-up">
                <img src={practitioner.avatarUrl} alt={practitioner.name} className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg -mt-20 object-cover" />
                <h1 className="text-3xl font-extrabold text-gray-800 mt-4">{practitioner.name}</h1>
                <p className="font-semibold text-green-600">
                    {practitioner.practitionerRole === PractitionerRole.PHARMACIST && `เภสัชกร @ ${practitioner.facilityName || 'อิสระ'}`}
                    {practitioner.practitionerRole === PractitionerRole.DOCTOR && `แพทย์ @ ${practitioner.facilityName || 'อิสระ'}`}
                    {practitioner.practitionerRole === PractitionerRole.NURSE && `พยาบาล @ ${practitioner.facilityName || 'อิสระ'}`}
                </p>
                
                <div className="my-6 text-left">
                    <h3 className="font-bold text-lg mb-2 text-gray-700">ความเชี่ยวชาญพิเศษ:</h3>
                    <div className="flex flex-wrap gap-2">
                        {practitioner.specialty.split(',').map(s => s.trim()).map(spec => (
                            <span key={spec} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{spec}</span>
                        ))}
                    </div>
                </div>

                <div className="my-6 text-left bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 text-gray-700">เกี่ยวกับบุคลากร:</h3>
                    <p className="text-gray-600">{practitioner.bio}</p>
                </div>
                
                <div className="mt-8">
                    <Button onClick={onStartConsultation} variant="primary" className="w-full max-w-sm mx-auto text-lg !py-4">
                        ปรึกษาตอนนี้ {practitioner.consultationFee ? `(${practitioner.consultationFee} บาท)`: ''}
                    </Button>
                     <a href="/" className="mt-4 inline-block text-sm text-gray-500 hover:underline">หรือดูบุคลากรท่านอื่น</a>
                </div>
            </Card>
        </div>
    );
};


// --- PATIENT COMPONENTS ---
const ActiveOrderBanner = ({ order, onNavigate }: { order: Order; onNavigate: (view: string, data?: any) => void }) => {
    const statusDetail = ORDER_STATUS_DETAILS[order.status];
    if (!statusDetail) return null;

    return (
        <Card 
            className="mb-6 bg-blue-50 border border-blue-200 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onNavigate('tracking', { order })}
        >
            <div className="flex items-center space-x-4">
                <div className="text-blue-600 text-2xl"><SpinnerIcon className="animate-spin"/></div>
                <div className="flex-grow">
                    <p className="font-bold text-lg text-blue-800">คุณมีคำสั่งซื้อที่กำลังดำเนินการ</p>
                    <p className="text-sm text-gray-600">
                        สถานะปัจจุบัน: <span className="font-semibold">{statusDetail.text}</span> (Order #{order.id.substring(8, 13)})
                    </p>
                </div>
                <ChevronRightIcon className="text-gray-400" />
            </div>
        </Card>
    );
};


const PractitionerSelectionScreen = ({ onSelect }: { onSelect: (practitioner: Practitioner) => void }) => (
    <div>
        <div className="space-y-4">
            {MOCK_PRACTITIONERS.map(p => (
                <Card key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <img src={p.avatarUrl} alt={p.name} className="w-24 h-24 rounded-full object-cover self-center sm:self-auto"/>
                    <div className="flex-grow">
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{p.practitionerRole} ({p.practitionerType})</p>
                        <p className="text-sm text-blue-600 font-medium">{p.specialty}</p>
                    </div>
                    <div className="w-full sm:w-auto text-center">
                        {p.consultationFee && <p className="font-bold text-lg text-green-700 mb-2">{p.consultationFee} บาท/ครั้ง</p>}
                        <Button onClick={() => onSelect(p)} className="w-full sm:w-auto px-6">เลือก</Button>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

const PreliminaryInfoModal = ({ isOpen, onClose, onSubmit, patient }: { isOpen: boolean, onClose: () => void, onSubmit: (info: PreliminaryInfo) => void, patient: Patient }) => {
    const [info, setInfo] = useState({ 
        symptoms: '', 
        diseases: patient.chronicDiseases, 
        allergies: patient.drugAllergies,
        weight: '',
        height: ''
    });

    const darkInputStyle = "bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(info);
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="กรอกข้อมูลเบื้องต้น">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea id="symptoms" label="อาการสำคัญเบื้องต้น" value={info.symptoms} onChange={e => setInfo({...info, symptoms: e.target.value})} placeholder="ไข้" required rows={4} className={darkInputStyle}/>
                <div className="grid grid-cols-2 gap-4">
                    <Input id="weight" label="น้ำหนัก (กก.)" type="number" value={info.weight} onChange={e => setInfo({...info, weight: e.target.value})} placeholder="50" className={darkInputStyle} />
                    <Input id="height" label="ส่วนสูง (ซม.)" type="number" value={info.height} onChange={e => setInfo({...info, height: e.target.value})} placeholder="165" className={darkInputStyle} />
                </div>
                <Input id="diseases" label="โรคประจำตัว" value={info.diseases} onChange={e => setInfo({...info, diseases: e.target.value})} className={darkInputStyle} />
                <Input id="allergies" label="ประวัติการแพ้ยา" value={info.allergies} onChange={e => setInfo({...info, allergies: e.target.value})} className={darkInputStyle} />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button onClick={onClose} variant="ghost" type="button" className="w-auto px-6">ยกเลิก</Button>
                    <Button type="submit" className="w-auto px-6">ดำเนินการต่อ</Button>
                </div>
            </form>
        </Modal>
    );
};

const ConsultationTypeModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (type: ConsultationType) => void }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="เลือกรูปแบบการปรึกษา">
        <div className="grid grid-cols-1 gap-4">
            <Button onClick={() => onSelect(ConsultationType.VIDEO)} variant="primary" className="!py-4 text-lg"><span>Video Call</span></Button>
            <Button onClick={() => onSelect(ConsultationType.VOICE)} variant="secondary" className="!py-4 text-lg"><span>Voice Call</span></Button>
            <Button onClick={() => onSelect(ConsultationType.CHAT)} variant="light" className="!py-4 text-lg !text-gray-800"><span>Text Chat</span></Button>
        </div>
    </Modal>
);

const ConsultationConnectingScreen = ({ practitioner, type }: { practitioner: Practitioner, type: ConsultationType }) => (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <Card className="text-center max-w-md w-full">
            <img src={practitioner.avatarUrl} alt={practitioner.name} className="w-32 h-32 rounded-full mb-6 mx-auto border-4 border-gray-200 animate-pulse object-cover" />
            <h2 className="text-2xl font-bold text-gray-800">กำลังเชื่อมต่อกับ</h2>
            <p className="text-xl text-blue-600 font-semibold my-1">{practitioner.name}</p>
            <p className="text-gray-500">ผ่าน {type}</p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
                <SpinnerIcon />
                <span>กรุณารอสักครู่...</span>
            </div>
        </Card>
    </div>
);

const PatientConsultationInProgressScreen = ({ consultation, onEndConsultation }: { consultation: Consultation, onEndConsultation: () => void }) => (
    <Card>
        <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">การปรึกษา ({consultation.type})</h2>
            <p className="text-gray-500">กับ {consultation.practitioner.name}</p>
        </div>
        <div className="my-8 min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
            <p>จำลองหน้าจอการสนทนา...</p>
        </div>
        <Button onClick={onEndConsultation} variant="danger">สิ้นสุดการปรึกษา</Button>
    </Card>
);

const OrderSummaryScreen = ({ order, onNavigate }: { order: Order, onNavigate: (view: string, data?: any) => void }) => {
    const [summarizedAdvice, setSummarizedAdvice] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState<boolean>(true);

    useEffect(() => {
        if (order.soapNote) {
            setIsSummarizing(true);
            summarizeSoapNoteForPatient(order.soapNote)
                .then(summary => setSummarizedAdvice(summary))
                .catch(err => {
                    console.error("Failed to summarize advice:", err);
                    setSummarizedAdvice(order.soapNote || "ไม่มีคำแนะนำ");
                })
                .finally(() => setIsSummarizing(false));
        } else {
            setSummarizedAdvice("ไม่มีคำแนะนำ");
            setIsSummarizing(false);
        }
    }, [order.soapNote]);

    return (
     <Card>
         <div className="text-center mb-6">
              <div className="text-green-500 text-5xl mb-3">🧾</div>
              <h2 className="text-2xl font-bold text-gray-800">ส่งใบสั่งยา/คำแนะนำให้คุณแล้ว</h2>
              <p className="text-gray-500">กรุณาตรวจสอบและดำเนินการชำระเงิน</p>
         </div>
         <div className="border rounded-lg p-4 my-4">
             <h3 className="text-lg font-bold mb-3">รายการผลิตภัณฑ์</h3>
             <div className="space-y-2 mb-4 text-gray-700">
                {order.items.map(item => (
                    <div key={item.product.id} className="flex justify-between">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>{(item.product.price * item.quantity).toLocaleString()} บาท</span>
                    </div>
                ))}
                {order.consultationFee > 0 && (
                    <div className="flex justify-between mt-2">
                        <span>ค่าบริการให้คำปรึกษา</span>
                        <span>{order.consultationFee.toLocaleString()} บาท</span>
                    </div>
                )}
                {order.totalDiscount > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span>ส่วนลดจากผู้ให้คำปรึกษา</span>
                        <span>- {order.totalDiscount.toLocaleString()} บาท</span>
                    </div>
                )}
             </div>
             <div className="border-t pt-3 flex justify-between font-bold text-xl">
                <span>รวมทั้งหมด:</span>
                <span>{order.totalCost.toLocaleString()} บาท</span>
            </div>
         </div>
         {order.soapNote && (
            <>
                <h3 className="text-lg font-bold mb-2">คำแนะนำจากผู้เชี่ยวชาญ</h3>
                <div className="text-gray-600 bg-gray-50 p-4 rounded-lg mb-6 whitespace-pre-wrap min-h-[100px] flex items-center justify-center">
                    {isSummarizing ? (
                        <div className="flex items-center justify-center gap-2"><SpinnerIcon /><span>กำลังสรุปคำแนะนำ...</span></div>
                    ) : (
                        <p>{summarizedAdvice}</p>
                    )}
                </div>
            </>
         )}
         <Button onClick={() => onNavigate('checkout', { order })} variant="primary">ดำเนินการต่อเพื่อชำระเงิน</Button>
     </Card>
    );
};

const CheckoutScreen = ({ order, onConfirmPayment }: { order: Order, onConfirmPayment: (orderId: string) => void }) => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ชำระเงิน</h1>
        <Card>
            <h3 className="text-lg font-bold border-b pb-3 mb-4">การชำระเงิน</h3>
            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_FOR_${order.id}`} alt="QR Code" className="my-4 rounded-lg shadow-md" />
                <div className="font-bold text-2xl">ยอดชำระ: {order.totalCost.toLocaleString()} บาท</div>
            </div>
            <div className="mt-6">
                <label htmlFor="paymentProof" className="block font-medium text-gray-700 mb-2">แนบหลักฐานการโอนเงิน (จำลอง)</label>
                <input type="file" id="paymentProof" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <Button onClick={() => onConfirmPayment(order.id)} className="mt-6">ยืนยันการชำระเงิน</Button>
        </Card>
    </div>
);


const DeliveryMethodScreen = ({ order, onNavigate, onConfirmDelivery }: { order: Order, onNavigate: (view: string, data: any) => void, onConfirmDelivery: (orderId: string, method: DeliveryMethod) => void }) => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">เลือกวิธีการรับของ</h1>
        <Card>
             <div className="space-y-4 mb-6">
                 <label className="flex items-start p-4 border-2 rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-all">
                     <input type="radio" name="delivery" value={DeliveryMethod.EXPRESS} className="mr-4 h-5 w-5 text-blue-600 mt-1 focus:ring-blue-500" defaultChecked />
                     <div>
                         <span className="font-bold text-lg">จัดส่งด่วน (เรียก Messenger เอง)</span>
                         <span className="block text-sm text-gray-500">(ลูกค้าชำระค่าส่งกับ Messenger โดยตรง)</span>
                     </div>
                 </label>
                 <label className="flex items-start p-4 border-2 rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-all">
                     <input type="radio" name="delivery" value={DeliveryMethod.PICKUP} className="mr-4 h-5 w-5 text-blue-600 mt-1 focus:ring-blue-500" />
                     <div>
                         <span className="font-bold text-lg">รับเองที่ร้าน</span>
                         <span className="block text-sm text-gray-500">(ไม่เสียค่าใช้จ่าย)</span>
                     </div>
                 </label>
                  <label className="flex items-start p-4 border-2 rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-all">
                     <input type="radio" name="delivery" value={DeliveryMethod.FACILITY_DELIVERY} className="mr-4 h-5 w-5 text-blue-600 mt-1 focus:ring-blue-500" />
                     <div>
                         <span className="font-bold text-lg">จัดส่งโดยร้านยา/คลินิก</span>
                         <span className="block text-sm text-gray-500">(มีค่าบริการจัดส่ง)</span>
                     </div>
                 </label>
             </div>
             <Button onClick={() => {
                 const selectedMethod = document.querySelector<HTMLInputElement>('input[name="delivery"]:checked')?.value as DeliveryMethod;
                 onConfirmDelivery(order.id, selectedMethod);
             }} variant="secondary">ยืนยันวิธีการรับ</Button>
        </Card>
    </div>
);

const FacilityDeliveryScreen = ({ order, patient, onConfirm, onBack }: { order: Order; patient: Patient, onConfirm: (orderId: string, updates: Partial<Order>) => void; onBack: () => void }) => {
    const [address, setAddress] = useState(patient.address);
    const [phone, setPhone] = useState(patient.phone);
    const [shippingDetails, setShippingDetails] = useState({ distance: 0, cost: 0 });

    useEffect(() => {
        const distance = parseFloat((Math.random() * 29 + 1).toFixed(1));
        let cost = Math.max(20, Math.ceil(distance * 5));
        setShippingDetails({ distance, cost });
    }, []);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(order.id, {
            deliveryMethod: DeliveryMethod.FACILITY_DELIVERY,
            deliveryAddress: address,
            shippingCost: shippingDetails.cost
        });
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="mr-4 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon/></button>
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลการจัดส่ง</h1>
            </div>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
                        <p>ค่าบริการจัดส่ง: <span className="font-bold">{shippingDetails.cost}</span> บาท</p>
                    </div>
                    <Textarea id="deliveryAddress" label="ที่อยู่สำหรับจัดส่ง" value={address} onChange={(e) => setAddress(e.target.value)} rows={4} required />
                    <Input id="deliveryPhone" label="เบอร์โทรศัพท์ติดต่อ" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-bold mb-2">ชำระค่าจัดส่ง</h3>
                         <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">สแกน QR Code เพื่อชำระค่าจัดส่ง</p>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SHIPPING_PAYMENT_FOR_${order.id}`} alt="QR Code for shipping" className="my-3 rounded-lg shadow" />
                            <div className="font-bold text-xl">ยอดชำระ: {shippingDetails.cost} บาท</div>
                        </div>
                    </div>
                    <Button type="submit" variant="secondary">ยืนยันและเริ่มติดตามสถานะ</Button>
                </form>
            </Card>
        </div>
    );
};

const MessengerInfoScreen = ({ order, onConfirm, onBack }: { order: Order; onConfirm: (orderId: string, updates: Partial<Order>) => void; onBack: () => void }) => {
    const [messengerInfo, setMessengerInfo] = useState<MessengerInfo>({ driverName: '', driverPhone: '', bookingNumber: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessengerInfo({ ...messengerInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(order.id, { 
            deliveryMethod: DeliveryMethod.EXPRESS,
            messengerInfo: messengerInfo
        });
    };

    return (
         <div>
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="mr-4 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon /></button>
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูล Messenger</h1>
            </div>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="driverName" name="driverName" label="ชื่อผู้ขับขี่" type="text" value={messengerInfo.driverName} onChange={handleChange} required />
                    <Input id="driverPhone" name="driverPhone" label="เบอร์โทรศัพท์ผู้ขับขี่" type="tel" value={messengerInfo.driverPhone} onChange={handleChange} required />
                    <Input id="bookingNumber" name="bookingNumber" label="หมายเลขคำสั่งซื้อ (Booking No.)" type="text" value={messengerInfo.bookingNumber} onChange={handleChange} required />
                    <Button type="submit" variant="secondary" className="mt-4">ยืนยันข้อมูล</Button>
                </form>
            </Card>
        </div>
    );
};

const OrderDeliveredScreen = ({ order, onBack }: { order: Order; onBack: () => void }) => (
    <Card className="text-center animate-fade-in">
        <CheckCircleIcon className="text-green-500 text-6xl mx-auto mb-4"/>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {order.deliveryMethod === DeliveryMethod.PICKUP ? 'รับของเรียบร้อย' : 'จัดส่งสำเร็จ'}
        </h2>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
            ขอบคุณที่ใช้บริการ Medici
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-6">
            <p className="font-semibold">ต้องการความช่วยเหลือเพิ่มเติม?</p>
            <p className="text-sm">หากมีปัญหาเกี่ยวกับผลิตภัณฑ์ที่ได้รับ สามารถติดต่อผู้ให้คำปรึกษาได้สำหรับรายการนี้ภายใน 30 นาที</p>
        </div>
        <Button onClick={onBack} variant="primary" className="max-w-xs mx-auto">กลับสู่หน้าหลัก</Button>
    </Card>
);

const TrackingScreen = ({ order, onBack, onNavigate, updateOrder }: { order: Order, onBack: () => void, onNavigate: (view: string, data?: any) => void, updateOrder: (orderId: string, updates: Partial<Order>) => void }) => {
    const isPickup = order.deliveryMethod === DeliveryMethod.PICKUP;
    
    const steps = isPickup 
        ? [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED]
        : [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_DELIVERY, OrderStatus.DELIVERED];

    const stepDetails = steps.map(s => ORDER_STATUS_DETAILS[s]);
    const currentStepInfo = ORDER_STATUS_DETAILS[order.status];
    const currentStep = currentStepInfo ? currentStepInfo.step : 0;

    useEffect(() => {
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.DELIVERED) {
             const timer = setTimeout(() => {
                 onNavigate('orderDelivered', { order });
            }, 3000);
           return () => clearTimeout(timer);
        }

        const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
            [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
            [OrderStatus.PREPARING]: isPickup ? OrderStatus.READY_FOR_PICKUP : OrderStatus.READY_FOR_DELIVERY,
            [OrderStatus.READY_FOR_PICKUP]: OrderStatus.COMPLETED,
            [OrderStatus.READY_FOR_DELIVERY]: OrderStatus.DELIVERED,
        };
        const nextStatus = nextStatusMap[order.status];
        if (nextStatus) {
            const timer = setTimeout(() => {
                updateOrder(order.id, { status: nextStatus });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [order, isPickup, updateOrder, onNavigate]);

    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="mr-4 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon /></button>
                <h1 className="text-3xl font-bold text-gray-800">ติดตามสถานะคำสั่งซื้อ</h1>
            </div>
            <Card>
                <p className="text-center mb-2">คำสั่งซื้อ #{order.id.substring(8, 13)}</p>
                <p className="text-center text-gray-500 mb-8">ผู้ให้คำปรึกษา: {order.practitioner.name}</p>
                
                 <div className="flex justify-between items-start my-8 px-4">
                    {stepDetails.map((stepInfo, index) => (
                        <div key={index} className="step flex flex-col items-center relative flex-grow text-center">
                            {index > 0 && 
                                <div className={`absolute top-5 right-1/2 w-full h-1 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                            }
                            <div className={`step-circle w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 font-bold transition-all duration-300 ${
                                index + 1 < currentStep ? 'bg-green-500 text-white border-white' : 
                                index + 1 === currentStep ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 
                                'bg-gray-200 text-gray-500 border-gray-50'
                            }`}>
                                {index + 1 < currentStep ? <CheckCircleIcon className="w-6 h-6"/> : index + 1}
                            </div>
                            <p className={`step-text mt-2 font-semibold text-sm w-24 ${index + 1 <= currentStep ? 'text-green-600' : 'text-gray-500'}`}>
                                {isPickup ? (stepInfo.pickupText || stepInfo.text) : (stepInfo.deliveryText || stepInfo.text)}
                            </p>
                        </div>
                    ))}
                </div>

                <Button onClick={onBack} variant="primary" className="mt-8">กลับสู่หน้าหลัก</Button>
            </Card>
        </div>
    );
};


// --- MAIN PATIENT APP ---

export const PatientApp = ({ 
    patient, 
    orders,
    onUpdateUser,
    addConsultation,
    updateOrder,
    addOrder,
    initialPractitioner
}: { 
    patient: Patient; 
    orders: Order[];
    onUpdateUser: (updatedUser: Patient) => void;
    addConsultation: (consultation: Consultation) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    addOrder: (order: Order) => void;
    initialPractitioner: Practitioner | null;
}) => {
    const [view, setView] = useState('selectPractitioner');
    const [viewData, setViewData] = useState<any>(null);
    const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(initialPractitioner);
    const [preliminaryInfo, setPreliminaryInfo] = useState<PreliminaryInfo | null>(null);
    const [isPreliminaryModalOpen, setIsPreliminaryModalOpen] = useState(false);
    const [isConsultationTypeModalOpen, setIsConsultationTypeModalOpen] = useState(false);
    const [waitingForPrescriptionFrom, setWaitingForPrescriptionFrom] = useState<Consultation | null>(null);
    const [shortlinkInput, setShortlinkInput] = useState('');


    useEffect(() => {
        if (initialPractitioner && !preliminaryInfo) {
            setIsPreliminaryModalOpen(true);
        }
    }, [initialPractitioner, preliminaryInfo]);


    const handleNavigate = (newView: string, data: any = null) => {
        setView(newView);
        setViewData(data);
    };

    const handleSelectPractitioner = (practitioner: Practitioner) => {
        setSelectedPractitioner(practitioner);
        setIsPreliminaryModalOpen(true);
    };
    
    const handleShortlinkSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shortlinkInput.trim()) return;

        const affiliateId = shortlinkInput.split('/').pop()?.toLowerCase() || '';

        const foundPractitioner = MOCK_PRACTITIONERS.find(p => p.affiliateId.toLowerCase() === affiliateId);

        if (foundPractitioner) {
            handleSelectPractitioner(foundPractitioner);
        } else {
            alert('ไม่พบผู้ให้คำปรึกษาจากรหัสที่คุณกรอก');
        }
    };

    const handleSubmitPreliminaryInfo = (info: PreliminaryInfo) => {
        setPreliminaryInfo(info);
        setIsPreliminaryModalOpen(false);
        setIsConsultationTypeModalOpen(true);
    };

    const handleSelectConsultationType = (type: ConsultationType) => {
        if (!selectedPractitioner || !preliminaryInfo) return;
        
        const newConsultation: Consultation = {
            id: Date.now(), patient, practitioner: selectedPractitioner, type,
            preliminaryInfo, status: 'pending',
        };
        addConsultation(newConsultation);
        setIsConsultationTypeModalOpen(false);
        handleNavigate('connecting', { consultation: newConsultation });

        setTimeout(() => handleNavigate('consulting', { consultation: newConsultation }), 3000);
    };

    const handleEndConsultationByPatient = () => {
        setWaitingForPrescriptionFrom(viewData.consultation);
        handleNavigate('selectPractitioner'); 
    }

    const handleConfirmPayment = (orderId: string) => {
        updateOrder(orderId, { status: OrderStatus.CONFIRMED });
        const confirmedOrder = { ...viewData.order, status: OrderStatus.CONFIRMED };
        handleNavigate('deliveryMethod', { order: confirmedOrder });
    };
    
    const handleSelectDeliveryMethod = (orderId: string, method: DeliveryMethod) => {
        const updatedOrder = { ...viewData.order, deliveryMethod: method };
        updateOrder(orderId, { deliveryMethod: method });

        if (method === DeliveryMethod.PICKUP || method === DeliveryMethod.CENTRAL_DELIVERY) {
            handleFinalizeDelivery(orderId, { deliveryMethod: method });
        } else if (method === DeliveryMethod.EXPRESS) {
            handleNavigate('messengerInfo', { order: updatedOrder });
        } else if (method === DeliveryMethod.FACILITY_DELIVERY) {
            handleNavigate('facilityDelivery', { order: updatedOrder });
        }
    };

    const handleFinalizeDelivery = (orderId: string, updates: Partial<Order>) => {
        updateOrder(orderId, updates);
        const finalOrderState = orders.find(o => o.id === orderId) || viewData.order;
        handleNavigate('tracking', { order: { ...finalOrderState, ...updates } });
    };
    
    useEffect(() => {
        if (waitingForPrescriptionFrom) {
            const timer = setTimeout(() => {
                const practitioner = waitingForPrescriptionFrom.practitioner;
                const items: OrderItem[] = [{ product: MOCK_ALL_CENTRAL_PRODUCTS[0], quantity: 1, practitionerDiscount: 0 }];
                const productsCost = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                const consultationFee = practitioner.consultationFee || 0;
                const totalDiscount = items.reduce((sum, item) => sum + (item.practitionerDiscount || 0), 0);
                const totalCost = productsCost + consultationFee - totalDiscount;
                
                const newOrder: Order = {
                    id: `ORD-SIM-${Date.now()}`, patient, practitioner, items, productsCost, consultationFee, totalCost, totalDiscount,
                    status: OrderStatus.PAYMENT_PENDING,
                    soapNote: "S: ปวดหัว มีไข้\nP: ทาน Paracetamol และ Vitamin C",
                    fulfillmentSource: FulfillmentSource.CENTRAL,
                };
                addOrder(newOrder);
                setWaitingForPrescriptionFrom(null);
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [waitingForPrescriptionFrom, addOrder, patient]);

    useEffect(() => {
        const myPendingOrder = orders.find(o => o.patient.id === patient.id && o.status === OrderStatus.PAYMENT_PENDING);
        if (myPendingOrder && !['summary', 'checkout'].includes(view)) {
            handleNavigate('summary', { order: myPendingOrder });
        }
    }, [orders, patient.id, view]);


    const renderContent = () => {
        const activeOrder = orders.find(o => o.patient.id === patient.id && ![OrderStatus.COMPLETED, OrderStatus.DELIVERED].includes(o.status));
        
        if (waitingForPrescriptionFrom && !activeOrder) {
            return (
                 <Card className="bg-yellow-50 border border-yellow-200 text-center">
                    <div className="text-3xl text-yellow-600 w-12 text-center mx-auto mb-4"><SpinnerIcon className="w-12 h-12"/></div>
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">รอรับคำแนะนำ</h2>
                    <p className="text-sm text-gray-600">{waitingForPrescriptionFrom.practitioner.name} กำลังเตรียมข้อมูลให้คุณ...</p>
                </Card>
            )
        }
        
        const currentOrderForView = viewData ? orders.find(o => o.id === viewData.order?.id) || viewData.order : null;

        switch (view) {
            case 'profile':
                return <ProfileScreen user={patient} onSave={(u) => onUpdateUser(u as Patient)} onBack={() => handleNavigate('selectPractitioner')} />;
            case 'connecting':
                return <ConsultationConnectingScreen practitioner={viewData.consultation.practitioner} type={viewData.consultation.type} />;
            case 'consulting':
                return <PatientConsultationInProgressScreen consultation={viewData.consultation} onEndConsultation={handleEndConsultationByPatient} />;
            case 'summary':
                if (!currentOrderForView) return null;
                return <OrderSummaryScreen order={currentOrderForView} onNavigate={handleNavigate} />;
            case 'checkout':
                 if (!currentOrderForView) return null;
                return <CheckoutScreen order={currentOrderForView} onConfirmPayment={handleConfirmPayment} />;
            case 'deliveryMethod':
                 if (!currentOrderForView) return null;
                return <DeliveryMethodScreen order={currentOrderForView} onNavigate={handleNavigate} onConfirmDelivery={handleSelectDeliveryMethod} />;
            case 'facilityDelivery':
                 if (!currentOrderForView) return null;
                return <FacilityDeliveryScreen order={currentOrderForView} patient={patient} onConfirm={handleFinalizeDelivery} onBack={() => handleNavigate('deliveryMethod', { order: viewData.order })} />;
            case 'messengerInfo':
                 if (!currentOrderForView) return null;
                return <MessengerInfoScreen order={currentOrderForView} onConfirm={handleFinalizeDelivery} onBack={() => handleNavigate('deliveryMethod', { order: viewData.order })} />;
            case 'tracking':
                if (!currentOrderForView) return null;
                return <TrackingScreen order={currentOrderForView} onBack={() => handleNavigate('selectPractitioner')} onNavigate={handleNavigate} updateOrder={updateOrder} />;
            case 'orderDelivered':
                 if (!currentOrderForView) return null;
                return <OrderDeliveredScreen order={currentOrderForView} onBack={() => handleNavigate('selectPractitioner')} />;
            case 'selectPractitioner':
            default:
                return (
                    <div>
                        {activeOrder && <ActiveOrderBanner order={activeOrder} onNavigate={handleNavigate} />}
                        
                        <Card className="mb-6 !p-4 bg-gray-50 border border-gray-200">
                            <form onSubmit={handleShortlinkSearch} className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-grow w-full">
                                    <Input 
                                        id="shortlink"
                                        label="มีรหัส หรือ Link ของผู้ให้คำปรึกษา?"
                                        placeholder="กรอกรหัสที่นี่..."
                                        value={shortlinkInput}
                                        onChange={(e) => setShortlinkInput(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full sm:w-auto !py-3">
                                    ค้นหา
                                </Button>
                            </form>
                        </Card>

                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">เลือกผู้ให้คำปรึกษา</h1>
                            <Button onClick={() => handleNavigate('profile')} variant="light" className="w-auto px-6 !py-2">จัดการโปรไฟล์</Button>
                        </div>
                        <PractitionerSelectionScreen onSelect={handleSelectPractitioner} />
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            {renderContent()}
            {selectedPractitioner && (
                <PreliminaryInfoModal 
                    isOpen={isPreliminaryModalOpen} 
                    onClose={() => {
                        setIsPreliminaryModalOpen(false);
                        if (initialPractitioner) {
                            window.history.pushState({}, '', '/');
                            setSelectedPractitioner(null);
                        }
                    }}
                    onSubmit={handleSubmitPreliminaryInfo}
                    patient={patient}
                />
            )}
            {preliminaryInfo && (
                 <ConsultationTypeModal
                    isOpen={isConsultationTypeModalOpen}
                    onClose={() => setIsConsultationTypeModalOpen(false)}
                    onSelect={handleSelectConsultationType}
                />
            )}
        </div>
    );
};