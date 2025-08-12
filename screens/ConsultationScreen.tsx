
import React, { useState, useEffect } from 'react';
import { MOCK_ALL_CENTRAL_PRODUCTS, MOCK_LOCAL_INVENTORY_101 } from '../constants';
import type { Practitioner, Consultation, Order, OrderItem, Product } from '../types';
import { OrderStatus, PractitionerType, FulfillmentSource, ConsultationType } from '../types';
import { Card, Button, Textarea, Input, Modal } from '../components/ui';
import { SpinnerIcon, SparklesIcon, PlusIcon } from '../components/Icons';
import { generatePractitionerDraft } from '../services/geminiService';


// --- MOCK INTERACTION PANEL ---

const MockInteractionPanel = ({ consultation }: { consultation: Consultation }) => {
    
    const VideoCallUI = () => (
        <Card className="h-full flex flex-col bg-gray-900 !p-4">
            <div className="relative flex-grow bg-gray-800 rounded-lg flex items-center justify-center">
                <img src={consultation.patient.avatarUrl} className="w-32 h-32 rounded-full opacity-50 object-cover" alt="Patient"/>
                <p className="absolute text-white font-bold text-lg">Patient Video</p>
                <div className="absolute top-4 right-4 w-28 h-20 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                     <p className="text-white text-xs">Your Video</p>
                </div>
            </div>
            <div className="flex-shrink-0 pt-4 flex justify-center items-center gap-4">
                <button className="w-12 h-12 bg-gray-700 rounded-full text-white flex items-center justify-center">🎤</button>
                <button className="w-12 h-12 bg-gray-700 rounded-full text-white flex items-center justify-center">📹</button>
                <button className="w-14 h-14 bg-red-600 rounded-full text-white flex items-center justify-center">📞</button>
            </div>
        </Card>
    );

    const VoiceCallUI = () => {
         const [timer, setTimer] = useState(0);
         useEffect(() => {
            const interval = setInterval(() => setTimer(t => t + 1), 1000);
            return () => clearInterval(interval);
        }, []);

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        }
        return (
             <Card className="h-full flex flex-col items-center justify-center bg-green-50">
                <img src={consultation.patient.avatarUrl} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" alt="Patient"/>
                <h3 className="text-2xl font-bold mt-4">{consultation.patient.name}</h3>
                <p className="text-gray-500 mt-1">Voice Call</p>
                <p className="text-2xl font-mono text-gray-700 mt-6 bg-white px-4 py-2 rounded-lg shadow-inner">{formatTime(timer)}</p>
                 <button className="mt-8 w-16 h-16 bg-red-600 rounded-full text-white flex items-center justify-center shadow-lg">📞</button>
            </Card>
        );
    };

    const TextChatUI = () => {
        const [messages, setMessages] = useState([
            { text: `สวัสดีค่ะคุณหมอ มีอาการ ${consultation.preliminaryInfo.symptoms} ค่ะ ควรทำยังไงดีคะ`, sender: 'patient' },
            { text: 'สวัสดีครับ จากอาการที่เล่ามา เดี๋ยวขออนุญาตจัดยาและเขียนคำแนะนำให้นะครับ', sender: 'practitioner' },
        ]);
        const [newMessage, setNewMessage] = useState('');

        const handleSendMessage = (e: React.FormEvent) => {
            e.preventDefault();
            if (newMessage.trim() === '') return;
            setMessages(prev => [...prev, { text: newMessage, sender: 'practitioner' }]);
            setNewMessage('');
        };

        return (
            <Card className="h-full flex flex-col !p-0">
                <div className="p-4 border-b">
                    <h3 className="font-bold">{consultation.patient.name}</h3>
                    <p className="text-sm text-gray-500">Text Chat</p>
                </div>
                <div className="flex-grow p-4 space-y-4 bg-gray-50 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'practitioner' ? 'justify-end' : ''}`}>
                            <div className={`${msg.sender === 'practitioner' ? 'bg-blue-500 text-white' : 'bg-white'} p-3 rounded-lg max-w-xs shadow-sm`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            placeholder="พิมพ์ข้อความ..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full border rounded-full p-3 pr-16 bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </Card>
        );
    };


    switch(consultation.type) {
        case ConsultationType.VIDEO: return <VideoCallUI />;
        case ConsultationType.VOICE: return <VoiceCallUI />;
        case ConsultationType.CHAT: return <TextChatUI />;
        default: return <Card>รูปแบบการปรึกษาไม่ถูกต้อง</Card>;
    }
};


// --- PRACTITIONER TOOLS ---

const PRACTITIONER_COMMISSION_RATE = 0.20;

