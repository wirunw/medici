import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_PRACTITIONERS, MOCK_PATIENTS } from './constants';
import { UserRole } from './types';
import type { Patient, Practitioner, Consultation, Order } from './types';
import { PatientApp, PractitionerLandingPage } from './screens/PatientApp';
import { PractitionerApp } from './screens/PractitionerApp';
import { AuthScreen } from './screens/AuthScreen';
import { LogoutIcon } from './components/Icons';

// --- SHARED COMPONENTS ---
const Header = ({ user, onLogout }: { user: Patient | Practitioner; onLogout: () => void }) => {
  const isPatient = user.role === UserRole.PATIENT;
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        <div className={`text-2xl font-bold ${isPatient ? 'text-blue-800' : 'text-green-800'}`}>
          Medici
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-medium text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">
              {isPatient ? 'ผู้ป่วย' : `${(user as Practitioner).practitionerRole} @ ${(user as Practitioner).facilityName || 'Independent'}`}
            </div>
          </div>
          <img src={user.avatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover" />
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100" title="ออกจากระบบ">
            <LogoutIcon className="text-gray-600 h-6 w-6"/>
          </button>
        </div>
      </nav>
    </header>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<Patient | Practitioner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [targetedPractitioner, setTargetedPractitioner] = useState<Practitioner | null>(null);

  useEffect(() => {
    // Handle affiliate link routing
    const path = window.location.pathname;
    const match = path.match(/\/ph\/(.+)/);
    if (match) {
        const affiliateId = match[1];
        const practitioner = MOCK_PRACTITIONERS.find(p => p.affiliateId === affiliateId);
        if (practitioner) {
            setTargetedPractitioner(practitioner);
        }
    }
  }, []);

  const handleLogin = (loggedInUser: Patient | Practitioner) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setOrders([]);
    setConsultations([]);
    setTargetedPractitioner(null);
    window.history.pushState({}, '', '/');
  };
  
  const handleUpdateUser = useCallback((updatedUser: Patient | Practitioner) => {
      setUser(updatedUser);
  }, []);

  const addOrder = useCallback((newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  }, []);
  
  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...updates } : o)));
  }, []);

  const addConsultation = useCallback((newConsultation: Consultation) => {
    setConsultations(prev => [newConsultation, ...prev]);
  }, []);

  const updateConsultationStatus = useCallback((consultationId: number, status: 'active' | 'finished') => {
      setConsultations(prev => {
        const newConsultations = prev.map(c => c.id === consultationId ? {...c, status} : c);
        // In a real app, you might not filter, but just change status.
        // Filtering removes it from the queue visually.
        if (status === 'finished') {
          return newConsultations.filter(c => c.id !== consultationId);
        }
        return newConsultations;
      });
  }, []);

  // Show landing page if accessed via affiliate link and not logged in
  if (targetedPractitioner && !user) {
    return <PractitionerLandingPage 
              practitioner={targetedPractitioner} 
              onStartConsultation={() => setUser(MOCK_PATIENTS[0])} // Simulate login
           />;
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} targetedPractitioner={targetedPractitioner} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Header user={user} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {user.role === UserRole.PATIENT && 
            <PatientApp 
                patient={user as Patient} 
                orders={orders.filter(o => o.patient.id === user.id)}
                onUpdateUser={handleUpdateUser as (u: Patient) => void}
                addConsultation={addConsultation}
                updateOrder={updateOrder}
                addOrder={addOrder}
                initialPractitioner={targetedPractitioner}
            />}
        {user.role === UserRole.PRACTITIONER && 
            <PractitionerApp 
                practitioner={user as Practitioner} 
                consultations={consultations.filter(c => c.practitioner.id === user.id)}
                orders={orders.filter(o => o.practitioner.id === user.id)}
                onUpdateUser={handleUpdateUser as (u: Practitioner) => void} 
                addOrder={addOrder}
                addConsultation={addConsultation}
                updateOrderStatus={updateOrder}
                updateConsultationStatus={updateConsultationStatus}
            />}
      </main>
    </div>
  );
}