import { UAE_CONSTANTS } from '../constants/uae';

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

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round((distance + Number.EPSILON) * 100) / 100;
}

export function estimateEtaMinutes(distanceKm: number, averageSpeedKmh: number = 40): number {
  if (distanceKm <= 0) return 0;
  // Traffic buffer for UAE urban corridors
  const hours = (distanceKm * 1.2) / averageSpeedKmh;
  return Math.max(5, Math.round(hours * 60));
}

