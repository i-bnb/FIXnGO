import { NextResponse } from 'next/server';
import { getCustomerQuotation } from '../../../../lib/server/booking-store';

export async function GET() {
  try {
    const quotation = getCustomerQuotation();
    return NextResponse.json({ success: true, quotation });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}
