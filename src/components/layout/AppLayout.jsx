"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Cloud, 
  CloudOff,
  Bell,
  RefreshCw
} from 'lucide-react';
import { getPendingSyncItems } from '../../lib/idb-service'; // Import zaroori hai

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS', href: '/sales', icon: ShoppingCart },
  { name: 'Inventory', href: '/products', icon: Package },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0); // State for pending items

  const handleLogout = async () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/login";
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // --- SYNC MONITORING LOOP ---
    // Har 2 second baad check karo ke kitni items pending hain
    const syncInterval = setInterval(async () => {
      try {
        const items = await getPendingSyncItems();
        setPendingCount(items.length);
      } catch (e) {
        console.error("Sync Check Error", e);
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-text-dark font-sans">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-light fixed h-full z-30 left-0 top-0 shadow-sm">
        <div className="h-20 flex items-center justify-center border-b border-border-light px-4">
          <div className="relative w-40 h-12">
            <Image 
              src="/logo-full.png" 
              alt="Karobar Solution" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center px-3 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand text-white shadow-md shadow-brand/20' 
                    : 'text-text-medium hover:bg-gray-50 hover:text-text-dark'
                }`}
              >
                <item.icon 
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Sync Details */}
        <div className="p-4 border-t border-border-light bg-gray-50/50">
          <div className="flex flex-col gap-2 mb-4 px-2">
            {/* Online Status */}
            <div className="flex items-center gap-3">
               <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
               <span className="text-xs font-medium text-text-medium">
                 {isOnline ? 'System Online' : 'Offline Mode'}
               </span>
            </div>
            
            {/* Pending Count Indicator (Desktop) */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md mt-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {pendingCount} Uploads Pending...
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>


      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-border-light h-16 z-40 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
           <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm">
             <Image 
               src="/logo-icon.png" 
               alt="Logo" 
               fill
               className="object-cover"
             />
           </div>
           <span className="font-bold text-text-dark text-lg tracking-tight">Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync Status with Badge */}
          <div className={`relative p-2 rounded-full transition-colors ${isOnline ? 'bg-green-50' : 'bg-red-50'}`}>
            {isOnline ? (
              <Cloud className="w-5 h-5 text-green-600" />
            ) : (
              <CloudOff className="w-5 h-5 text-red-600 animate-pulse" />
            )}
            
            {/* RED BADGE for Pending Count */}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {pendingCount}
              </span>
            )}
          </div>
          
          <button className="p-2 text-text-medium hover:bg-gray-100 rounded-full relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>


      {/* ================= MAIN CONTENT ================= */}
      <main className="md:ml-64 min-h-screen pt-20 md:pt-0 pb-24 md:pb-0 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
           {children}
        </div>
      </main>


      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-border-light h-[72px] z-50 flex justify-around items-center pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {NAV_ITEMS.map((item, index) => {
          if (index > 4) return null; 
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative group"
            >
              {isActive && (
                <span className="absolute top-0 w-10 h-1 bg-brand rounded-b-full shadow-[0_2px_8px_rgba(var(--brand-rgb),0.4)]"></span>
              )}
              
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? '-translate-y-1' : 'group-active:scale-95'}`}>
                <item.icon 
                  className={`w-6 h-6 ${
                    isActive ? 'text-brand fill-brand/10 stroke-[2.5px]' : 'text-gray-400 stroke-[2px]'
                  }`} 
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}