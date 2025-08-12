// --- USER & PRACTITIONER ROLES ---

export enum UserRole {
  PATIENT = 'patient',
  PRACTITIONER = 'practitioner',
}

export enum PractitionerRole {
  DOCTOR = 'doctor',
  PHARMACIST = 'pharmacist',
  NURSE = 'nurse',
}

export enum PractitionerType {
  INDEPENDENT = 'independent',
  FACILITY_BASED = 'facility_based',
}

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

// --- PRODUCT & ORDER ---

export enum ProductCategory {
  GENERAL_HEALTH = 'general_health', // Supplements, Cosmetics
  MEDICAL_DEVICE = 'medical_device',
  DANGEROUS_DRUG = 'dangerous_drug', // Requires prescription
  CONTROLLED_DRUG = 'controlled_drug',
  COSMETIC = 'cosmetic',
}

export enum FulfillmentSource {
    CENTRAL = 'central',
    LOCAL = 'local'
}

export enum ConsultationType {
  VIDEO = 'Video Call',
  VOICE = 'Voice Call',
  CHAT = 'Text Chat',
}

export enum DeliveryMethod {
  EXPRESS = 'express',
  PICKUP = 'pickup',
  FACILITY_DELIVERY = 'facility_delivery',
  CENTRAL_DELIVERY = 'central_delivery', // For central catalog items
}

export enum OrderStatus {
  PAYMENT_PENDING = 'payment_pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  READY_FOR_PICKUP = 'ready_for_pickup',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
}


// --- BASE INTERFACES ---

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
}

export interface Distributor {
  id: number;
  name: string;
  province: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: ProductCategory;
  source: FulfillmentSource;
  distributorId?: number; // Link to Distributor
}

// --- PATIENT-SPECIFIC ---

export interface Patient extends User {
  role: UserRole.PATIENT;
  drugAllergies: string;
  chronicDiseases: string;
  address: string;
  nationalId: string;
  phone: string;
}

// --- PRACTITIONER-SPECIFIC ---

export interface Practitioner extends User {
  role: UserRole.PRACTITIONER;
  practitionerRole: PractitionerRole;
  practitionerType: PractitionerType;
  verificationStatus: VerificationStatus;
  specialty: string;
  affiliateId: string;
  bio: string;
  consultationFee?: number; // Only for Independent
  facilityName?: string; // Only for Facility-Based
  serviceProvince?: string; // For Independent to choose their service area
  chosenDistributorId?: number; // For Independent to choose their primary warehouse
}

// You can create specific types if needed, but Practitioner can be generic enough
export type Doctor = Practitioner & { practitionerRole: PractitionerRole.DOCTOR };
export type Pharmacist = Practitioner & { practitionerRole: PractitionerRole.PHARMACIST };
export type Nurse = Practitioner & { practitionerRole: PractitionerRole.NURSE };


// --- TRANSACTIONAL INTERFACES ---

export interface PreliminaryInfo {
  symptoms: string;
  diseases: string;
  allergies: string;
  weight?: string;
  height?: string;
}

export interface Consultation {
  id: number;
  patient: Patient;
  practitioner: Practitioner;
  type: ConsultationType;
  preliminaryInfo: PreliminaryInfo;
  status: 'pending' | 'active' | 'finished';
}

export interface OrderItem {
  product: Product;
  quantity: number;
  practitionerDiscount?: number; // FR-3.3
}

export interface MessengerInfo {
  driverName: string;
  driverPhone: string;
  bookingNumber: string;
}

export interface Order {
  id: string;
  patient: Patient;
  practitioner: Practitioner;
  items: OrderItem[];
  consultationFee: number;
  productsCost: number;
  totalDiscount: number;
  totalCost: number;
  status: OrderStatus;
  soapNote?: string;
  fulfillmentSource: FulfillmentSource;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  shippingCost?: number;
  messengerInfo?: MessengerInfo;
}

export interface OrderStatusDetail {
  text: string;
  icon: string;
  step: number;
  deliveryText?: string;
  pickupText?: string;
}