"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllItemsLocal, addItemLocal ,deleteItemLocal,updateItemLocal} from '../lib/idb-service';
import { startSyncLoop } from '../lib/sync-worker';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load All Data
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [p, u, c] = await Promise.all([
        getAllItemsLocal('products'),
        getAllItemsLocal('units'),
        getAllItemsLocal('companies')
      ]);
      setProducts(p.reverse());
      setUnits(u);
      setCompanies(c);
    } catch (err) {
      console.error("Inventory Load Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    startSyncLoop();
  }, [loadInventory]);

  // --- ACTIONS ---

  const addProduct = async (data) => {
    const newItem = { _id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    setProducts(prev => [newItem, ...prev]);
    await addItemLocal('products', newItem, '/api/products');
  };

  const updateProduct = async (id, data) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, ...data } : p));
    await updateItemLocal('products', { ...data, _id: id }, '/api/products');
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p._id !== id));
    await deleteItemLocal('products', id, '/api/products');
  };

  // 2. COMPANIES
  const addCompany = async (name) => {
    const newItem = { _id: crypto.randomUUID(), name, isActive: true };
    setCompanies(prev => [...prev, newItem]);
    await addItemLocal('companies', newItem, '/api/companies');
  };

  const updateCompany = async (id, name) => {
    const updated = { _id: id, name, isActive: true }; // Preserve ID
    setCompanies(prev => prev.map(c => c._id === id ? updated : c));
    await updateItemLocal('companies', updated, '/api/companies');
  };

  const deleteCompany = async (id) => {
    setCompanies(prev => prev.filter(c => c._id !== id));
    await deleteItemLocal('companies', id, '/api/companies');
  };

  // 3. UNITS (Add logic same as above if needed)
  const addUnit = async (name) => {
    const newItem = { _id: crypto.randomUUID(), name, isActive: true };
    setUnits(prev => [...prev, newItem]);
    await addItemLocal('units', newItem, '/api/units');
  };
const updateUnit = async (id, name) => {
    const updated = { _id: id, name, isActive: true };
    setUnits(prev => prev.map(u => u._id === id ? updated : u));
    await updateItemLocal('units', updated, '/api/units');
  };

  const deleteUnit = async (id) => {
    setUnits(prev => prev.filter(u => u._id !== id));
    await deleteItemLocal('units', id, '/api/units');
  };
  return (
    <InventoryContext.Provider value={{
      products, units, companies, loading,
      addProduct, updateProduct, deleteProduct,
      addCompany, updateCompany, deleteCompany,
      addUnit, updateUnit, deleteUnit,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}






