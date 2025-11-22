import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // 'jose' is required for Edge Runtime

// Routes jinhe protect karna hai
const protectedAppRoutes = ['/onboarding', '/dashboard'];

// JWT Verification Helper for Edge Runtime
async function verifyToken(token) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null; // Invalid or expired token
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  
  // Await is zaroori hai kyunki jose async hai
  const payload = await verifyToken(token);

  // --- Case 1: User ke paas valid token hai ---
  if (payload) {
    // Agar logged-in user Login/Signup page par wapas aaye
    if (pathname === '/login' || pathname === '/signup') {
      const url = request.nextUrl.clone();
      // Role check kar ke sahi jagah bhejein
      url.pathname = payload.role === 'pending_onboarding' ? '/onboarding' : '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Onboarding Restriction: Agar user setup kar chuka hai to onboarding par na jaye
    if (pathname === '/onboarding' && payload.role !== 'pending_onboarding') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Allowed
    return NextResponse.next();
  }

  // --- Case 2: User ke paas valid token NAHI hai ---
  if (protectedAppRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Yeh line URL mein ?redirect=/dashboard add karti hai
    url.search = `?redirect=${pathname}`; 
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

