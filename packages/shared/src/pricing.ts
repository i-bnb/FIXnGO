/**
 * Single Source of Truth: ONE MONEY ENGINE for FIXnGO
 *
 * All monetary calculations MUST use integer fils (1 AED = 100 fils).
 * No floating point precision drift.
 * Standard UAE VAT is 5% calculated on the subtotal after discounts.
 */

export const FILS_PER_AED = 100;
export const UAE_VAT_PERCENT = 5;
export const DEFAULT_LABOUR_ROUNDING_MINUTES = 15;

/**
 * Converts AED decimal (e.g. 120.50) to integer fils (12050).
 */
export function aedToFils(aed: number): number {
  if (isNaN(aed) || !isFinite(aed)) return 0;
  return Math.round(aed * FILS_PER_AED);
}

/**
 * Converts integer fils (e.g. 12050) to AED decimal (120.5).
 */
export function filsToAed(fils: number): number {
  if (isNaN(fils) || !isFinite(fils)) return 0;
  return Math.round(fils) / FILS_PER_AED;
}

/**
 * Formats fils or AED into a standard UAE currency string: "1,250.00 AED".
 */
export function formatAed(amount: number, isFils: boolean = false): string {
  const aed = isFils ? filsToAed(amount) : amount;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(aed)
    .replace('AED', '')
    .trim() + ' AED';
}

/**
 * Rounds minutes up to the nearest configured interval (default 15 minutes).
 * E.g. 5 mins -> 15 mins; 16 mins -> 30 mins; 60 mins -> 60 mins.
 */
export function roundMinutesUp(
  minutes: number,
  intervalMinutes: number = DEFAULT_LABOUR_ROUNDING_MINUTES,
): number {
  if (minutes <= 0) return 0;
  if (intervalMinutes <= 1) return Math.ceil(minutes);
  return Math.ceil(minutes / intervalMinutes) * intervalMinutes;
}

export interface LabourItemInput {
  hours?: number;
  minutes?: number;
  hourlyRateAed?: number;
  hourlyRateFils?: number;
  roundingIntervalMinutes?: number;
}

export interface PartItemInput {
  quantity: number;
  unitPriceAed?: number;
  unitPriceFils?: number;
}

export interface ExpenseItemInput {
  amountAed?: number;
  amountFils?: number;
}

export interface PricingBreakdown {
  labourFils: number;
  partsFils: number;
  expensesFils: number;
  callOutFeeFils: number;
  discountFils: number;
  subtotalFils: number;
  vatFils: number;
  totalFils: number;

  // Decimal AED representations
  labourAed: number;
  partsAed: number;
  expensesAed: number;
  callOutFeeAed: number;
  discountAed: number;
  subtotalAed: number;
  vatAed: number;
  totalAed: number;

  // Formatted string representations
  subtotalFormatted: string;
  vatFormatted: string;
  totalFormatted: string;
}

export interface CalculatePricingOptions {
  labour?: LabourItemInput[];
  labourFils?: number;
  labourAed?: number;

  parts?: PartItemInput[];
  partsFils?: number;
  partsAed?: number;

  expenses?: ExpenseItemInput[];
  expensesFils?: number;
  expensesAed?: number;

  callOutFeeFils?: number;
  callOutFeeAed?: number;

  discountFils?: number;
  discountAed?: number;
  discountPercent?: number;

  vatRatePercent?: number; // Defaults to 5
}

/**
 * Calculates labour billable minutes and fils with configured rounding interval.
 */
export function calculateLabourItem(item: LabourItemInput): {
  billableMinutes: number;
  billableHours: number;
  labourFils: number;
  labourAed: number;
} {
  const totalMinutes = (item.minutes || 0) + (item.hours ? item.hours * 60 : 0);
  const interval = item.roundingIntervalMinutes || DEFAULT_LABOUR_ROUNDING_MINUTES;
  const billableMinutes = roundMinutesUp(totalMinutes, interval);
  const billableHours = billableMinutes / 60;

  const rateFils = item.hourlyRateFils !== undefined
    ? Math.round(item.hourlyRateFils)
    : aedToFils(item.hourlyRateAed || 0);

  const labourFils = Math.round((billableMinutes * rateFils) / 60);

  return {
    billableMinutes,
    billableHours,
    labourFils,
    labourAed: filsToAed(labourFils),
  };
}

