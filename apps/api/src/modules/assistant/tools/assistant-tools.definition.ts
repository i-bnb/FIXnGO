import { Type } from '@google/genai';

/**
 * 13 Read-Only Parameterized Tools for FIXnGO AI Operations Assistant.
 * Exposes fixed parameterized queries without any free-form SQL or write actions.
 */
export const ASSISTANT_TOOL_DEFINITIONS = [
  {
    name: 'getKpiSummary',
    description: 'Retrieve high-level operations KPI summary: active jobs, completed jobs, total revenue, SLA compliance rate, fleet utilization, and customer count.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dateFrom: { type: Type.STRING, description: 'Optional start date in YYYY-MM-DD' },
        dateTo: { type: Type.STRING, description: 'Optional end date in YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'getJobsByStatus',
    description: 'Retrieve list of work orders filtered by status (NEW, ASSIGNED, EN_ROUTE, ON_SITE, IN_PROGRESS, COMPLETED, CANCELLED) and optional date.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Job status: NEW, ASSIGNED, EN_ROUTE, ON_SITE, IN_PROGRESS, COMPLETED, CANCELLED',
        },
        date: { type: Type.STRING, description: 'Optional date filter in YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'getSlaBreaches',
    description: 'Retrieve work orders currently breaching or close to breaching emergency response SLA (e.g. > 2 hours overdue or pending emergency dispatch).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getJobDetails',
    description: 'Retrieve detailed record for a specific work order by its order number (e.g. WO-24817, WO-24825, WO-2025-0089), including customer, assigned technician, parts fitted, labour, and tax invoice.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        workOrderNo: { type: Type.STRING, description: 'Work Order number (e.g. WO-24817, WO-24825)' },
      },
      required: ['workOrderNo'],
    },
  },
  {
    name: 'getJobProfitability',
    description: 'Retrieve work order profitability report including billed revenue, parts cost, labour cost, expenses, gross profit in AED, and gross margin %. Can filter exclusively for loss-making jobs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dateFrom: { type: Type.STRING, description: 'Optional start date in YYYY-MM-DD' },
        dateTo: { type: Type.STRING, description: 'Optional end date in YYYY-MM-DD' },
        onlyLossMaking: {
          type: Type.BOOLEAN,
          description: 'Set to true to return only jobs with negative gross margin (losses)',
        },
      },
    },
  },
  {
    name: 'getTechnicianStatus',
    description: 'Retrieve live status, GPS location, van code, trade, speed, and active job for field technicians. Can filter by technician name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Optional technician first or last name (e.g. Rashid, Joseph, Vikram)' },
      },
    },
  },
  {
    name: 'getTechnicianPerformance',
    description: 'Retrieve technician performance metrics: jobs completed, total hours worked, labour revenue billed in AED, and CSAT rating.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dateFrom: { type: Type.STRING, description: 'Optional start date in YYYY-MM-DD' },
        dateTo: { type: Type.STRING, description: 'Optional end date in YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'getLowStockItems',
    description: 'Retrieve inventory items currently at or below minimum reorder thresholds across central warehouse and mobile van stocks.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getEquipmentUtilization',
    description: 'Retrieve heavy equipment rental fleet utilization rates, active rental contracts, daily rates, and revenue generated in AED.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getReceivablesAging',
    description: 'Retrieve Accounts Receivable (A/R) aging summary across brackets (Current, 1-30 days, 31-60 days, 61-90 days, 90+ days) and customer balances.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getOverdueInvoices',
    description: 'Retrieve list of unpaid tax invoices past credit due dates with customer name, TRN, balance due in AED, and overdue days.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        minAmount: { type: Type.NUMBER, description: 'Optional minimum balance due in AED' },
      },
    },
  },
  {
    name: 'getPnl',
    description: 'Retrieve Monthly Statement of Profit & Loss (P&L) from the General Ledger: total revenue, cost of goods & services (COGS), gross profit, operating expenses (OPEX), and net profit in AED.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        month: { type: Type.STRING, description: 'Fiscal month in YYYY-MM format (e.g. 2026-03)' },
      },
    },
  },
  {
    name: 'getCustomerHistory',
    description: 'Retrieve comprehensive customer account history: contracts, active and completed work orders, outstanding balances, and total spend.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING, description: 'Customer name or company name (e.g. Fatima, Sobha, Emaar)' },
      },
      required: ['customerName'],
    },
  },
];
