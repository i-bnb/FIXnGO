-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

﻿-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "trn" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "credit_limit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "payment_terms_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_contacts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_sites" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "emirate" TEXT NOT NULL DEFAULT 'Dubai',
    "area" TEXT NOT NULL,
    "building" TEXT,
    "unit" TEXT,
    "makani_number" TEXT,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_assets" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "brand" TEXT,
    "model_number" TEXT,
    "serial_number" TEXT,
    "installation_date" TIMESTAMP(3),
    "warranty_expiry_date" TIMESTAMP(3),
    "current_condition" TEXT,
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "visits_per_year" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "maintenance_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_visit_schedules" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "visit_number" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "work_order_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contract_visit_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "rate_type" TEXT NOT NULL DEFAULT 'FIXED',
    "base_price" DECIMAL(14,2) NOT NULL,
    "default_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" TEXT NOT NULL,
    "price_list_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "min_price" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "requested_service_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'APP',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "preferred_date" TIMESTAMP(3),
    "preferred_time_slot" TEXT,
    "sla_due_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "complaint_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "work_order_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "asset_id" TEXT,
    "service_request_id" TEXT,
    "service_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_start" TIMESTAMP(3),
    "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "vat_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_assignments" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "role_in_job" TEXT NOT NULL DEFAULT 'LEAD_TECHNICIAN',
    "is_in_charge" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_tasks" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "task_title" TEXT NOT NULL,
    "description" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "completed_by_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_status_history" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "changed_by_id" TEXT,
    "reason" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(14,2) NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "total_price" DECIMAL(14,2) NOT NULL,
    "part_action" TEXT NOT NULL DEFAULT 'FITTED_NEW',
    "serial_number_removed" TEXT,
    "serial_number_fitted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_labour" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "hourly_cost_rate" DECIMAL(14,2) NOT NULL,
    "hourly_billing_rate" DECIMAL(14,2) NOT NULL,
    "total_cost" DECIMAL(14,2) NOT NULL,
    "total_billed" DECIMAL(14,2) NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_labour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_expenses" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "expense_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "receipt_attachment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_attachments" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "attachment_type" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_order_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_signoffs" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "signed_by_name" TEXT NOT NULL,
    "signature_file_id" TEXT,
    "signature_url" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "feedback_comments" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_signoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "employee_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "emirates_id" TEXT,
    "passport_number" TEXT,
    "visa_expiry_date" TIMESTAMP(3),
    "trade_license_number" TEXT,
    "hourly_cost_rate" DECIMAL(14,2) NOT NULL DEFAULT 25.00,
    "hourly_billing_rate" DECIMAL(14,2) NOT NULL DEFAULT 55.00,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_skills" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency_level" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "is_certified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_time" TIMESTAMP(3),
    "check_in_latitude" DECIMAL(10,7),
    "check_in_longitude" DECIMAL(10,7),
    "check_out_latitude" DECIMAL(10,7),
    "check_out_longitude" DECIMAL(10,7),
    "check_in_address" TEXT,
    "check_out_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leaves" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_days" DECIMAL(5,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employee_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_supply_deployments" (
    "id" TEXT NOT NULL,
    "requisition_number" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "site_location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "billing_type" TEXT NOT NULL DEFAULT 'HOURLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "labour_supply_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_daily_timesheets" (
    "id" TEXT NOT NULL,
    "deployment_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "regular_hours" DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    "overtime_hours" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_hours" DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    "site_supervisor_signature" TEXT,
    "is_billed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "labour_daily_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_locations" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "speed_kmh" DECIMAL(5,2),
    "heading_degrees" DECIMAL(5,2),
    "accuracy_meters" DECIMAL(6,2),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "technician_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SPARE',
    "unit_of_measure" TEXT NOT NULL DEFAULT 'pcs',
    "cost_price" DECIMAL(14,2) NOT NULL,
    "selling_price" DECIMAL(14,2) NOT NULL,
    "barcode" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CENTRAL_WAREHOUSE',
    "assigned_employee_id" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_levels" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 5,
    "reorder_quantity" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stock_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "movement_number" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(14,2) NOT NULL,
    "source_warehouse_id" TEXT,
    "destination_warehouse_id" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "trn" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "vat_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity_ordered" INTEGER NOT NULL,
    "quantity_received" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by_id" TEXT,
    "delivery_note_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_lines" (
    "id" TEXT NOT NULL,
    "goods_receipt_id" TEXT NOT NULL,
    "po_line_id" TEXT,
    "item_id" TEXT NOT NULL,
    "quantity_received" INTEGER NOT NULL,
    "unit_cost" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" TEXT NOT NULL,
    "bill_number" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "supplier_invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "bank_account_id" TEXT,
    "reference_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_sales_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT,
    "warehouse_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "payment_status" TEXT NOT NULL DEFAULT 'PAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "material_sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_sales_order_lines" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "material_sales_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_equipment" (
    "id" TEXT NOT NULL,
    "asset_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3),
    "purchase_cost" DECIMAL(14,2),
    "daily_rate" DECIMAL(14,2) NOT NULL,
    "weekly_rate" DECIMAL(14,2) NOT NULL,
    "monthly_rate" DECIMAL(14,2) NOT NULL,
    "current_location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "current_condition" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rental_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "site_location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expected_end_date" TIMESTAMP(3) NOT NULL,
    "actual_end_date" TIMESTAMP(3),
    "rate_basis" TEXT NOT NULL DEFAULT 'MONTHLY',
    "deposit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "vat_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rental_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_contract_lines" (
    "id" TEXT NOT NULL,
    "rental_contract_id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "applied_rate" DECIMAL(14,2) NOT NULL,
    "rate_basis" TEXT NOT NULL DEFAULT 'MONTHLY',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rental_contract_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_dispatches_returns" (
    "id" TEXT NOT NULL,
    "rental_contract_id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition_notes" TEXT,
    "fuel_level" TEXT,
    "hours_meter_reading" DECIMAL(10,2),
    "inspection_photos_json" JSONB,
    "performed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rental_dispatches_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT,
    "work_order_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "terms_and_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_lines" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "item_id" TEXT,
    "service_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quotation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_type" TEXT NOT NULL DEFAULT 'STANDARD_TAX_INVOICE',
    "work_order_id" TEXT,
    "rental_contract_id" TEXT,
    "labour_deployment_id" TEXT,
    "maintenance_contract_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "customer_trn" TEXT,
    "company_name" TEXT NOT NULL DEFAULT 'FieldOps MEP & Contracting LLC',
    "company_trn" TEXT NOT NULL DEFAULT '100482910300003',
    "company_address" TEXT NOT NULL DEFAULT 'Al Quoz Industrial Area 3, Dubai, UAE',
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "balance_due" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "qr_code_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "item_id" TEXT,
    "service_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_rate" DECIMAL(4,2) NOT NULL DEFAULT 0.05,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "credit_note_number" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vat_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'MOCK_CARD',
    "transaction_reference" TEXT,
    "cheque_number" TEXT,
    "cheque_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CLEARED',
    "gateway_payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount_allocated" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "type" TEXT NOT NULL,
    "sub_type" TEXT,
    "is_reconcilable" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "entry_number" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "posted_at" TIMESTAMP(3),
    "posted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "debit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "credit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "swift_bic" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "account_id" TEXT NOT NULL,
    "current_balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_bank_transactions" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reference" TEXT,
    "payee_payer" TEXT,
    "is_reconciled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cash_bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_claims" (
    "id" TEXT NOT NULL,
    "claim_number" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "claim_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expense_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_claim_lines" (
    "id" TEXT NOT NULL,
    "expense_claim_id" TEXT NOT NULL,
    "expense_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "receipt_file_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expense_claim_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "body_template_en" TEXT NOT NULL,
    "body_template_ar" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "event_trigger" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata_json" JSONB,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approver_role" TEXT,
    "approver_user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "condition_expression_json" JSONB,
    "action_payload_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_user_id" TEXT,
    "actor_name" TEXT,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values_json" JSONB,
    "new_values_json" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE INDEX "customers_trn_idx" ON "customers"("trn");

-- CreateIndex
CREATE INDEX "customer_sites_latitude_longitude_idx" ON "customer_sites"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "customer_sites_emirate_area_idx" ON "customer_sites"("emirate", "area");

-- CreateIndex
CREATE INDEX "customer_assets_serial_number_idx" ON "customer_assets"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_contracts_contract_number_key" ON "maintenance_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_code_key" ON "service_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_key" ON "services"("code");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_code_key" ON "price_lists"("code");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_price_list_id_service_id_key" ON "price_list_items"("price_list_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_request_number_key" ON "service_requests"("request_number");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "service_requests_priority_idx" ON "service_requests"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaint_number_key" ON "complaints"("complaint_number");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_order_number_key" ON "work_orders"("order_number");

-- CreateIndex
CREATE INDEX "work_orders_status_scheduled_start_idx" ON "work_orders"("status", "scheduled_start");

-- CreateIndex
CREATE INDEX "work_orders_customer_id_idx" ON "work_orders"("customer_id");

-- CreateIndex
CREATE INDEX "work_orders_service_type_idx" ON "work_orders"("service_type");

-- CreateIndex
CREATE INDEX "work_orders_latitude_longitude_idx" ON "work_orders"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "customer_signoffs_work_order_id_key" ON "customer_signoffs"("work_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE INDEX "employees_trade_idx" ON "employees"("trade");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employee_attendance_employee_id_check_in_time_idx" ON "employee_attendance"("employee_id", "check_in_time");

-- CreateIndex
CREATE UNIQUE INDEX "labour_supply_deployments_requisition_number_key" ON "labour_supply_deployments"("requisition_number");

-- CreateIndex
CREATE INDEX "labour_daily_timesheets_deployment_id_work_date_idx" ON "labour_daily_timesheets"("deployment_id", "work_date");

-- CreateIndex
CREATE INDEX "technician_locations_employee_id_recorded_at_idx" ON "technician_locations"("employee_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "technician_locations_latitude_longitude_idx" ON "technician_locations"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_code_key" ON "items"("item_code");

-- CreateIndex
CREATE INDEX "items_item_code_idx" ON "items"("item_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_assigned_employee_id_key" ON "warehouses"("assigned_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_levels_item_id_warehouse_id_key" ON "stock_levels"("item_id", "warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_movement_number_key" ON "stock_movements"("movement_number");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_grn_number_key" ON "goods_receipts"("grn_number");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_bill_number_key" ON "supplier_invoices"("bill_number");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_payments_payment_number_key" ON "supplier_payments"("payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "material_sales_orders_order_number_key" ON "material_sales_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "rental_equipment_asset_code_key" ON "rental_equipment"("asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "rental_equipment_serial_number_key" ON "rental_equipment"("serial_number");

-- CreateIndex
CREATE INDEX "rental_equipment_status_idx" ON "rental_equipment"("status");

-- CreateIndex
CREATE INDEX "rental_equipment_category_idx" ON "rental_equipment"("category");

-- CreateIndex
CREATE UNIQUE INDEX "rental_contracts_contract_number_key" ON "rental_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_number_key" ON "quotations"("quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_payment_status_idx" ON "invoices"("payment_status");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_credit_note_number_key" ON "credit_notes"("credit_note_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_code_key" ON "chart_of_accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_entry_number_key" ON "journal_entries"("entry_number");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_iban_key" ON "bank_accounts"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "expense_claims_claim_number_key" ON "expense_claims"("claim_number");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notifications_recipient_user_id_status_idx" ON "notifications"("recipient_user_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_name_entity_id_idx" ON "audit_logs"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_sites" ADD CONSTRAINT "customer_sites_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_assets" ADD CONSTRAINT "customer_assets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_assets" ADD CONSTRAINT "customer_assets_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_visit_schedules" ADD CONSTRAINT "contract_visit_schedules_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "maintenance_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_visit_schedules" ADD CONSTRAINT "contract_visit_schedules_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_requested_service_id_fkey" FOREIGN KEY ("requested_service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "customer_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_assignments" ADD CONSTRAINT "work_order_assignments_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_assignments" ADD CONSTRAINT "work_order_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_tasks" ADD CONSTRAINT "work_order_tasks_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_labour" ADD CONSTRAINT "work_order_labour_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_labour" ADD CONSTRAINT "work_order_labour_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_expenses" ADD CONSTRAINT "work_order_expenses_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_attachments" ADD CONSTRAINT "work_order_attachments_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_signoffs" ADD CONSTRAINT "customer_signoffs_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leaves" ADD CONSTRAINT "employee_leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_daily_timesheets" ADD CONSTRAINT "labour_daily_timesheets_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "labour_supply_deployments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_daily_timesheets" ADD CONSTRAINT "labour_daily_timesheets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_locations" ADD CONSTRAINT "technician_locations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_assigned_employee_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_source_warehouse_id_fkey" FOREIGN KEY ("source_warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_destination_warehouse_id_fkey" FOREIGN KEY ("destination_warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_po_line_id_fkey" FOREIGN KEY ("po_line_id") REFERENCES "purchase_order_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_invoice_id_fkey" FOREIGN KEY ("supplier_invoice_id") REFERENCES "supplier_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sales_orders" ADD CONSTRAINT "material_sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sales_orders" ADD CONSTRAINT "material_sales_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sales_order_lines" ADD CONSTRAINT "material_sales_order_lines_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "material_sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sales_order_lines" ADD CONSTRAINT "material_sales_order_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contract_lines" ADD CONSTRAINT "rental_contract_lines_rental_contract_id_fkey" FOREIGN KEY ("rental_contract_id") REFERENCES "rental_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contract_lines" ADD CONSTRAINT "rental_contract_lines_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "rental_equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_dispatches_returns" ADD CONSTRAINT "rental_dispatches_returns_rental_contract_id_fkey" FOREIGN KEY ("rental_contract_id") REFERENCES "rental_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_dispatches_returns" ADD CONSTRAINT "rental_dispatches_returns_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "rental_equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rental_contract_id_fkey" FOREIGN KEY ("rental_contract_id") REFERENCES "rental_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_labour_deployment_id_fkey" FOREIGN KEY ("labour_deployment_id") REFERENCES "labour_supply_deployments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_maintenance_contract_id_fkey" FOREIGN KEY ("maintenance_contract_id") REFERENCES "maintenance_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_bank_transactions" ADD CONSTRAINT "cash_bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claims" ADD CONSTRAINT "expense_claims_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claim_lines" ADD CONSTRAINT "expense_claim_lines_expense_claim_id_fkey" FOREIGN KEY ("expense_claim_id") REFERENCES "expense_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ==============================================================================
-- POSTGIS SPATIAL GEOGRAPHY & SPATIAL INDEXES
-- ==============================================================================

ALTER TABLE "customer_sites" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);
CREATE INDEX IF NOT EXISTS "idx_customer_sites_location_gist" ON "customer_sites" USING GIST ("location");

ALTER TABLE "technician_locations" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);
CREATE INDEX IF NOT EXISTS "idx_technician_locations_location_gist" ON "technician_locations" USING GIST ("location");

CREATE OR REPLACE FUNCTION sync_customer_site_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326)::geography;
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_customer_site_location ON "customer_sites";
CREATE TRIGGER trg_sync_customer_site_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "customer_sites"
FOR EACH ROW EXECUTE FUNCTION sync_customer_site_location();

CREATE OR REPLACE FUNCTION sync_technician_location_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326)::geography;
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_technician_location_point ON "technician_locations";
CREATE TRIGGER trg_sync_technician_location_point
BEFORE INSERT OR UPDATE OF latitude, longitude ON "technician_locations"
FOR EACH ROW EXECUTE FUNCTION sync_technician_location_point();

-- ==============================================================================
-- ANALYTICAL SQL REPORTING VIEWS
-- ==============================================================================

-- 1. View 1: v_job_profitability
CREATE OR REPLACE VIEW v_job_profitability AS
SELECT 
    wo.id AS work_order_id,
    wo.order_number,
    wo.title,
    wo.status,
    wo.service_type,
    c.name AS customer_name,
    COALESCE(wo.subtotal, 0.00) AS billed_revenue,
    COALESCE(parts.total_parts_cost, 0.00) AS parts_cost,
    COALESCE(labour.total_labour_cost, 0.00) AS labour_cost,
    COALESCE(expenses.total_expenses, 0.00) AS other_expenses,
    (
        COALESCE(wo.subtotal, 0.00) - 
        (COALESCE(parts.total_parts_cost, 0.00) + COALESCE(labour.total_labour_cost, 0.00) + COALESCE(expenses.total_expenses, 0.00))
    ) AS gross_profit,
    CASE 
        WHEN COALESCE(wo.subtotal, 0.00) > 0 THEN 
            ROUND(
                ((COALESCE(wo.subtotal, 0.00) - (COALESCE(parts.total_parts_cost, 0.00) + COALESCE(labour.total_labour_cost, 0.00) + COALESCE(expenses.total_expenses, 0.00))) / wo.subtotal) * 100, 
                2
            )
        ELSE 0.00 
    END AS gross_margin_percentage
FROM work_orders wo
JOIN customers c ON c.id = wo.customer_id
LEFT JOIN (
    SELECT work_order_id, SUM(quantity * unit_cost) AS total_parts_cost
    FROM work_order_parts
    WHERE deleted_at IS NULL AND part_action IN ('FITTED_NEW', 'CONSUMED')
    GROUP BY work_order_id
) parts ON parts.work_order_id = wo.id
LEFT JOIN (
    SELECT work_order_id, SUM(total_cost) AS total_labour_cost
    FROM work_order_labour
    WHERE deleted_at IS NULL
    GROUP BY work_order_id
) labour ON labour.work_order_id = wo.id
LEFT JOIN (
    SELECT work_order_id, SUM(amount) AS total_expenses
    FROM work_order_expenses
    WHERE deleted_at IS NULL
    GROUP BY work_order_id
) expenses ON expenses.work_order_id = wo.id
WHERE wo.deleted_at IS NULL;

-- 2. View 2: v_technician_performance
CREATE OR REPLACE VIEW v_technician_performance AS
SELECT 
    e.id AS employee_id,
    e.employee_code,
    e.first_name || ' ' || e.last_name AS technician_name,
    e.trade,
    COUNT(DISTINCT woa.work_order_id) FILTER (WHERE wo.status = 'COMPLETED') AS completed_jobs_count,
    COALESCE(SUM(wol.hours), 0.00) AS total_hours_worked,
    COALESCE(SUM(wol.total_billed), 0.00) AS total_labour_revenue_billed,
    COALESCE(ROUND(AVG(cs.rating), 2), 5.00) AS average_customer_rating
FROM employees e
LEFT JOIN work_order_assignments woa ON woa.employee_id = e.id AND woa.deleted_at IS NULL
LEFT JOIN work_orders wo ON wo.id = woa.work_order_id AND wo.deleted_at IS NULL
LEFT JOIN work_order_labour wol ON wol.work_order_id = wo.id AND wol.employee_id = e.id AND wol.deleted_at IS NULL
LEFT JOIN customer_signoffs cs ON cs.work_order_id = wo.id AND cs.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.employee_code, e.first_name, e.last_name, e.trade;

-- 3. View 3: v_equipment_utilization
CREATE OR REPLACE VIEW v_equipment_utilization AS
SELECT 
    eq.id AS equipment_id,
    eq.asset_code,
    eq.name,
    eq.category,
    eq.status,
    eq.daily_rate,
    COALESCE(SUM(EXTRACT(DAY FROM (COALESCE(rc.actual_end_date, CURRENT_DATE) - rc.start_date))), 0) AS total_rented_days,
    COALESCE(SUM(rcl.total_amount), 0.00) AS total_rental_revenue
FROM rental_equipment eq
LEFT JOIN rental_contract_lines rcl ON rcl.equipment_id = eq.id AND rcl.deleted_at IS NULL
LEFT JOIN rental_contracts rc ON rc.id = rcl.rental_contract_id AND rc.deleted_at IS NULL
WHERE eq.deleted_at IS NULL
GROUP BY eq.id, eq.asset_code, eq.name, eq.category, eq.status, eq.daily_rate;

-- 4. View 4: v_inventory_status
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
    i.id AS item_id,
    i.item_code,
    i.name,
    i.type,
    i.cost_price,
    i.selling_price,
    COALESCE(SUM(sl.quantity_on_hand), 0) AS total_quantity_on_hand,
    COALESCE(SUM(sl.quantity_reserved), 0) AS total_quantity_reserved,
    COALESCE(SUM(sl.quantity_available), 0) AS total_quantity_available,
    (COALESCE(SUM(sl.quantity_on_hand), 0) * i.cost_price) AS total_inventory_valuation,
    CASE 
        WHEN COALESCE(SUM(sl.quantity_available), 0) <= MIN(sl.reorder_level) THEN TRUE 
        ELSE FALSE 
    END AS is_reorder_required
FROM items i
LEFT JOIN stock_levels sl ON sl.item_id = i.id AND sl.deleted_at IS NULL
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.item_code, i.name, i.type, i.cost_price, i.selling_price;

-- 5. View 5: v_receivables_aging
CREATE OR REPLACE VIEW v_receivables_aging AS
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.trn AS customer_trn,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - inv.due_date) <= 0 THEN inv.balance_due ELSE 0.00 END), 0.00) AS current_unbilled,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - inv.due_date) BETWEEN 1 AND 30 THEN inv.balance_due ELSE 0.00 END), 0.00) AS days_1_30,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - inv.due_date) BETWEEN 31 AND 60 THEN inv.balance_due ELSE 0.00 END), 0.00) AS days_31_60,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - inv.due_date) BETWEEN 61 AND 90 THEN inv.balance_due ELSE 0.00 END), 0.00) AS days_61_90,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - inv.due_date) > 90 THEN inv.balance_due ELSE 0.00 END), 0.00) AS days_over_90,
    COALESCE(SUM(inv.balance_due), 0.00) AS total_outstanding_balance
