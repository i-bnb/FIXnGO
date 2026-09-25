import { NextResponse } from 'next/server';
import { getCustomerBookings } from '../../../lib/server/booking-store';

export async function GET() {
  try {
    const bookings = getCustomerBookings();
    
    // Map bookings to Admin ServiceRequest format
    const requests = bookings.map((b) => ({
      id: b.id,
      ticketNumber: b.ticketNumber,
      customerName: 'Fatima Al Mansoori',
      phone: '+971 50 900 3001',
      siteName: b.address,
      area: b.area,
      category: b.category,
      title: b.title,
      description: b.description,
      priority: b.status === 'EN_ROUTE' ? 'EMERGENCY' : 'HIGH',
      status: b.status === 'COMPLETED' ? 'RESOLVED' : b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE' ? 'CONVERTED' : 'PENDING',
      slaMinutesRemaining: b.status === 'COMPLETED' ? 0 : 45,
      slaDeadline: 'Today, 03:00 PM',
      source: 'CUSTOMER_APP',
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}
