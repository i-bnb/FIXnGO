import { UAE_CONSTANTS } from '@fieldops/shared';

export interface VatCalculationResult {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

export function calculateUaeVat(subtotal: number): VatCalculationResult {
  const roundedSubtotal = Math.round((subtotal + Number.EPSILON) * 100) / 100;
  const vatAmount = Math.round((roundedSubtotal * UAE_CONSTANTS.VAT_RATE + Number.EPSILON) * 100) / 100;
  const totalAmount = Math.round((roundedSubtotal + vatAmount + Number.EPSILON) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    vatRate: UAE_CONSTANTS.VAT_RATE,
    vatAmount,
    totalAmount,
  };
}