FROM customers c
LEFT JOIN invoices inv ON inv.customer_id = c.id AND inv.payment_status != 'PAID' AND inv.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.trn;

-- 6. View 6: v_payables_aging
CREATE OR REPLACE VIEW v_payables_aging AS
SELECT 
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.trn AS supplier_trn,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - si.due_date) <= 0 THEN (si.total_amount) ELSE 0.00 END), 0.00) AS current_payable,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - si.due_date) BETWEEN 1 AND 30 THEN (si.total_amount) ELSE 0.00 END), 0.00) AS days_1_30,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - si.due_date) BETWEEN 31 AND 60 THEN (si.total_amount) ELSE 0.00 END), 0.00) AS days_31_60,
    COALESCE(SUM(CASE WHEN (CURRENT_DATE - si.due_date) > 60 THEN (si.total_amount) ELSE 0.00 END), 0.00) AS days_over_60,
    COALESCE(SUM(si.total_amount), 0.00) AS total_outstanding_payable
FROM suppliers s
LEFT JOIN supplier_invoices si ON si.supplier_id = s.id AND si.status != 'PAID' AND si.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.trn;

-- 7. View 7: v_monthly_pnl
CREATE OR REPLACE VIEW v_monthly_pnl AS
SELECT 
    TO_CHAR(je.entry_date, 'YYYY-MM') AS fiscal_month,
    COALESCE(SUM(jl.credit_amount - jl.debit_amount) FILTER (WHERE coa.type = 'REVENUE'), 0.00) AS total_revenue,
    COALESCE(SUM(jl.debit_amount - jl.credit_amount) FILTER (WHERE coa.type = 'DIRECT_COST'), 0.00) AS cost_of_goods_and_services,
    (
        COALESCE(SUM(jl.credit_amount - jl.debit_amount) FILTER (WHERE coa.type = 'REVENUE'), 0.00) -
        COALESCE(SUM(jl.debit_amount - jl.credit_amount) FILTER (WHERE coa.type = 'DIRECT_COST'), 0.00)
    ) AS gross_profit,
    COALESCE(SUM(jl.debit_amount - jl.credit_amount) FILTER (WHERE coa.type = 'EXPENSE'), 0.00) AS operating_expenses,
    (
        COALESCE(SUM(jl.credit_amount - jl.debit_amount) FILTER (WHERE coa.type = 'REVENUE'), 0.00) -
        COALESCE(SUM(jl.debit_amount - jl.credit_amount) FILTER (WHERE coa.type = 'DIRECT_COST'), 0.00) -
        COALESCE(SUM(jl.debit_amount - jl.credit_amount) FILTER (WHERE coa.type = 'EXPENSE'), 0.00)
    ) AS net_profit
FROM journal_lines jl
JOIN journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'POSTED' AND je.deleted_at IS NULL
JOIN chart_of_accounts coa ON coa.id = jl.account_id AND coa.deleted_at IS NULL
GROUP BY TO_CHAR(je.entry_date, 'YYYY-MM')
ORDER BY fiscal_month DESC;
