"use client";

import React from 'react';
import AppLayout from '../../components/layout/AppLayout';
import AppProviders from '../../providers/AppProviders';

export default function AppRootLayout({ children }) {
  return (
    <AppProviders> 
      <AppLayout>
        {children}
      </AppLayout>
    </AppProviders>
  );
}

