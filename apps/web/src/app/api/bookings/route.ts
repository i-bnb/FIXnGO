import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getCustomerBookings } from '../../../lib/server/booking-store';

export async function GET() {
  const bookings = getCustomerBookings();
  return NextResponse.json({ success: true, bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.category || !body?.taskId || !body?.title) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking fields (category, taskId, title)' },
        { status: 400 }
      );
    }

    const { booking, isDuplicate } = createBooking({
      serviceType: body.serviceType || body.category,
      category: body.category,
      taskId: body.taskId,
      title: body.title,
      description: body.description,
      photoUrl: body.photoUrl,
      address: body.address || 'Burj Crown, Downtown Dubai',
      area: body.area || 'Downtown Dubai',
      latitude: body.latitude || 25.1972,
      longitude: body.longitude || 55.2744,
      scheduledDate: body.scheduledDate || 'Today',
      scheduledSlot: body.scheduledSlot || 'Immediate Callout',
      workersCount: body.workersCount,
      daysCount: body.daysCount,
      startDate: body.startDate,
      endDate: body.endDate,
      pricingType: body.pricingType || 'FIXED',
      estimatedPriceAed: body.estimatedPriceAed,
      idempotencyKey: body.idempotencyKey,
    });

    // Also attempt forward to Nest backend if running
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    try {
      await fetch(`${apiUrl}/api/work-orders/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: body.serviceType || body.category,
          title: body.title,
          description: body.description,
          address: body.address,
          latitude: body.latitude,
          longitude: body.longitude,
          scheduledDate: body.scheduledDate,
        }),
      });
    } catch {
      // Background sync note: local store already captured booking
    }

    return NextResponse.json({
      success: true,
      isDuplicate,
      booking,
      workOrderNumber: booking.orderNumber,
      ticketNumber: booking.ticketNumber,
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
