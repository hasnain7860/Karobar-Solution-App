"use client";

import React, { useState } from 'react';
import { useInventory } from '../../../context/InventoryContext';
import ProductList from '../../../components/products/ProductList';
import ProductForm from '../../../components/products/ProductForm';
import { ArrowLeft, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

// ... (MetadataManager code same as before) ...
const MetadataManager = ({ title, items, onAdd, onUpdate, onDelete, onBack }) => {
  // ... same code ...
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      onUpdate(editingId, name);
      setEditingId(null);
    } else {
      onAdd(name);
    }
    setName('');
  };

  const handleEdit = (item) => {
    setName(item.name);
    setEditingId(item._id);
  };

  return (
    <div className="bg-white min-h-[100dvh] md:min-h-0 flex flex-col md:rounded-2xl md:h-[600px] md:shadow-lg md:border relative z-40">
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-text-dark"/>
          </button>
          <h1 className="text-lg font-bold text-text-dark">Manage {title}</h1>
        </div>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500">Total: {items.length}</span>
      </div>
      <div className="p-4 bg-gray-50 border-b">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center w-full">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="flex-1 min-w-0 border border-gray-300 p-3 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand outline-none shadow-sm text-sm"
            placeholder={`Enter ${title} Name`}
            autoFocus
          />
          <button type="submit" className="shrink-0 w-12 h-12 flex items-center justify-center bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 active:scale-95 transition-all">
            {editingId ? <Check className="w-6 h-6"/> : <Plus className="w-6 h-6"/>}
          </button>
        </form>
        {editingId && <button onClick={() => { setEditingId(null); setName(''); }} className="text-xs text-red-500 mt-2 underline">Cancel Edit</button>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {items.map(item => (
          <div key={item._id} className="flex justify-between items-center p-3.5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
             <span className="font-medium text-gray-700 truncate pr-2">{item.name}</span>
             <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => { if(window.confirm('Delete?')) onDelete(item._id) }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---
export default function ProductsPage() {
  const inventory = useInventory();
  const [view, setView] = useState('list'); 
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. Edit Handler (Sets State)
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setView('form');
  };

  // 2. FIX: Create New Handler (Clears State)
  const handleCreateNew = () => {
    setEditingProduct(null); // Clear previous edit state
    setView('form');
  };

  const handleSaveProduct = async (data) => {
    if (editingProduct) {
      await inventory.updateProduct(editingProduct._id, data);
    } else {
      await inventory.addProduct(data);
    }
    setView('list');
    setEditingProduct(null); // Clear after save
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingProduct(null); // FIX: Clear state on cancel too
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await inventory.deleteProduct(id);
    }
  };

  switch (view) {
    case 'form':
      return (
        <ProductForm 
          initialData={editingProduct}
          units={inventory.units}
          companies={inventory.companies}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm} // Updated Handler
        />
      );
    
    case 'companies':
      return <div className="md:max-w-2xl md:mx-auto"><MetadataManager title="Companies" items={inventory.companies} onAdd={inventory.addCompany} onUpdate={inventory.updateCompany} onDelete={inventory.deleteCompany} onBack={() => setView('list')} /></div>;

    case 'units':
      return <div className="md:max-w-2xl md:mx-auto"><MetadataManager title="Units" items={inventory.units} onAdd={inventory.addUnit} onUpdate={inventory.updateUnit} onDelete={inventory.deleteUnit} onBack={() => setView('list')} /></div>;

    default: 
      return (
        <ProductList 
          products={inventory.products}
          units={inventory.units}
          companies={inventory.companies}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onNavigate={setView}
          onAdd={handleCreateNew} // Passed New Handler
        />
      );
  }
}


