import React, { useState, useEffect } from 'react';
import { MOCK_PATIENTS, MOCK_PRACTITIONERS } from '../constants';
import { UserRole, PractitionerRole, PractitionerType } from '../types';
import type { Patient, Practitioner } from '../types';
import { Card, Button, Select } from '../components/ui';

interface AuthScreenProps {
    onLogin: (user: Patient | Practitioner) => void;
    targetedPractitioner?: Practitioner | null;
}

export const AuthScreen = ({ onLogin, targetedPractitioner }: AuthScreenProps) => {
    const [userRole, setUserRole] = useState<UserRole>(UserRole.PATIENT);
    const [practitionerRole, setPractitionerRole] = useState<PractitionerRole>(PractitionerRole.PHARMACIST);
    const [practitionerType, setPractitionerType] = useState<PractitionerType>(PractitionerType.INDEPENDENT);

    useEffect(() => {
        if (targetedPractitioner) {
            setUserRole(UserRole.PATIENT);
        }
    }, [targetedPractitioner]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (userRole === UserRole.PATIENT) {
            onLogin(MOCK_PATIENTS[0]);
        } else {
            // Find a mock practitioner that matches the selected criteria for demo purposes
            const mockLogin = MOCK_PRACTITIONERS.find(p => 
                p.practitionerRole === practitionerRole && p.practitionerType === practitionerType
            ) || MOCK_PRACTITIONERS[1]; // Fallback to a default practitioner
            onLogin(mockLogin);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full">
                {targetedPractitioner && (
                    <div className="mb-4 text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-800">เพื่อปรึกษากับ {targetedPractitioner.name}</p>
                        <p className="text-sm text-blue-600">กรุณาเข้าสู่ระบบในฐานะผู้ป่วย</p>
                    </div>
                )}
                <Card className="animate-fade-in-down">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-blue-800">Medici</h1>
                        <p className="text-gray-500 mt-2">The Unified Health Consultation Platform</p>
                    </div>

                    {/* Role Selection */}
                    <div className={`flex border border-gray-300 rounded-lg p-1 mb-6 bg-gray-50 ${targetedPractitioner ? 'hidden' : ''}`}>
                        <button onClick={() => setUserRole(UserRole.PATIENT)} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${userRole === UserRole.PATIENT ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>สำหรับผู้ป่วย</button>
                        <button onClick={() => setUserRole(UserRole.PRACTITIONER)} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${userRole === UserRole.PRACTITIONER ? 'bg-green-600 text-white shadow' : 'text-gray-500'}`}>สำหรับบุคลากรฯ</button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {userRole === UserRole.PRACTITIONER && (
                            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <Select id="practitionerRole" label="เลือกบทบาทของคุณ" value={practitionerRole} onChange={e => setPractitionerRole(e.target.value as PractitionerRole)}>
                                    <option value={PractitionerRole.DOCTOR}>แพทย์ (Doctor)</option>
                                    <option value={PractitionerRole.PHARMACIST}>เภสัชกร (Pharmacist)</option>
                                    <option value={PractitionerRole.NURSE}>พยาบาล (Nurse)</option>
                                </Select>
                                <Select id="practitionerType" label="เลือกประเภทการทำงาน" value={practitionerType} onChange={e => setPractitionerType(e.target.value as PractitionerType)}>
                                    <option value={PractitionerType.INDEPENDENT}>ผู้ประกอบวิชาชีพอิสระ (Independent)</option>
                                    <option value={PractitionerType.FACILITY_BASED}>ประจำสถานบริการ (Facility-Based)</option>
                                </Select>
                            </div>
                        )}
                        <p className="text-center text-gray-500">
                            นี่คือหน้าจำลอง, กดปุ่มด้านล่างเพื่อดำเนินการต่อ
                        </p>
                        <Button type="submit" variant={userRole === UserRole.PATIENT ? 'primary' : 'secondary'}>
                            เข้าสู่ระบบในฐานะ {userRole === UserRole.PATIENT ? 'ผู้ป่วย' : `${practitionerRole} (${practitionerType})`}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};