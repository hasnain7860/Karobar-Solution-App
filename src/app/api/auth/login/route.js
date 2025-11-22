import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { signJwt } from '../../../../lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // 1. FIX: Explicitly select passwordHash (schema mein select: false hai)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // 2. FIX: Compare using passwordHash (camelCase)
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // 3. FIX: payload mein businessId (camelCase)
    const token = await signJwt({ 
      userId: user._id.toString(),
      role: user.role,
      businessId: user.businessId ? user.businessId.toString() : null
    });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, 
      path: '/',
    });

    return NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        // FIX: Response mein bhi businessId standardize karein
        businessId: user.businessId ? user.businessId.toString() : null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
