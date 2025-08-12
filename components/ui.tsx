import React, { ReactNode } from 'react';
import { CloseIcon } from './Icons';

// --- UI COMPONENTS ---

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
export const Card = ({ children, className = '', onClick }: CardProps) => (
  <div onClick={onClick} className={`bg-white p-6 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'light';
  type?: 'button' | 'submit';
  disabled?: boolean;
}
export const Button = ({ children, onClick, className = '', variant = 'primary', type = 'button', disabled = false }: ButtonProps) => {
  const baseClasses = 'w-full font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    light: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
  };
  return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

// --- FIXED ---
// เปลี่ยนจากการใช้ `extends` มาเป็น Intersection Type (`&`) เพื่อแก้ปัญหา Type Inference
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
export const Input = ({ label, ...props }: InputProps) => (
  <div>
    <label htmlFor={props.id} className="block font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />
  </div>
);

// --- FIXED ---
// ใช้วิธีเดียวกับ Input
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};
export const Textarea = ({ label, ...props }: TextareaProps) => (
    <div>
        <label htmlFor={props.id} className="block font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} />
    </div>
);

// --- FIXED ---
// ใช้วิธีเดียวกับ Input
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};
export const Select = ({ label, children, ...props }: SelectProps) => (
    <div>
        <label htmlFor={props.id} className="block font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <select
                {...props}
                className={`w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 ${props.className || ''}`}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l2.97-2.91a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
