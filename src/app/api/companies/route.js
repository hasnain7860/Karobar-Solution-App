import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../../lib/db';
import Company from '../../../models/Company';
import { verifyJwt } from '../../../lib/auth';

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return null;
  return await verifyJwt(token.value);
}

// GET & POST (Existing)
export async function GET(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const companies = await Company.find({ businessId: decoded.businessId });
  return NextResponse.json(companies);
}

export async function POST(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await request.json();
  try {
    const company = await Company.create({
      _id: body._id,
      businessId: decoded.businessId,
      name: body.name,
      isActive: true
    });
    return NextResponse.json(company, { status: 201 });
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
    const updated = await Company.findOneAndUpdate(
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
  await Company.findOneAndDelete({ _id: id, businessId: decoded.businessId });
  return NextResponse.json({ message: 'Deleted' }, { status: 200 });
}


