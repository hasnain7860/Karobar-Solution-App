"use client";

import React from 'react';
import { PartiesProvider } from '../context/PartiesContext';
import { InventoryProvider } from '../context/InventoryContext.jsx';
// Future: import { ProductsProvider } from '../context/ProductsContext';

export default function AppProviders({ children }) {
  return (
    <PartiesProvider>
    <InventoryProvider>
    

        {children}
        </InventoryProvider>
      
    </PartiesProvider>
  );
}

