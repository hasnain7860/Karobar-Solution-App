"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CloudDownload, CheckCircle, AlertCircle } from 'lucide-react';
import { saveToIndexedDB } from '../../../lib/idb-service.js'; // Relative path

export default function SyncPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Connecting to server...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startSync = async () => {
      try {
        // Step 1: Fetch Data
        setStatus('Downloading Business Data...');
        setProgress(20);
        
        const response = await fetch('/api/sync');
        
        if (!response.ok) {
          throw new Error('Failed to connect to server.');
        }

        const data = await response.json();
        setProgress(50);

        // Step 2: Save to IndexedDB
        setStatus('Saving to Local Database...');
        
        if (data.business) {
          await saveToIndexedDB('business', data.business);
        }
        
        if (data.products && data.products.length > 0) {
            setStatus(`Saving ${data.products.length} Products...`);
            await saveToIndexedDB('products', data.products);
        }

        if (data.parties && data.parties.length > 0) {
            setStatus(`Saving ${data.parties.length} Parties...`);
            await saveToIndexedDB('parties', data.parties);
        }
        
        // Inside your Sync Page logic (when sync completes)
localStorage.setItem('last_sync_time', new Date().toISOString());
router.push('/dashboard');

        setProgress(100);
        setStatus('Sync Complete!');

        // Step 3: Redirect
        setTimeout(() => {
          router.replace('/dashboard');
        }, 500); // Thora delay taake user "100%" dekh sake

      } catch (err) {
        console.error('Sync Error:', err);
        setError(err.message || 'Sync Failed');
      }
    };

    startSync();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-sm text-center">
        
        {/* Icon Logic */}
        <div className="mb-6 flex justify-center">
          {error ? (
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-10 h-10" />
            </div>
          ) : progress === 100 ? (
            <div className="p-4 bg-green-100 rounded-full text-green-600">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="p-4 bg-blue-100 rounded-full text-blue-600 animate-pulse">
              <CloudDownload className="w-10 h-10" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {error ? 'Sync Failed' : 'Setting up your App'}
        </h2>
        
        <p className="text-gray-500 mb-8 text-sm">
          {error ? error : status}
        </p>

        {/* Progress Bar */}
        {!error && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Error Retry Button */}
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

