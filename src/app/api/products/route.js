import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../../lib/db';
import Product from '../../../models/Product';
import { verifyJwt } from '../../../lib/auth';

// --- AUTH HELPER ---
async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return null;
  return await verifyJwt(token.value);
}

// --- 1. GET (Sync Down) ---
export async function GET(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  // Hum saare fields return karenge
  const products = await Product.find({ businessId: decoded.businessId });
  return NextResponse.json(products);
}

// --- 2. POST (Create New) ---
export async function POST(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  try {
    const product = await Product.create({
      _id: body._id, // Client UUID
      businessId: decoded.businessId,
      
      // Basic Info
      name: body.name,
      nameUrdu: body.nameUrdu,
      image: body.image, // Base64 String
      
      // Relations
      companyId: body.companyId || null,
      baseUnitId: body.baseUnitId,
      secondaryUnitId: body.secondaryUnitId || null,
      conversionRate: body.conversionRate || 1,
      barcode: body.barcode,
      
      // Batches Array
      batches: body.batches || [],
      
      // --- STOCK SEGMENTATION FIELDS ---
      openingStock: body.openingStock || 0,
      purchasedStock: body.purchasedStock || 0,
      soldStock: body.soldStock || 0,
      damagedStock: body.damagedStock || 0,
      
      // Calculated Total
      totalQuantity: body.totalQuantity || 0,
      
      isActive: true
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    // Duplicate Key Error (Sync Retry Scenario)
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Already synced' }, { status: 200 });
    }
    console.error('PRODUCT_POST_ERROR', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- 3. PUT (Update Existing) ---
export async function PUT(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  if (!body._id) return NextResponse.json({ message: 'ID missing' }, { status: 400 });

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: body._id, businessId: decoded.businessId },
      {
        $set: {
          // Update All Fields
          name: body.name,
          nameUrdu: body.nameUrdu,
          image: body.image,
          
          companyId: body.companyId,
          baseUnitId: body.baseUnitId,
          secondaryUnitId: body.secondaryUnitId,
          conversionRate: body.conversionRate,
          barcode: body.barcode,
          batches: body.batches, // Replace entire batch array
          
          // Update Stock Fields
          openingStock: body.openingStock,
          purchasedStock: body.purchasedStock,
          soldStock: body.soldStock,
          damagedStock: body.damagedStock,
          totalQuantity: body.totalQuantity,
          
          updatedAt: new Date()
        }
      },
      { new: true } // Return updated document
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error) {
    console.error('PRODUCT_PUT_ERROR', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- 4. DELETE (Remove Product) ---
export async function DELETE(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

  await dbConnect();

  try {
    // Hard Delete
    await Product.findOneAndDelete({ _id: id, businessId: decoded.businessId });
    
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('PRODUCT_DELETE_ERROR', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


