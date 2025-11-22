"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Phone, MapPin, Loader2, Edit2, X, Trash2 } from 'lucide-react'; // Trash2 Import kiya
import { useParties } from '../../../context/PartiesContext'; 

export default function PartiesPage() {
  // deleteParty destructure kiya
  const { parties, loading, addParty, updateParty, deleteParty } = useParties();
  
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  // Deleting state (optional visual feedback ke liye)
  const [isDeleting, setIsDeleting] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // ... (openModal logic same rahegi)
  const openModal = (party = null) => {
      if (party) {
        setEditingParty(party);
        setValue('name', party.name);
        setValue('type', party.type);
        setValue('phone', party.phone);
        setValue('address', party.address);
      } else {
        setEditingParty(null);
        reset();
      }
      setShowModal(true);
  };

  // ... (onSubmit logic same rahegi)
  const onSubmit = async (data) => {
    if (editingParty) {
      await updateParty(editingParty._id, data);
    } else {
      await addParty(data);
    }
    setShowModal(false);
    reset();
    setEditingParty(null);
  };

  // --- [NEW] DELETE HANDLER ---
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Taake card click event trigger na ho (agar future mein lagaya to)
    
    if (window.confirm('Are you sure you want to delete this party? This cannot be undone.')) {
      setIsDeleting(id); // Loader dikhane ke liye
      await deleteParty(id);
      setIsDeleting(null);
    }
  };

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* ... (Header aur Search bar same rahenge) ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-text-dark">Parties</h1>
           <p className="text-text-medium text-sm">Manage customers & suppliers</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Party
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by name or phone..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
           />
        </div>
      </div>

      {/* List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-400">No parties found</p>
          </div>
        ) : (
          filteredParties.map((party) => (
            <div key={party._id} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              
              {/* Type Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider
                ${party.type === 'supplier' ? 'bg-orange-100 text-orange-700' : 
                  party.type === 'customer' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}
              `}>
                {party.type}
              </div>

              {/* ACTION BUTTONS (EDIT & DELETE) */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                
                {/* DELETE BUTTON */}
                <button 
                  onClick={(e) => handleDelete(party._id, e)}
                  className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                  title="Delete Party"
                  disabled={isDeleting === party._id}
                >
                  {isDeleting === party._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* EDIT BUTTON */}
                <button 
                  onClick={() => openModal(party)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-brand hover:text-white transition-colors"
                  title="Edit Party"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-4 mt-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0
                   ${party.type === 'supplier' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-brand'}
                `}>
                  {party.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-text-dark text-lg leading-tight">{party.name}</h3>
                  <p className="text-text-medium text-sm flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> {party.phone || 'No Phone'}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mt-2 pr-20"> {/* pr-20 to avoid overlap with buttons */}
                 <div className="text-sm text-text-medium flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> {party.address || 'No Address'}
                 </div>
                 <div className={`text-sm font-bold ${party.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {party.balance >= 0 ? 'Receivable: ' : 'Payable: '} 
                    Rs {Math.abs(party.balance).toLocaleString()}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ... (ADD/EDIT MODAL code same rahega) ... */}
       {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h2 className="font-bold text-lg text-text-dark">
                 {editingParty ? 'Edit Party' : 'Add New Party'}
               </h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Party Name</label>
                <input 
                  {...register('name', { required: true })}
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-brand/20 outline-none"
                  placeholder="e.g. Ali General Store"
                />
                {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Type</label>
                    <select {...register('type')} className="w-full px-4 py-3 border border-border-light rounded-xl outline-none bg-white">
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="both">Both</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                    <input 
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-brand/20 outline-none"
                      placeholder="0300..."
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Address</label>
                <textarea 
                  {...register('address')}
                  rows="2"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-brand/20 outline-none resize-none"
                  placeholder="Shop #, Market Area..."
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                 <button 
                   type="button" 
                   onClick={() => setShowModal(false)}
                   className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand/90 shadow-lg shadow-brand/20"
                 >
                   {editingParty ? 'Update Party' : 'Save Party'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


