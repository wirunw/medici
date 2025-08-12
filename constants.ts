import { Practitioner, Patient, Product, OrderStatus, OrderStatusDetail, UserRole, PractitionerRole, PractitionerType, ProductCategory, FulfillmentSource, Distributor, VerificationStatus } from './types';

export const MOCK_DISTRIBUTORS: Distributor[] = [
  { id: 1, name: 'คลังยา กรุงเทพและปริมณฑล', province: 'กรุงเทพมหานคร' },
  { id: 2, name: 'คลังยาภาคเหนือ (เชียงใหม่)', province: 'เชียงใหม่' },
  { id: 3, name: 'คลังยาภาคอีสาน (ขอนแก่น)', province: 'ขอนแก่น' },
  { id: 4, name: 'คลังยาภาคใต้ (สงขลา)', province: 'สงขลา' },
];

export const MOCK_PRACTITIONERS: Practitioner[] = [
  {
    id: 101,
    name: 'ภก. สมชาย ใจดี',
    email: 'somchai.p@pharmacy.co',
    avatarUrl: 'https://picsum.photos/id/1005/200/200',
    role: UserRole.PRACTITIONER,
    practitionerRole: PractitionerRole.PHARMACIST,
    practitionerType: PractitionerType.FACILITY_BASED,
    verificationStatus: VerificationStatus.VERIFIED,
    facilityName: 'ร้านยาใจดี',
    specialty: 'ยาโรคหัวใจ, ยานอกบัญชี, อาหารทางการแพทย์',
    affiliateId: 'somchai-jaidee',
    bio: 'เภสัชกรผู้เชี่ยวชาญด้านการจัดการยาในผู้ป่วยโรคเรื้อรัง มีประสบการณ์กว่า 15 ปีในการให้คำปรึกษาเรื่องยาเฉพาะทางและอาหารทางการแพทย์เพื่อคุณภาพชีวิตที่ดีขึ้นของผู้ป่วย',
    serviceProvince: 'กรุงเทพมหานคร',
    chosenDistributorId: 1,
  },
  {
    id: 102,
    name: 'พญ. จินตนา สุขใจ',
    email: 'jintana.s@clinic.th',
    avatarUrl: 'https://picsum.photos/id/1011/200/200',
    role: UserRole.PRACTITIONER,
    practitionerRole: PractitionerRole.DOCTOR,
    practitionerType: PractitionerType.INDEPENDENT,
    verificationStatus: VerificationStatus.VERIFIED,
    consultationFee: 500,
    specialty: 'โรคผิวหนัง, เวชสำอาง, Anti-Aging',
    affiliateId: 'jintana-sukjai',
    bio: 'แพทย์ผู้เชี่ยวชาญด้านผิวหนังและความงาม ให้คำปรึกษาปัญหาผิวและแนะนำแนวทางการดูแลผิวแบบองค์รวมด้วยผลิตภัณฑ์ที่เหมาะสมและปลอดภัย',
    serviceProvince: 'เชียงใหม่',
    chosenDistributorId: 2,
  },
   {
    id: 103,
    name: 'พว. นารี ศรีสวัสดิ์',
    email: 'naree.s@health.co',
    avatarUrl: 'https://picsum.photos/id/1012/200/200',
    role: UserRole.PRACTITIONER,
    practitionerRole: PractitionerRole.NURSE,
    practitionerType: PractitionerType.INDEPENDENT,
    verificationStatus: VerificationStatus.PENDING,
    consultationFee: 250,
    specialty: 'การดูแลผู้สูงอายุ, อาหารเสริม, การดูแลแผล',
    affiliateId: 'naree-srisawat',
    bio: 'พยาบาลวิชาชีพที่มีประสบการณ์ในการดูแลผู้สูงอายุและผู้ป่วยพักฟื้น ให้คำแนะนำด้านโภชนาการและผลิตภัณฑ์เสริมอาหารเพื่อฟื้นฟูสุขภาพ',
    serviceProvince: 'กรุงเทพมหานคร',
    chosenDistributorId: 1,
  },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    name: 'สมศรี มีสุข',
    email: 'somsri.m@email.com',
    avatarUrl: 'https://picsum.photos/id/1027/200/200',
    role: UserRole.PATIENT,
    drugAllergies: 'Penicillin',
    chronicDiseases: 'ความดันโลหิตสูง',
    address: '123/45 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
    nationalId: '1234567890123',
    phone: '0812345678',
  },
  {
    id: 2,
    name: 'สมชาย ทดสอบ',
    email: 'somchai.t@email.com',
    avatarUrl: 'https://picsum.photos/id/1006/200/200',
    role: UserRole.PATIENT,
    drugAllergies: 'ไม่มี',
    chronicDiseases: 'ไมเกรน',
    address: '555/99 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
    nationalId: '9876543210987',
    phone: '0898765432',
  },
];

