"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const [apiError, setApiError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData) => {
    setApiError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // --- LOGIC UPDATE FOR NEW DEVICE SYNC ---
      
      const redirectPath = searchParams.get('redirect');
      const userRole = data.user.role;

      // 1. Sabse pehle: Agar Onboarding pending hai, to koi aur raasta nahi.
      if (userRole === 'pending_onboarding') {
         router.push('/onboarding');
         return;
      } 

      // 2. Check: Kya yeh New Device hai? (Local Data Check)
      // Hum check karte hain ke kya last sync ka time save hai browser mein?
      const lastSyncTime = localStorage.getItem('last_sync_time');

      if (!lastSyncTime) {
         // CASE: New Device or Cleared Cache.
         // User ko force karein ke wo pehle data sync kare.
         console.log("New device detected. Redirecting to Sync...");
         router.push('/sync');
      } 
      else {
         // CASE: Existing Device with Data.
         // Agar URL mein redirect tha to wahan, warna dashboard.
         if (redirectPath) {
            router.push(redirectPath);
         } else {
            router.push('/dashboard');
         }
      }

      // Middleware cookie update catch kare
      router.refresh(); 

    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-8 -mt-2">
        <Link href="/" className="inline-flex items-center text-sm text-text-medium hover:text-text-dark transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </header>
      
      <div className="flex justify-center mb-8">
        <h1 className="text-2xl font-bold text-brand">Karobar Solution</h1>
      </div>
      
      <h2 className="text-2xl font-semibold text-text-dark text-center mb-2">
        Welcome Back
      </h2>
      <p className="text-base text-text-medium text-center mb-8">
        Login to manage your business.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-error focus:ring-error/50' : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-text-dark">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-brand hover:underline">
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.password ? 'border-error focus:ring-error/50' : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-error mt-1">{errors.password.message}</p>
          )}
        </div>

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
             <p className="text-sm text-error text-center">{apiError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center text-center py-4 px-6 bg-brand text-white text-base font-medium rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            'Login'
          )}
        </button>
      </form>

      <footer className="text-center mt-8">
        <p className="text-sm text-text-medium">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-brand hover:underline">
            Sign Up
          </Link>
        </p>
      </footer>
    </div>
  );
}


