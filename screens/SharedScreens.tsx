
import React, { useState, useEffect } from 'react';
import { Practitioner, Patient, UserRole, PractitionerRole, PractitionerType, Distributor } from '../types';
import { Card, Button, Input, Textarea, Select } from '../components/ui';
import { THAI_PROVINCES, MOCK_DISTRIBUTORS } from '../constants';

export const ProfileScreen = ({ user, onSave, onBack, onNavigateToInventory }: { 
    user: Patient | Practitioner; 
    onSave: (updatedUser: Patient | Practitioner) => void, 
    onBack: () => void,
    onNavigateToInventory?: () => void 
}) => {
    const [formData, setFormData] = useState(user);
    const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);

    const darkInputStyle = "bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500";

    const isIndependent = user.role === UserRole.PRACTITIONER && user.practitionerType === PractitionerType.INDEPENDENT;

    useEffect(() => {
        if (isIndependent) {
            const practitioner = formData as Practitioner;
            if (practitioner.serviceProvince) {
                const available = MOCK_DISTRIBUTORS.filter(d => d.province === practitioner.serviceProvince);
                setFilteredDistributors(available);
            } else {
                setFilteredDistributors([]);
            }
        }
    }, [isIndependent, formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: name === 'consultationFee' || name === 'chosenDistributorId' ? Number(value) || 0 : value
            } as Patient | Practitioner;

            // If province changes, reset distributor choice
            if (name === 'serviceProvince' && updated.role === UserRole.PRACTITIONER) {
                (updated as Practitioner).chosenDistributorId = undefined;
            }

            return updated;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        alert('บันทึกข้อมูลสำเร็จ!');
        onBack();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">จัดการโปรไฟล์</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <div>
                             <h2 className="text-2xl font-bold">{formData.name}</h2>
                             <p className="text-gray-500">{formData.email}</p>
                        </div>
                    </div>
                    
                    <div className="border-t pt-6">
                        {/* PRACTITIONER FIELDS */}
                        {formData.role === UserRole.PRACTITIONER && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input id="name" label="ชื่อ-นามสกุล" name="name" value={formData.name} onChange={handleChange} className={darkInputStyle} />
                            <Input id="specialty" label="ความเชี่ยวชาญพิเศษ (คั่นด้วยจุลภาค)" name="specialty" value={(formData as Practitioner).specialty} onChange={handleChange} className={darkInputStyle} />
                            
                            {(formData as Practitioner).practitionerType === PractitionerType.FACILITY_BASED && (
                                <Input id="facilityName" label="ชื่อสถานบริการ" name="facilityName" value={(formData as Practitioner).facilityName || ''} onChange={handleChange} className={darkInputStyle}/>
                            )}
                            {(formData as Practitioner).practitionerType === PractitionerType.INDEPENDENT && (
                                <Input id="consultationFee" label="ค่าบริการให้คำปรึกษา (บาท)" name="consultationFee" type="number" value={(formData as Practitioner).consultationFee || ''} onChange={handleChange} className={darkInputStyle}/>
                            )}
                            
                            {isIndependent && (
                                <>
                                    <Select id="serviceProvince" name="serviceProvince" label="จังหวัดที่ให้บริการ" value={(formData as Practitioner).serviceProvince || ''} onChange={handleChange} className={darkInputStyle}>
                                        <option value="">-- เลือกจังหวัด --</option>
                                        {THAI_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </Select>

                                    <Select id="chosenDistributorId" name="chosenDistributorId" label="เลือกคลังยาหลัก" value={(formData as Practitioner).chosenDistributorId || ''} onChange={handleChange} className={darkInputStyle} disabled={filteredDistributors.length === 0}>
                                        <option value="">-- เลือกคลังยา --</option>
                                        {filteredDistributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </Select>
                                </>
                            )}

                            <Textarea id="bio" label="เกี่ยวกับฉัน (Bio)" name="bio" value={(formData as Practitioner).bio} onChange={handleChange} rows={4} className={`md:col-span-2 ${darkInputStyle}`}/>
                          </div>
                        )}

                         {/* PATIENT FIELDS */}
                         {formData.role === UserRole.PATIENT && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input id="nationalId" label="หมายเลขบัตรประชาชน" name="nationalId" value={(formData as Patient).nationalId} onChange={handleChange} />
                                <Input id="phone" label="เบอร์โทรศัพท์" name="phone" value={(formData as Patient).phone} onChange={handleChange} />
                                <Input id="drugAllergies" label="ประวัติการแพ้ยา" name="drugAllergies" value={(formData as Patient).drugAllergies} onChange={handleChange} />
                                <Textarea id="chronicDiseases" label="โรคประจำตัว" name="chronicDiseases" value={(formData as Patient).chronicDiseases} onChange={handleChange} rows={3}/>
                                <Textarea id="address" label="ที่อยู่สำหรับจัดส่ง" name="address" value={(formData as Patient).address} onChange={handleChange} rows={3} className="md:col-span-2"/>
                            </div>
                        )}
                    </div>

                    {user.role === UserRole.PRACTITIONER && user.practitionerType === PractitionerType.FACILITY_BASED && (
                         <div className="pt-6 border-t">
                             <h3 className="text-lg font-semibold text-gray-800 mb-2">คลังผลิตภัณฑ์ของสถานบริการ</h3>
                             <p className="text-gray-600 mb-4">จัดการรายการยาและผลิตภัณฑ์ที่มีในร้านของคุณ</p>
                             <Button onClick={onNavigateToInventory} type="button" variant="secondary" className="w-auto px-6">จัดการคลังยา (Inventory)</Button>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-6 border-t">
                        <Button onClick={onBack} variant="ghost" className="w-auto px-8">ย้อนกลับ</Button>
                        <Button type="submit" className="w-auto px-8" variant="primary">บันทึกการเปลี่ยนแปลง</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


export const InventoryManagementScreen = ({ onBack }: { onBack: () => void }) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            alert(`จำลองการอัปโหลดไฟล์: ${file.name}\nในแอปจริง, ระบบจะทำการอ่านและเพิ่มข้อมูลจากไฟล์ CSV นี้เข้าสู่คลังยาของร้านคุณ`);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">จัดการคลังยาและผลิตภัณฑ์</h1>
            <Card>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">อัปโหลดรายการยา (CSV)</h2>
                    <p className="text-gray-600">
                        อัปโหลดไฟล์ CSV ที่มีรายการยาและผลิตภัณฑ์ในร้านของคุณ ไฟล์ควรมีคอลัมน์: `id`, `name`, `price`, `description`, `category`
                    </p>
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <Input id="csvUpload" label="" type="file" accept=".csv" onChange={handleFileUpload} className="w-full" />
                    </div>
                     <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold">ตัวอย่างรูปแบบไฟล์ CSV:</h3>
                        <pre className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">
                            <code>
{`id,name,price,description,category
2001,Paracetamol 500mg,10,บรรเทาปวด ลดไข้,dangerous_drug
2002,Amoxicillin 500mg,50,ยาปฏิชีวนะ,dangerous_drug
1001,Vitamin C 1000mg,130,วิตามินซี,general_health`}
                            </code>
                        </pre>
                    </div>
                </div>
                <div className="flex justify-start pt-6 mt-6 border-t">
                    <Button onClick={onBack} variant="ghost" className="w-auto px-8">กลับไปหน้าโปรไฟล์</Button>
                </div>
            </Card>
        </div>
    )
};