// NEW: A single source of truth for all products from central distributors
export const MOCK_ALL_CENTRAL_PRODUCTS: Product[] = [
    { id: 1001, name: 'Vitamin C 1000mg (กทม.)', price: 120, description: 'วิตามินซี เสริมภูมิคุ้มกัน', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1002, name: 'B Complex (กทม.)', price: 85, description: 'วิตามินบีรวม บำรุงระบบประสาท', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1003, name: 'Fish Oil 1000mg (เชียงใหม่)', price: 250, description: 'น้ำมันปลา บำรุงสมองและข้อ', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 2 },
    { id: 1004, name: 'Anti-Acne Serum (ขอนแก่น)', price: 450, description: 'เซรั่มสำหรับดูแลปัญหาสิว', category: ProductCategory.COSMETIC, source: FulfillmentSource.CENTRAL, distributorId: 3 },
    { id: 1005, name: 'Digital Thermometer (สงขลา)', price: 150, description: 'เครื่องวัดอุณหภูมิดิจิทัล', category: ProductCategory.MEDICAL_DEVICE, source: FulfillmentSource.CENTRAL, distributorId: 4 },
    { id: 1006, name: 'Collagen Peptide (กทม.)', price: 550, description: 'คอลลาเจนเปปไทด์ บำรุงผิว', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1007, name: 'Zinc 15mg (เชียงใหม่)', price: 180, description: 'สังกะสี เสริมสร้างภูมิคุ้มกันและบำรุงผิว', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 2 },
    { id: 1008, name: 'Moisturizing Cream 50g (กทม.)', price: 320, description: 'ครีมบำรุงผิว เพิ่มความชุ่มชื้น', category: ProductCategory.COSMETIC, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1009, name: 'Sunscreen SPF50+ PA++++ (กทม.)', price: 490, description: 'ครีมกันแดดประสิทธิภาพสูง', category: ProductCategory.COSMETIC, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1010, name: 'Blood Pressure Monitor (ขอนแก่น)', price: 1200, description: 'เครื่องวัดความดันโลหิตอัตโนมัติ', category: ProductCategory.MEDICAL_DEVICE, source: FulfillmentSource.CENTRAL, distributorId: 3 },
    { id: 1011, name: 'Herbal Relaxation Tea (เชียงใหม่)', price: 150, description: 'ชาสมุนไพรช่วยผ่อนคลาย', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 2 },
    { id: 1012, name: 'Probiotics 30 Capsules (สงขลา)', price: 650, description: 'โปรไบโอติกส์ ปรับสมดุลลำไส้', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 4 },
    { id: 1013, name: 'Artificial Tears Eye Drops (กทม.)', price: 75, description: 'น้ำตาเทียม ลดอาการตาแห้ง', category: ProductCategory.MEDICAL_DEVICE, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1014, name: 'Alcohol Hand Sanitizer 500ml (ขอนแก่น)', price: 99, description: 'แอลกอฮอล์เจลล้างมือ', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 3 },
    { id: 1015, name: 'KF94 Face Mask (Pack of 10) (สงขลา)', price: 120, description: 'หน้ากากอนามัย KF94 10 ชิ้น', category: ProductCategory.MEDICAL_DEVICE, source: FulfillmentSource.CENTRAL, distributorId: 4 },
    { id: 1016, name: 'Calcium + D3 (กทม.)', price: 280, description: 'แคลเซียมและวิตามินดี 3 บำรุงกระดูก', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1017, name: 'Omega-3 (Algae Oil) (เชียงใหม่)', price: 450, description: 'โอเมก้า 3 จากสาหร่าย สำหรับวีแกน', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 2 },
    { id: 1018, name: 'Anti-Hair Fall Shampoo (กทม.)', price: 290, description: 'แชมพูลดปัญหาผมร่วง', category: ProductCategory.COSMETIC, source: FulfillmentSource.CENTRAL, distributorId: 1 },
    { id: 1019, name: 'Glucosamine Sulfate 1500mg (สงขลา)', price: 580, description: 'กลูโคซามีน บำรุงข้อต่อ', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 4 },
    { id: 1020, name: 'Melatonin 5mg (ขอนแก่น)', price: 350, description: 'เมลาโทนิน ช่วยในการนอนหลับ', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.CENTRAL, distributorId: 3 },
];

