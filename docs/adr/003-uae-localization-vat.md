# ADR 003: UAE Localization and 5% VAT Compliance

## Status
Accepted

## Context
Operating in the United Arab Emirates requires strict compliance with:
- Federal Tax Authority (FTA) 5% VAT rules on taxable supplies of services and goods.
- Tax Invoice layout with Supplier Tax Registration Number (TRN), line items, VAT rate, VAT amount, and total payable in AED.
- Bilingual layout: English (LTR) and Arabic (RTL), plus Hindi translation support.
- Dubai/UAE specific addressing (Emirate, Area/District, Makani number, landmark).

## Decision
1. Standard VAT rate is defined globally as `0.05` in `@fieldops/shared`.
2. Company TRN is set to `100000000000003 (demo)`.
3. Invoices compute:
   - `subtotal = sum(item.quantity * item.unit_price)`
   - `tax_amount = round(subtotal * 0.05, 2)`
   - `total_amount = subtotal + tax_amount`
4. Next.js uses `next-intl` with locale prefix routing (`/[locale]/...`).
5. Root layout sets `<html dir="rtl">` when locale is `ar` and `<html dir="ltr">` for `en`.

## Consequences
- Accurate and legally compliant invoicing demonstrations for UAE clients.
- Polished bilingual Arabic experience with native right-to-left layout.
