import {
  UserRole,
  JobStatus,
  Priority,
  ServiceType,
  EquipmentStatus,
  ManpowerTrade,
  ManpowerStatus,
  PaymentStatus,
  PaymentMethod,
  StockMovementType,
} from '../enums';

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy?: string | null;
  deletedAt?: string | Date | null;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  area?: string;
  building?: string;
  unit?: string;
  makaniNumber?: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
}

export interface CustomerModel extends BaseEntity {
  userId: string;
  user?: UserSummary;
  trn?: string | null;
  companyName?: string | null;
  defaultAddress: string;
  latitude: number;
  longitude: number;
  emirate: string;
  area: string;
  totalOrdersCount: number;
}

export interface TechnicianModel extends BaseEntity {
  userId: string;
  user?: UserSummary;
  trade: ServiceType;
  tradeLicenseNo: string;
  isAvailable: boolean;
  currentLatitude: number;
  currentLongitude: number;
  lastLocationUpdatedAt: string | Date;
  ratingAverage: number;
  completedJobsCount: number;
  activeJobId?: string | null;
}

export interface WorkOrderItemModel {
  id: string;
  workOrderId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustomPart: boolean;
  materialItemId?: string | null;
}

export interface WorkOrderChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface JobPhotoModel {
  id: string;
  workOrderId: string;
  photoType: 'BEFORE' | 'AFTER' | 'INSPECTION';
  url: string;
  caption?: string | null;
  createdAt: string | Date;
}

export interface WorkOrderModel extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customer?: CustomerModel;
  technicianId?: string | null;
  technician?: TechnicianModel | null;
  serviceType: ServiceType;
  title: string;
  description: string;
  status: JobStatus;
  priority: Priority;
  scheduledDate: string | Date;
  scheduledTimeSlot?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  emirate: string;
  area: string;
  checklist: WorkOrderChecklistItem[];
  items: WorkOrderItemModel[];
  photos: JobPhotoModel[];
  signatureUrl?: string | null;
  signedByCustomerName?: string | null;
  signedAt?: string | Date | null;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  isEmergency: boolean;
}

export interface ManpowerWorkerModel extends BaseEntity {
  workerCode: string;
  fullName: string;
  phone: string;
  trade: ManpowerTrade;
  yearsOfExperience: number;
  status: ManpowerStatus;
  hourlyCostRate: number;
  hourlyBillingRate: number;
  currentSiteName?: string | null;
}

export interface ManpowerRequisitionModel extends BaseEntity {
  requisitionNumber: string;
  clientName: string;
  projectName: string;
  siteLocation: string;
  emirate: string;
  tradeRequired: ManpowerTrade;
  quantityRequired: number;
  startDate: string | Date;
  endDate: string | Date;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  dailyRatePerWorker: number;
  totalEstimatedValue: number;
  assignedWorkersCount: number;
}

export interface EquipmentModel extends BaseEntity {
  code: string;
  name: string;
  category: string;
  serialNumber: string;
  status: EquipmentStatus;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  currentLocation: string;
  conditionNotes?: string | null;
  imageUrl?: string | null;
}

export interface EquipmentRentalContractModel extends BaseEntity {
  contractNumber: string;
  clientName: string;
  projectName: string;
  equipmentId: string;
  equipment?: EquipmentModel;
  startDate: string | Date;
  expectedEndDate: string | Date;
  actualReturnDate?: string | Date | null;
  rateType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  appliedRate: number;
  depositAmount: number;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  totalAmount: number;
}

export interface MaterialItemModel extends BaseEntity {
  itemCode: string;
  name: string;
  nameAr?: string;
  category: string;
  unit: string; // e.g. 'pcs', 'meters', 'rolls', 'kg'
  costPrice: number;
  sellingPrice: number;
  totalStockQuantity: number;
  warehouseQuantity: number;
  vansQuantity: number;
  reorderLevel: number;
  barcode?: string;
}

export interface StockMovementModel extends BaseEntity {
  materialItemId: string;
  materialItem?: MaterialItemModel;
  movementType: StockMovementType;
  quantity: number;
  sourceLocation: string;
  destinationLocation: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface TaxInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalBeforeVat: number;
  vatRate: number; // 0.05
  vatAmount: number;
  totalWithVat: number;
}

export interface TaxInvoiceModel extends BaseEntity {
  invoiceNumber: string;
  workOrderId?: string | null;
  contractNumber?: string | null;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerTrn?: string | null;
  companyName: string;
  companyTrn: string;
  companyAddress: string;
  issueDate: string | Date;
  dueDate: string | Date;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paidAt?: string | Date | null;
  items: TaxInvoiceItem[];
  qrCodeData?: string;
}

export interface AuditLogModel {
  id: string;
  timestamp: string | Date;
  actorUserId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DISPATCH' | 'LOGIN';
  entityName: string;
  entityId: string;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
}

// Realtime Payloads
export interface TechLocationUpdateEvent {
  technicianId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmH?: number;
  updatedAt: string;
}

export interface JobStatusChangeEvent {
  jobId: string;
  previousStatus: JobStatus;
  newStatus: JobStatus;
  technicianId?: string | null;
  timestamp: string;
  reason?: string;
}