/**
 * The ONE Master Pricing Function.
 * Computes labour, parts, expenses, callout fee, discount, subtotal, 5% VAT and total.
 */
export function calculatePricing(options: CalculatePricingOptions = {}): PricingBreakdown {
  // 1. Labour
  let labourFils = 0;
  if (options.labour && options.labour.length > 0) {
    for (const item of options.labour) {
      labourFils += calculateLabourItem(item).labourFils;
    }
  } else if (options.labourFils !== undefined) {
    labourFils = Math.round(options.labourFils);
  } else if (options.labourAed !== undefined) {
    labourFils = aedToFils(options.labourAed);
  }

  // 2. Parts
  let partsFils = 0;
  if (options.parts && options.parts.length > 0) {
    for (const part of options.parts) {
      const qty = Math.max(0, part.quantity || 0);
      const unitFils = part.unitPriceFils !== undefined
        ? Math.round(part.unitPriceFils)
        : aedToFils(part.unitPriceAed || 0);
      partsFils += Math.round(qty * unitFils);
    }
  } else if (options.partsFils !== undefined) {
    partsFils = Math.round(options.partsFils);
  } else if (options.partsAed !== undefined) {
    partsFils = aedToFils(options.partsAed);
  }

  // 3. Expenses
  let expensesFils = 0;
  if (options.expenses && options.expenses.length > 0) {
    for (const exp of options.expenses) {
      const expFils = exp.amountFils !== undefined
        ? Math.round(exp.amountFils)
        : aedToFils(exp.amountAed || 0);
      expensesFils += expFils;
    }
  } else if (options.expensesFils !== undefined) {
    expensesFils = Math.round(options.expensesFils);
  } else if (options.expensesAed !== undefined) {
    expensesFils = aedToFils(options.expensesAed);
  }

  // 4. Call-out Fee
  let callOutFeeFils = 0;
  if (options.callOutFeeFils !== undefined) {
    callOutFeeFils = Math.round(options.callOutFeeFils);
  } else if (options.callOutFeeAed !== undefined) {
    callOutFeeFils = aedToFils(options.callOutFeeAed);
  }

  // Gross before discount
  const grossFils = labourFils + partsFils + expensesFils + callOutFeeFils;

  // 5. Discount
  let discountFils = 0;
  if (options.discountPercent !== undefined && options.discountPercent > 0) {
    const pct = Math.min(100, Math.max(0, options.discountPercent));
    discountFils = Math.round((grossFils * pct) / 100);
  } else if (options.discountFils !== undefined) {
    discountFils = Math.round(options.discountFils);
  } else if (options.discountAed !== undefined) {
    discountFils = aedToFils(options.discountAed);
  }

  // Subtotal cannot be negative
  discountFils = Math.min(grossFils, Math.max(0, discountFils));
  const subtotalFils = grossFils - discountFils;

  // 6. UAE VAT (5% on subtotal after discount)
  const vatRate = options.vatRatePercent !== undefined ? options.vatRatePercent : UAE_VAT_PERCENT;
  const vatFils = Math.round((subtotalFils * vatRate) / 100);

  // 7. Total
  const totalFils = subtotalFils + vatFils;

  return {
    labourFils,
    partsFils,
    expensesFils,
    callOutFeeFils,
    discountFils,
    subtotalFils,
    vatFils,
    totalFils,

    labourAed: filsToAed(labourFils),
    partsAed: filsToAed(partsFils),
    expensesAed: filsToAed(expensesFils),
    callOutFeeAed: filsToAed(callOutFeeFils),
    discountAed: filsToAed(discountFils),
    subtotalAed: filsToAed(subtotalFils),
    vatAed: filsToAed(vatFils),
    totalAed: filsToAed(totalFils),

    subtotalFormatted: formatAed(subtotalFils, true),
    vatFormatted: formatAed(vatFils, true),
    totalFormatted: formatAed(totalFils, true),
  };
}
