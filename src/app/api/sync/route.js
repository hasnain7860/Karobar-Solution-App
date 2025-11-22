import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../../lib/db'; // Adjusted path
import Business from '../../../models/Business';
import { verifyJwt } from '../../../lib/auth';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJwt(token.value);
    // FIX: Check 'businessId' camelCase
    if (!decoded || !decoded.businessId) {
      return NextResponse.json({ message: 'Business ID missing' }, { status: 400 });
    }

    const businessId = decoded.businessId;
    await dbConnect();

    const [business] = await Promise.all([
      Business.findById(businessId).lean(),
    ]);

    if (!business) {
      return NextResponse.json({ message: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      // Note: 'business' object ab camelCase keys return karega (businessName, ownerId, etc.)
      business: { ...business, id: 'current_business' }, 
      products: [], 
      parties: [], 
    });

  } catch (error) {
    console.error('SYNC_API_ERROR:', error);
    return NextResponse.json({ message: 'Sync failed' }, { status: 500 });
  }
}
