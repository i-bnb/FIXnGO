import { NextRequest, NextResponse } from 'next/server';
import { updateCustomerQuotationStatus } from '../../../../../lib/server/booking-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const action = body?.action; // 'APPROVE' or 'REJECT'

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    const updated = updateCustomerQuotationStatus(id, action === 'APPROVE' ? 'APPROVED' : 'REJECTED');

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation: updated,
      status: updated.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update quotation' },
      { status: 500 }
    );
  }
}
