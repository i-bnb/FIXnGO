# ADR 004: Double-Entry General Ledger Architecture

## Status
Accepted

## Context
A field-service ERP that only records operational invoices without an underlying financial ledger creates a reconciliation nightmare. To present a compelling ERP demo to C-level executives (CEOs, CFOs, Operations Directors), FieldOps ERP must accurately model the financial consequences of field operations:
- Generating a customer invoice must debit Accounts Receivable, credit Service Revenue, and credit UAE Output VAT (5%).
- Collecting a customer payment must debit Cash/Bank and credit Accounts Receivable.
- Issuing a purchase order and receiving goods must debit Inventory and credit Accounts Payable + Input VAT.
- Consuming materials on a job site must credit Inventory and debit Cost of Goods Sold (COGS).
- Tracking technician labour hours must recognize Cost of Direct Labour.

## Decision
We implement a **Standard UAE Double-Entry Accounting Ledger**:
1. **UAE Chart of Accounts (`chart_of_accounts`)**:
   - `1000 - Assets`: `1010` Bank Account (ADCB / Emirates NBD), `1020` Petty Cash, `1100` Accounts Receivable, `1200` Materials Inventory, `1300` Input VAT Recoverable (5%).
   - `2000 - Liabilities`: `2010` Accounts Payable, `2100` Output VAT Payable (5%), `2200` Customer Advance Deposits.
   - `3000 - Equity`: `3010` Share Capital, `3020` Retained Earnings.
   - `4000 - Revenue`: `4010` MEP Maintenance Revenue, `4020` Labour Supply Revenue, `4030` Equipment Rental Revenue, `4040` Material Counter Sales Revenue.
   - `5000 - Cost of Sales`: `5010` Cost of Direct Materials, `5020` Direct Labour Cost, `5030` Equipment Mobilization Cost.
   - `6000 - Operating Expenses`: `6010` Vehicle Fuel & Maintenance, `6020` Utilities & Office, `6030` Depreciation.
2. **Double-Entry Invariants**:
   - Every `journal_entry` contains two or more `journal_lines`.
   - `SUM(debit_amount) == SUM(credit_amount)` enforced at database constraint and application transaction level.
3. **Automated Event-Driven Posting**:
   - Work order completion -> Invoice creation -> Auto-posts AR debit, Revenue credit, VAT output credit.
   - Payment processed -> Auto-posts Bank debit, AR credit.
   - Material issue to job -> Auto-posts COGS debit, Inventory credit.

## Consequences
- **Positive**: Complete financial integrity, instant P&L reporting (`v_monthly_pnl`), receivables aging (`v_receivables_aging`), and true ERP depth that sets the platform apart in sales demonstrations.
- **Negative**: Adds schema complexity and requires automated posting triggers on billing and purchasing workflows.
