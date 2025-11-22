"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';

// Step 1: Business Details
function Step1({ data, setData, nextStep }) {
  const businessTypes = [
    { id: 'distributor', name: 'Distributor' },
    { id: 'wholesaler', name: 'Wholesaler' },
    { id: 'retailer', name: 'Retailer' },
  ];

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-text-dark mb-2">Welcome to Karobar Solution</h2>
        <p className="text-text-medium">Pehle apne business ki basic details batayein.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-text-dark mb-2">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={data.businessName}
            onChange={(e) => setData({ ...data, businessName: e.target.value })}
            className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
            placeholder="e.g., MMK Distributors"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Business Type</label>
          <div className="grid grid-cols-3 gap-3">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setData({ ...data, businessType: type.id })}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ${
                  data.businessType === type.id
                    ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand'
                    : 'border-border-light text-text-medium hover:bg-gray-50'
                }`}
              >
                <span className="capitalize font-medium text-sm">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="button"
          onClick={nextStep}
          disabled={!data.businessName || !data.businessType}
          className="w-full py-4 bg-brand text-white text-base font-medium rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </>
  );
}

// Step 2: Module Selection
function Step2({ data, setData, handleSubmit, prevStep, loading }) {
  const modules = [
    { id: 'pos', name: 'POS (Point of Sale)', desc: 'Billing & Cash Counter' },
    { id: 'preordering', name: 'Pre-Ordering', desc: 'Order Booking App' },
    { id: 'inventory', name: 'Inventory', desc: 'Stock Management' },
    { id: 'accounts', name: 'Accounts (Khata)', desc: 'Ledgers & Balance' },
    { id: 'reports', name: 'Business Reports', desc: 'Analytics & Insights' },
  ];

  const toggleModule = (moduleId) => {
    setData(prevData => {
      const newModules = prevData.modules.includes(moduleId)
        ? prevData.modules.filter(id => id !== moduleId)
        : [...prevData.modules, moduleId];
      return { ...prevData, modules: newModules };
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-text-dark mb-2">Select Your Modules</h2>
        <p className="text-text-medium">Aapko kin features ki zaroorat hai?</p>
      </div>
      
      <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {modules.map((mod) => {
          const isSelected = data.modules.includes(mod.id);
          return (
            <label
              key={mod.id}
              className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 group ${
                isSelected
                  ? 'bg-brand/5 border-brand ring-1 ring-brand/50 z-10'
                  : 'border-border-light hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleModule(mod.id)}
                className="hidden"
              />
              
              <div className={`w-6 h-6 flex-shrink-0 rounded border-2 mr-4 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-brand border-brand' : 'border-gray-300 group-hover:border-gray-400'
              }`}>
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </div>
              
              <div className="flex flex-col">
                <span className={`font-medium ${isSelected ? 'text-brand' : 'text-text-dark'}`}>
                  {mod.name}
                </span>
                <span className={`text-xs ${isSelected ? 'text-brand/80' : 'text-text-medium'}`}>
                  {mod.desc}
                </span>
              </div>
            </label>
          );
        })}
      </div>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="w-1/3 py-4 bg-gray-100 text-text-dark text-base font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={data.modules.length === 0 || loading}
          className="w-2/3 flex items-center justify-center py-4 bg-brand text-white text-base font-medium rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Setting up...
            </>
          ) : (
            'Finish Setup'
          )}
        </button>
      </div>
    </>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // DATA IS NOW CAMELCASE TO MATCH API & SCHEMA
  const [data, setData] = useState({
    businessName: '',
    businessType: '',
    modules: ['pos', 'inventory', 'accounts'],
    contactPhone: '',     
    settingsPrintMode: 'pdf',
    settingsPaperSize: 'a4', 
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        
        throw new Error(resData.message || 'Failed to create business.');
      }

      // Success
      router.push('/sync'); 

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-xl relative overflow-hidden border border-border-light">
        
        <div className="flex justify-center mb-8">
           {/* Logo Placeholder */}
           {/* <Image src="/logo-full.png" alt="Karobar Solution" width={180} height={40} priority /> */}
           <h1 className="text-2xl font-bold text-brand">Karobar Solution</h1>
        </div>

        {/* Loading Overlay */}
        {step === 2 && loading && (
           <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 rounded-2xl">
             <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
             <p className="text-text-dark font-medium animate-pulse">Creating your digital dukaan...</p>
           </div>
        )}

        <div className={loading ? 'opacity-40 pointer-events-none filter blur-[1px] transition-all' : 'transition-all'}>
          {step === 1 && <Step1 data={data} setData={setData} nextStep={nextStep} />}
          
          {step === 2 && (
            <Step2 
              data={data} 
              setData={setData} 
              handleSubmit={handleSubmit} 
              prevStep={prevStep} 
              loading={loading} 
            />
          )}
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
            <div className="text-error mt-0.5">⚠️</div>
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}


