"use client";

import React, { useState } from 'react';
import { Search, Edit2, Trash2, ImageIcon, Plus, Building2, Ruler } from 'lucide-react';

export default function ProductList({ 
  products, units, companies, 
  onEdit, onDelete, 
  onNavigate, onAdd // onAdd prop receive kiya
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nameUrdu?.includes(searchTerm) ||
    p.barcode?.includes(searchTerm)
  );

  return (
    <div className="space-y-4 pb-24">
      
      {/* --- HEADER --- */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-2 pb-4 space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Inventory</h1>
            <p className="text-xs text-text-medium">Total Items: {products.length}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('companies')} className="p-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50" title="Manage Companies">
              <Building2 className="w-5 h-5" />
            </button>
            <button onClick={() => onNavigate('units')} className="p-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50" title="Manage Units">
              <Ruler className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search product, barcode..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl focus:ring-2 focus:ring-brand/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* --- GRID --- */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-200 p-4 rounded-full mb-3">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No products found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const baseUnit = units.find(u => u._id === p.baseUnitId)?.name || '?';
            const company = companies.find(c => c._id === p.companyId)?.name;

            return (
              <div key={p._id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 relative group overflow-hidden">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-200 overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 font-urdu truncate">{p.nameUrdu}</p>
                      {company && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 truncate max-w-[80px]">{company}</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="bg-blue-50 text-brand px-2 py-1 rounded-lg text-xs font-bold">
                      Stock: {p.totalQuantity} {baseUnit}
                    </div>
                  </div>
                </div>
                <div className="absolute right-2 bottom-2 flex gap-2">
                  <button 
                    onClick={() => onEdit(p)} 
                    className="p-2 bg-gray-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(p._id)} 
                    className="p-2 bg-gray-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- FLOATING ADD BUTTON --- */}
      {/* Ab yeh 'onAdd' function call karega jo parent mein state clear karta hai */}
      <button 
        onClick={onAdd} 
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-brand text-white p-4 rounded-full shadow-xl hover:bg-brand/90 transition-transform hover:scale-105 active:scale-95 z-30 flex items-center gap-2"
      >
        <Plus className="w-6 h-6" />
        <span className="hidden md:inline font-bold">Add Product</span>
      </button>
    </div>
  );
}


