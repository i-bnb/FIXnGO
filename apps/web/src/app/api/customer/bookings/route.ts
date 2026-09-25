import { NextResponse } from 'next/server';
import { getCustomerBookings } from '../../../../lib/server/booking-store';

export async function GET() {
  try {
    const bookings = getCustomerBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch customer bookings' },
      { status: 500 }
    );
  }
}
