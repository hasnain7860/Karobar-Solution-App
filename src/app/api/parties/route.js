import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '../../../lib/db';
import Party from '../../../models/Party';
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
  // Sirf active parties bhejo ya sari, ye business logic pe depend karta hai
  const parties = await Party.find({ businessId: decoded.businessId });
  return NextResponse.json({ parties });
}

// --- 2. POST (Create New) ---
export async function POST(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  try {
    // Duplicate ID check handled by Mongoose unique constraint (if _id is duplicated)
    // Hum 'findByIdAndUpdate' with upsert: true bhi use kar sakte hain safe side ke liye
    // Lekin 'create' is fine agar hum trust karte hain ke UUID unique hai
    
    const party = await Party.create({
      _id: body._id, // Trusting Client UUID
      businessId: decoded.businessId,
      name: body.name,
      type: body.type,
      phone: body.phone,
      address: body.address,
      email: body.email,
      balance: body.balance || 0,
      isActive: true
    });

    return NextResponse.json({ message: 'Synced', party }, { status: 201 });
  } catch (error) {
    // Agar duplicate key error (11000) hai, iska matlab pehle hi sync ho chuka hai
    if (error.code === 11000) {
       return NextResponse.json({ message: 'Already synced' }, { status: 200 }); // 200 OK taake queue se hat jaye
    }
    console.error('POST_ERROR:', error);
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}

// --- 3. PUT (Update Existing) ---
export async function PUT(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  if (!body._id) {
    return NextResponse.json({ message: 'ID required for update' }, { status: 400 });
  }

  try {
    // Sirf wahi fields update karo jo allow hain
    const updatedParty = await Party.findOneAndUpdate(
      { _id: body._id, businessId: decoded.businessId }, // Security: Apne business ka hi data update ho
      {
        $set: {
          name: body.name,
          type: body.type,
          phone: body.phone,
          address: body.address,
          email: body.email,
          // Balance logic alag honi chahiye usually, lekin abhi sync ke liye theek hai
          updatedAt: new Date() 
        }
      },
      { new: true } // Return updated doc
    );

    if (!updatedParty) {
      // Agar party nahi mili, to shayad wo delete ho chuki hai ya user ki nahi hai.
      // Sync ko rokne ke liye 404 return karo, lekin queue logic mein humein dekhna parega
      // Filhal 404 return karte hain.
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Updated', party: updatedParty }, { status: 200 });
  } catch (error) {
    console.error('PUT_ERROR:', error);
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}

// --- 4. DELETE (Remove) ---
export async function DELETE(request) {
  const decoded = await authenticate();
  if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'ID required' }, { status: 400 });
  }

  await dbConnect();

  try {
    const deleted = await Party.findOneAndDelete({ _id: id, businessId: decoded.businessId });
    
    // Note: Agar 'deleted' null hai (matlab pehle hi delete ho gaya), tab bhi hum success return karte hain
    // Taake offline queue phansi na rahe (Idempotency).
    
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}


