"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllPartiesLocal, addPartyLocal, updatePartyLocal ,deletePartyLocal } from '../lib/idb-service';
import { startSyncLoop } from '../lib/sync-worker';

const PartiesContext = createContext();

export function PartiesProvider({ children }) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load Parties from IDB
  const loadParties = useCallback(async () => {
    try {
      const localData = await getAllPartiesLocal();
      // Sort by created date (newest first) or name
      const sorted = localData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setParties(sorted);
    } catch (error) {
      console.error("Failed to load parties", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load & Sync Start
  useEffect(() => {
    loadParties();
    startSyncLoop(); // Background sync shuru
  }, [loadParties]);

  // 2. Add Party Wrapper
  const addParty = async (partyData) => {
    const newId = crypto.randomUUID();
    const newParty = {
      _id: newId,
      ...partyData,
      balance: partyData.balance || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistic Update (UI pehle update karo)
    setParties(prev => [newParty, ...prev]);
    
    // Background DB Save
    await addPartyLocal(newParty);
  };

  // 3. Update Party Wrapper
  const updateParty = async (id, updatedFields) => {
    // Find existing party to merge data
    const existingParty = parties.find(p => p._id === id);
    if (!existingParty) return;

    const updatedParty = {
      ...existingParty,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    // Optimistic Update
    setParties(prev => prev.map(p => p._id === id ? updatedParty : p));

    // Background DB Update
    await updatePartyLocal(updatedParty);
  };

  // 4. Refresh (Sync ke baad call karne ke liye)
  const refreshParties = async () => {
     await loadParties();
  };

const deleteParty = async (id) => {
    // Optimistic Update (UI se foran hatao)
    setParties(prev => prev.filter(p => p._id !== id));

    // Background DB & Sync Queue
    await deletePartyLocal(id);
  };



  return (
    <PartiesContext.Provider value={{ parties, loading, addParty, updateParty, refreshParties ,deleteParty }}>
      {children}
    </PartiesContext.Provider>
  );
}

// Custom Hook for easy access
export function useParties() {
  return useContext(PartiesContext);
}

