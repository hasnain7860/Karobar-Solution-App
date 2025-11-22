import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../../lib/db';
import Unit from '../../../models/Unit';
import { verifyJwt } from '../../../lib/auth';

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return null;
  return await verifyJwt(token.value);
}

// GET and POST (Existing - keeping them for completeness)
export async function GET(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const units = await Unit.find({ businessId: decoded.businessId });
  return NextResponse.json(units);
}

export async function POST(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await request.json();
  try {
    const unit = await Unit.create({
      _id: body._id,
      businessId: decoded.businessId,
      name: body.name,
      isActive: true
    });
    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ message: 'Already synced' }, { status: 200 });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- NEW METHODS TO FIX 405 ERROR ---

export async function PUT(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const body = await request.json();
  
  try {
    const updated = await Unit.findOneAndUpdate(
      { _id: body._id, businessId: decoded.businessId },
      { $set: { name: body.name } },
      { new: true }
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  await dbConnect();
  await Unit.findOneAndDelete({ _id: id, businessId: decoded.businessId });
  return NextResponse.json({ message: 'Deleted' }, { status: 200 });
}