// This represents a specific pharmacy's local inventory, uploaded via CSV
export const MOCK_LOCAL_INVENTORY_101: Product[] = [
    { id: 2001, name: 'Paracetamol 500mg', price: 10, description: 'บรรเทาอาการปวด ลดไข้', category: ProductCategory.DANGEROUS_DRUG, source: FulfillmentSource.LOCAL },
    { id: 2002, name: 'Amoxicillin 500mg', price: 50, description: 'ยาปฏิชีวนะ รักษาการติดเชื้อแบคทีเรีย', category: ProductCategory.DANGEROUS_DRUG, source: FulfillmentSource.LOCAL },
    { id: 2003, name: 'Loratadine 10mg', price: 35, description: 'บรรเทาอาการแพ้ ลดน้ำมูก', category: ProductCategory.DANGEROUS_DRUG, source: FulfillmentSource.LOCAL },
    { id: 2004, name: 'Ibuprofen 400mg', price: 25, description: 'บรรเทาอาการปวด ลดการอักเสบ', category: ProductCategory.DANGEROUS_DRUG, source: FulfillmentSource.LOCAL },
    { id: 1001, name: 'Vitamin C 1000mg', price: 130, description: 'วิตามินซี (สต็อกร้าน)', category: ProductCategory.GENERAL_HEALTH, source: FulfillmentSource.LOCAL }, // Same product, different price/source
];


export const ORDER_STATUS_DETAILS: Record<OrderStatus, OrderStatusDetail> = {
  [OrderStatus.PAYMENT_PENDING]: { text: 'รอการชำระเงิน', icon: 'fa-wallet', step: 0 },
  [OrderStatus.CONFIRMED]: { text: 'ยืนยันคำสั่งซื้อแล้ว', icon: 'fa-check-circle', step: 1 },
  [OrderStatus.PREPARING]: { text: 'กำลังเตรียมยา', icon: 'fa-box-open', step: 2 },
  [OrderStatus.READY_FOR_DELIVERY]: { text: 'พร้อมจัดส่ง', icon: 'fa-shipping-fast', step: 3, deliveryText: 'พร้อมจัดส่ง' },
  [OrderStatus.READY_FOR_PICKUP]: { text: 'พร้อมให้มารับ', icon: 'fa-store', step: 3, pickupText: 'พร้อมให้มารับ' },
  [OrderStatus.DELIVERED]: { text: 'จัดส่งสำเร็จ', icon: 'fa-house-user', step: 4, deliveryText: 'จัดส่งสำเร็จ' },
  [OrderStatus.COMPLETED]: { text: 'รับยาเรียบร้อย', icon: 'fa-check-double', step: 4, pickupText: 'รับยาเรียบร้อย' },
};

export const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];