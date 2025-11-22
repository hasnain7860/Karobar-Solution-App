"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// --- Validation Schema ---
const signupSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const [apiError, setApiError] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (formData) => {
    setApiError(null);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success
      router.push('/onboarding');

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
        {/* Placeholder for logo until you add it to public/ */}
        {/* <Image src="/logo-full.png" alt="Logo" width={200} height={45} priority /> */}
        <h1 className="text-2xl font-bold text-brand">Karobar Solution</h1>
      </div>
      
      <h2 className="text-2xl font-semibold text-text-dark text-center mb-2">
        Create Account
      </h2>
      <p className="text-base text-text-medium text-center mb-8">
        Apna naya business account banayein.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-error focus:ring-error/50' 
                : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="e.g., Ali Ahmed"
          />
          {errors.name && (
            <p className="text-sm text-error mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email 
                ? 'border-error focus:ring-error/50' 
                : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.password 
                ? 'border-error focus:ring-error/50' 
                : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="Min. 6 characters"
          />
          {errors.password && (
            <p className="text-sm text-error mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.confirmPassword 
                ? 'border-error focus:ring-error/50' 
                : 'border-border-light focus:ring-brand/50'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-error mt-1">{errors.confirmPassword.message}</p>
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
            'Create Account'
          )}
        </button>
      </form>

      <footer className="text-center mt-8">
        <p className="text-sm text-text-medium">
          Pehle se account hai?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Yahan Login Karein
          </Link>
        </p>
      </footer>
    </div>
  );
}