const DiscountModal = ({ isOpen, onClose, onSubmit, item }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (discountPercent: number) => void;
    item: OrderItem;
}) => {
    if (!isOpen) return null;
    const discountOptions = [0, 25, 50, 100];
    
    const commission = item.product.price * item.quantity * PRACTITIONER_COMMISSION_RATE;
    
    const currentDiscountPercent = item.practitionerDiscount && commission > 0 
        ? Math.round((item.practitionerDiscount / commission) * 100) 
        : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`มอบส่วนลดสำหรับ ${item.product.name}`}>
            <div className="space-y-4">
                <p className="text-gray-600">
                    คุณจะได้รับส่วนแบ่ง 20% ({commission.toLocaleString()} บาท) จากผลิตภัณฑ์นี้
                    เลือกเปอร์เซ็นต์ของส่วนแบ่งที่คุณจะมอบให้ผู้ป่วยเป็นส่วนลด
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {discountOptions.map(percent => (
                        <Button 
                            key={percent} 
                            onClick={() => onSubmit(percent)}
                            variant={currentDiscountPercent === percent ? 'primary' : 'light'}
                        >
                            {percent === 0 ? 'ไม่ลด' : `${percent}%`}
                        </Button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};


export const ConsultationScreen = ({ 
    consultation, 
    practitioner,
    onEndConsultation 
}: { 
    consultation: Consultation; 
    practitioner: Practitioner;
    onEndConsultation: (order: Order) => void; 
}) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [soapNote, setSoapNote] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedProducts, setSuggestedProducts] = useState<string[]>([]);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [editingDiscountItem, setEditingDiscountItem] = useState<OrderItem | null>(null);
    
    const isFacilityBased = practitioner.practitionerType === PractitionerType.FACILITY_BASED;
    const [activeCatalog, setActiveCatalog] = useState<FulfillmentSource>(FulfillmentSource.CENTRAL);

    const centralProductsForPractitioner = MOCK_ALL_CENTRAL_PRODUCTS.filter(p => p.distributorId === practitioner.chosenDistributorId);
    
    const availableProducts = isFacilityBased 
        ? (activeCatalog === FulfillmentSource.LOCAL ? MOCK_LOCAL_INVENTORY_101 : centralProductsForPractitioner)
        : centralProductsForPractitioner;

    const filteredProducts = availableProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addProduct = (product: Product) => {
        setOrderItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1, practitionerDiscount: 0 }];
        });
    };

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        setSuggestedProducts([]);
        try {
            const result = await generatePractitionerDraft(consultation.preliminaryInfo, practitioner, availableProducts);
            if (result) {
                setSoapNote(result.soapNote);
                setSuggestedProducts(result.suggestedProducts);
            }
        } catch (error) {
            console.error("Error generating draft with AI", error);
            alert("เกิดข้อผิดพลาดในการสร้างฉบับร่างด้วย AI กรุณาลองใหม่");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenDiscountModal = (item: OrderItem) => {
        setEditingDiscountItem(item);
        setIsDiscountModalOpen(true);
    };

    const handleApplyDiscount = (discountPercent: number) => {
        if (!editingDiscountItem) return;

        const commission = editingDiscountItem.product.price * editingDiscountItem.quantity * PRACTITIONER_COMMISSION_RATE;
        const discountAmount = commission * (discountPercent / 100);

        setOrderItems(prevItems => prevItems.map(item => {
            if (item.product.id === editingDiscountItem.product.id) {
                return { ...item, practitionerDiscount: discountAmount };
            }
            return item;
        }));
        
        setIsDiscountModalOpen(false);
        setEditingDiscountItem(null);
    };

    const productsCost = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const consultationFee = practitioner.consultationFee || 0;
    const totalDiscount = orderItems.reduce((sum, item) => sum + (item.practitionerDiscount || 0), 0);
    const totalCost = productsCost + consultationFee - totalDiscount;

    const handleSendToPatient = () => {
        if (orderItems.length === 0 && !soapNote) {
            alert('กรุณาเลือกผลิตภัณฑ์หรือเขียนคำแนะนำอย่างน้อย 1 รายการ');
            return;
        }
        
        const fulfillmentSource = orderItems.length > 0 ? orderItems[0].product.source : activeCatalog;

        const newOrder: Order = {
            id: `ORD-SIM-${Date.now()}`,
            patient: consultation.patient,
            practitioner,
            items: orderItems,
            productsCost,
            consultationFee,
            totalDiscount,
            totalCost,
            status: OrderStatus.PAYMENT_PENDING,
            soapNote,
            fulfillmentSource,
        };
        onEndConsultation(newOrder);
    };

    return (
        <div className="animate-fade-in">
             <h1 className="text-3xl font-bold text-gray-800 mb-6">ให้คำปรึกษา: {consultation.patient.name}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                {/* Left Panel: Mock Interaction */}
                <div className="lg:col-span-2 h-[80vh]">
                     <MockInteractionPanel consultation={consultation} />
                </div>

                {/* Right Panel: Practitioner Tools */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                             <Card>
                                <h2 className="text-xl font-bold mb-4">ข้อมูลจากผู้ป่วย</h2>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
                                     <p><strong>อาการ:</strong> {consultation.preliminaryInfo.symptoms || 'ไม่ได้ระบุ'}</p>
                                    <p><strong>ข้อมูลสุขภาพ:</strong> D: {consultation.preliminaryInfo.diseases || 'N/A'}, A: {consultation.preliminaryInfo.allergies || 'N/A'}, W: {consultation.preliminaryInfo.weight || 'N/A'} kg, H: {consultation.preliminaryInfo.height || 'N/A'} cm</p>
                                </div>
                            </Card>
                            <Card>
                                 <div className="flex justify-between items-center mb-4">
                                     <h2 className="text-xl font-bold">บันทึกและคำแนะนำ (SOAP Note)</h2>
                                     <Button onClick={handleGenerateDraft} disabled={isGenerating} variant="light" className="w-auto px-4 py-2">
                                        {isGenerating ? <SpinnerIcon /> : <SparklesIcon />}
                                        <span>สร้างฉบับร่างด้วย AI</span>
                                    </Button>
                                 </div>
                                <Textarea 
                                    id="soapNote" label="" placeholder="S: อาการสำคัญ..." value={soapNote} 
                                    onChange={(e) => setSoapNote(e.target.value)} rows={8}
                                    className="bg-gray-800 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
                                />
                            </Card>

                            <Card>
                                <h3 className="font-bold text-lg mb-3">เลือกรายการผลิตภัณฑ์</h3>
                                
                                {isFacilityBased && (
                                     <div className="flex border border-gray-300 rounded-lg p-1 mb-4 bg-gray-50">
                                        <button onClick={() => setActiveCatalog(FulfillmentSource.CENTRAL)} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${activeCatalog === FulfillmentSource.CENTRAL ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>
                                            คลังกลาง (Distributor)
                                        </button>
                                        <button onClick={() => setActiveCatalog(FulfillmentSource.LOCAL)} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${activeCatalog === FulfillmentSource.LOCAL ? 'bg-green-600 text-white shadow' : 'text-gray-500'}`}>
                                            คลังยาของร้าน
                                        </button>
                                    </div>
                                )}

                                {suggestedProducts.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2"><SparklesIcon/> AI แนะนำ</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedProducts.map(productName => {
                                                const product = availableProducts.find(p => p.name === productName);
                                                return product ? (
                                                <button key={product.id} onClick={() => addProduct(product)} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 flex items-center gap-1">
                                                    <PlusIcon className="w-4 h-4" /> {product.name}
                                                </button>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                                <Input 
                                    id="productSearch" label="" type="text" placeholder="ค้นหา..." 
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                                <div className="max-h-96 overflow-y-auto mt-4 space-y-2 pr-2">
                                   {filteredProducts.map(product => (
                                       <div key={product.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
                                           <span>{product.name} - {product.price} บาท</span>
                                           <button onClick={() => addProduct(product)} className="text-xl bg-blue-100 text-blue-700 font-bold h-8 w-8 rounded-full hover:bg-blue-200">
                                               <PlusIcon className="w-5 h-5"/>
                                           </button>
                                       </div>
                                   ))}
                                   {filteredProducts.length === 0 && <p className="text-gray-500 text-center py-4">ไม่พบรายการ</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <Card>
                                    <h3 className="font-bold text-lg border-b pb-3 mb-3">สรุปรายการ</h3>
                                    <div className="space-y-3 min-h-[150px]">
                                        {orderItems.length === 0 ? (
                                            <p className="text-gray-500 text-center pt-12">ยังไม่มีรายการ</p>
                                        ) : (
                                            orderItems.map(item => (
                                                <div key={item.product.id} className="text-sm border-b border-gray-100 pb-3 mb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{item.product.name}</p>
                                                            <p className="text-gray-500">x {item.quantity}</p>
                                                        </div>
                                                        <p className="font-medium">{(item.product.price * item.quantity).toLocaleString()} บาท</p>
                                                    </div>
                                                    {item.practitionerDiscount && item.practitionerDiscount > 0 && (
                                                         <p className="text-xs text-green-600 text-right">- ส่วนลด {item.practitionerDiscount.toLocaleString()} บาท</p>
                                                    )}
                                                    {item.product.source === FulfillmentSource.CENTRAL && (
                                                        <div className="text-right mt-1">
                                                            <button
                                                                onClick={() => handleOpenDiscountModal(item)}
                                                                className="text-xs text-blue-600 hover:underline font-semibold"
                                                            >
                                                               {item.practitionerDiscount ? 'แก้ไขส่วนลด' : 'มอบส่วนลด'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="border-t pt-4 mt-4 space-y-2">
                                        <div className="flex justify-between"><span>ค่าผลิตภัณฑ์</span><span>{productsCost.toLocaleString()} บาท</span></div>
                                        <div className="flex justify-between"><span>ค่าปรึกษา</span><span>{consultationFee.toLocaleString()} บาท</span></div>
                                         {totalDiscount > 0 && (
                                            <div className="flex justify-between text-green-600 font-medium">
                                                <span>ส่วนลดรวมจากคุณ</span>
                                                <span>- {totalDiscount.toLocaleString()} บาท</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-xl mt-2">
                                            <span>รวม:</span>
                                            <span>{totalCost.toLocaleString()} บาท</span>
                                        </div>
                                        <Button onClick={handleSendToPatient} variant="primary" className="mt-4">ส่งให้ผู้ป่วย</Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
                onSubmit={handleApplyDiscount}
                item={editingDiscountItem!}
            />
        </div>
    );
};
