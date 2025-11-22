import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { signJwt } from '../../../../lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      // FIX: Schema ke mutabiq 'passwordHash'
      passwordHash, 
      role: 'pending_onboarding',
      // FIX: Schema ke mutabiq 'businessId'
      businessId: null,
    });

    await newUser.save();

    const token = await signJwt({ 
      userId: newUser._id.toString(),
      role: newUser.role,
      businessId: null
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
      message: 'User created successfully. Redirecting to onboarding...',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('SIGNUP_ERROR:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
