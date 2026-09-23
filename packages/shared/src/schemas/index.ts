import { z } from 'zod';
import {
  UserRole,
  JobStatus,
  Priority,
  ServiceType,
  EquipmentStatus,
  ManpowerTrade,
  PaymentMethod,
} from '../enums';

// 1. Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterCustomerSchema = z.object({
  fullName: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+971\d{8,9}$/, 'Phone must be a valid UAE number (+971...)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  emirate: z.enum(['Dubai', 'Sharjah', 'Abu Dhabi', 'Ajman']),
  area: z.string().min(2, 'Area is required'),
  address: z.string().min(5, 'Address details required'),
  companyName: z.string().optional(),
  trn: z.string().optional(),
});
export type RegisterCustomerInput = z.infer<typeof RegisterCustomerSchema>;

// 2. Customer Booking Schema
export const CreateServiceBookingSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  servicePackageId: z.string().optional(),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Please provide description of the problem'),
  isEmergency: z.boolean().default(false),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTimeSlot: z.string().optional(),
  emirate: z.enum(['Dubai', 'Sharjah', 'Abu Dhabi', 'Ajman']).default('Dubai'),
  area: z.string().min(2, 'Area is required'),
  address: z.string().min(5, 'Full street/building address is required'),
  latitude: z.number().min(22).max(27),
  longitude: z.number().min(51).max(57),
  estimatedBaseAed: z.number().positive().default(150),
});
export type CreateServiceBookingInput = z.infer<typeof CreateServiceBookingSchema>;

// 3. Dispatch / Technician Assignment Schema
export const AssignTechnicianSchema = z.object({
  workOrderId: z.string().uuid(),
  technicianId: z.string().uuid(),
  overrideReason: z.string().optional(),
});
export type AssignTechnicianInput = z.infer<typeof AssignTechnicianSchema>;

// 4. Job Status Transition Schema
export const UpdateJobStatusSchema = z.object({
  workOrderId: z.string().uuid(),
  newStatus: z.nativeEnum(JobStatus),
  currentLatitude: z.number().optional(),
  currentLongitude: z.number().optional(),
  notes: z.string().optional(),
});
export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusSchema>;

// 5. Material Usage Addition
export const AddMaterialUsageSchema = z.object({
  workOrderId: z.string().uuid(),
  materialItemId: z.string().uuid(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPriceAed: z.number().positive(),
  notes: z.string().optional(),
});
export type AddMaterialUsageInput = z.infer<typeof AddMaterialUsageSchema>;

// 6. Job Completion & Sign-off Schema
export const SubmitJobCompletionSchema = z.object({
  workOrderId: z.string().uuid(),
  completedChecklistIds: z.array(z.string()).min(1, 'At least one checklist item must be verified'),
  beforePhotoUrls: z.array(z.string().url()).optional(),
  afterPhotoUrls: z.array(z.string().url()).min(1, 'At least one after photo is required'),
  customerSignatureBase64: z.string().min(20, 'Customer signature is required'),
  signedByCustomerName: z.string().min(2, 'Signer name is required'),
  technicianNotes: z.string().optional(),
});
export type SubmitJobCompletionInput = z.infer<typeof SubmitJobCompletionSchema>;

// 7. Manpower Requisition Schema
export const CreateManpowerRequisitionSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  projectName: z.string().min(2, 'Project / Site name is required'),
  siteLocation: z.string().min(3, 'Site address required'),
  emirate: z.enum(['Dubai', 'Sharjah', 'Abu Dhabi', 'Ajman']),
  tradeRequired: z.nativeEnum(ManpowerTrade),
  quantityRequired: z.number().int().min(1, 'At least 1 worker required'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  dailyRatePerWorker: z.number().positive('Daily rate must be positive'),
});
export type CreateManpowerRequisitionInput = z.infer<typeof CreateManpowerRequisitionSchema>;

// 8. Equipment Rental Schema
export const CreateEquipmentRentalSchema = z.object({
  equipmentId: z.string().uuid(),
  clientName: z.string().min(2, 'Client name is required'),
  projectName: z.string().min(2, 'Project name is required'),
  startDate: z.string().min(1, 'Start date required'),
  expectedEndDate: z.string().min(1, 'End date required'),
  rateType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  appliedRate: z.number().positive(),
  depositAmount: z.number().min(0).default(0),
});
export type CreateEquipmentRentalInput = z.infer<typeof CreateEquipmentRentalSchema>;

// 9. Payment Processing Schema
export const ProcessPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amountAed: z.number().positive(),
  stripePaymentMethodId: z.string().optional(),
  cardLast4: z.string().optional(),
});
export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;

// 10. Material / Inventory Item Schema
export const CreateMaterialItemSchema = z.object({
  itemCode: z.string().min(2),
  name: z.string().min(2),
  nameAr: z.string().optional(),
  category: z.string().min(2),
  unit: z.string().default('pcs'),
  costPrice: z.number().min(0),
  sellingPrice: z.number().positive(),
  totalStockQuantity: z.number().int().min(0),
  warehouseQuantity: z.number().int().min(0),
  vansQuantity: z.number().int().min(0),
  reorderLevel: z.number().int().min(1).default(5),
  barcode: z.string().optional(),
});
export type CreateMaterialItemInput = z.infer<typeof CreateMaterialItemSchema>;
