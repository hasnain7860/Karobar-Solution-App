import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Path adjust kiya hai (4 levels up to reach 'lib' and 'models')
// app/api/business/onboarding/route.js -> ../../../../lib/db
import dbConnect from '../../../lib/db'; 
import User from '../../../models/User';
import Business from '../../../models/Business';
import { verifyJwt, signJwt } from '../../../lib/auth.js';

export async function POST(request) {
  let newlyCreatedBusinessId = null;

  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const decodedToken = await verifyJwt(token.value);
    
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
    }
    
    const userId = decodedToken.userId;

    // 2. DB Connect
    await dbConnect();
    
    // 3. User Validation
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Agar user pehle se kisi business ka hissa hai
    if (user.businessId) {
      return NextResponse.json({ message: 'Onboarding already completed.' }, { status: 400 });
    }

    // 4. Data Parse (Frontend ab camelCase bhej raha hai)
    const body = await request.json();
    const {
      businessName,
      businessType,
      modules,
      contactPhone,
      settingsPrintMode,
      settingsPaperSize,
    } = body;

    // Validation
    if (!businessName || !businessType || !modules) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 5. Create Business
    const newBusiness = new Business({
      businessName, // camelCase schema field
      businessType,
      modules,
      contact: {
        phones: contactPhone ? [contactPhone] : [],
        email: user.email 
      },
      settings: {
        printMode: settingsPrintMode || 'pdf',
        paperSize: settingsPaperSize || 'a4'
      },
      ownerId: user._id,
    });

    await newBusiness.save();
    newlyCreatedBusinessId = newBusiness._id;

    // 6. User Update
    user.businessId = newBusiness._id;
    user.role = 'admin'; // Role upgrade
    await user.save();

    // 7. Update Token
    const newToken = await signJwt({
      userId: user._id.toString(),
      role: user.role,
      businessId: newBusiness._id.toString()
    });

    cookieStore.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ 
      message: 'Business created successfully!',
      businessId: newBusiness._id 
    }, { status: 201 });

  } catch (error) {
    // Rollback: Agar user update fail hua to business delete karo
    if (newlyCreatedBusinessId) {
      try {
        await Business.findByIdAndDelete(newlyCreatedBusinessId);
      } catch (e) {
        console.error('ROLLBACK_FAILED', e);
      }
    }

    console.error('ONBOARDING_ERROR:', error);
    return NextResponse.json({ message: 'Failed to create business.', error: error.message }, { status: 500 });
  }
}

