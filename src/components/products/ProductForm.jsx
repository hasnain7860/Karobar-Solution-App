"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, UploadCloud, Trash2, Plus, Save, Calendar, AlertTriangle } from 'lucide-react';

// ... (ImageUploader component code SAME as before) ...
const ImageUploader = ({ value, onChange }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      alert("Image too large! Max 100KB allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden group hover:border-brand transition-colors cursor-pointer">
      <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
      {value ? (
        <>
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold">Change</span>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span className="text-xs text-gray-500">Upload</span>
        </div>
      )}
    </div>
  );
};

export default function ProductForm({ 
  initialData, units, companies, 
  onSave, onCancel 
}) {
  // 1. Define Default Values separately
  const defaultValues = {
    name: '', nameUrdu: '', image: '',
    baseUnitId: '', secondaryUnitId: '', conversionRate: 1,
    companyId: '',
    batches: [{ batchCode: '', quantity: 0, damage: 0, expiryDate: '', purchasePrice: 0, salePrice: 0, wholesalePrice: 0 }]
  };

  const { register, control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: defaultValues
  });

  const { fields, append, remove } = useFieldArray({ control, name: "batches" });

  // 2. FIX: Reset Logic Updated
  useEffect(() => {
    if (initialData) {
      const formattedBatches = initialData.batches?.map(b => ({
        ...b,
        expiryDate: b.expiryDate ? new Date(b.expiryDate).toISOString().split('T')[0] : ''
      }));
      reset({ ...initialData, batches: formattedBatches });
    } else {
      // AGAR NEW PRODUCT HAI TO FORM RESET KARO
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    // 1. Calculate Opening Stock form the form batches
    const openingStockCalculated = data.batches.reduce((acc, b) => acc + Number(b.quantity), 0);
    const damageCalculated = data.batches.reduce((acc, b) => acc + Number(b.damage || 0), 0);

    // 2. Derive Total Quantity
    // Formula: Opening + (Existing Purchased) - (Existing Sold) - Damage
    // Kyunki abhi purchase/sale module nahi hai, hum unhe 0 ya existing value maanenge
    
    const existingPurchased = initialData?.purchasedStock || 0;
    const existingSold = initialData?.soldStock || 0;
    
    const totalQty = openingStockCalculated + existingPurchased - existingSold - damageCalculated;

    const payload = { 
      ...data, 
      openingStock: openingStockCalculated,
      damagedStock: damageCalculated,
      totalQuantity: totalQty,
      // Ensure we don't lose existing accounting data if editing
      purchasedStock: existingPurchased,
      soldStock: existingSold
    };

    onSave(payload);
  };

  return (
    <div className="flex flex-col h-full bg-white md:rounded-2xl shadow-sm relative">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-4 flex items-center gap-3 shadow-sm rounded-t-2xl">
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Edit Product' : 'New Product'}
        </h2>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 md:pb-4 custom-scrollbar">
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-xl space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                 <ImageUploader value={watch('image')} onChange={(v) => setValue('image', v)} />
              </div>
              <div className="w-2/3 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Name (Eng)</label>
                  <input {...register('name', { required: true })} className="w-full border-b border-gray-300 py-2 focus:border-brand outline-none bg-transparent font-medium" placeholder="Product Name" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Name (Urdu)</label>
                  <input {...register('nameUrdu')} className="w-full border-b border-gray-300 py-2 focus:border-brand outline-none bg-transparent font-urdu text-right" placeholder="اردو نام" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Company</label>
                 <select {...register('companyId')} className="w-full border p-3 rounded-lg bg-gray-50 mt-1 text-sm">
                   <option value="">Select...</option>
                   {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Barcode</label>
                 <input {...register('barcode')} className="w-full border p-3 rounded-lg bg-gray-50 mt-1 text-sm" placeholder="Scan..." />
              </div>
            </div>
          </div>

          {/* Section 2: Units */}
          <div className="p-4 border rounded-xl bg-gray-50/50">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              Unit Configuration
            </h3>
            <div className="grid grid-cols-3 gap-3">
               <div className="col-span-1">
                 <label className="text-[10px] font-bold text-gray-400">Base Unit</label>
                 <select {...register('baseUnitId', { required: true })} className="w-full border p-2 rounded-lg bg-white text-sm mt-1">
                   <option value="">Select</option>
                   {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                 </select>
               </div>
               <div className="col-span-1">
                 <label className="text-[10px] font-bold text-gray-400">Pack Unit</label>
                 <select {...register('secondaryUnitId')} className="w-full border p-2 rounded-lg bg-white text-sm mt-1">
                   <option value="">None</option>
                   {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                 </select>
               </div>
               <div className="col-span-1">
                 <label className="text-[10px] font-bold text-gray-400">Qty in Pack</label>
                 <input type="number" {...register('conversionRate')} className="w-full border p-2 rounded-lg bg-white text-sm mt-1" placeholder="1" />
               </div>
            </div>
          </div>

          {/* Section 3: Batches */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-700 text-sm">Stock Batches</h3>
               <button type="button" onClick={() => append({ batchCode: '', quantity: 0, damage: 0, purchasePrice: 0, salePrice: 0 })} className="text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                 <Plus className="w-3 h-3"/> Add Batch
               </button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative animate-in fade-in">
                 <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3"/></button>
                 
                 {/* Batch Fields */}
                 <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 block mb-1">Batch Code</label>
                       <input {...register(`batches.${index}.batchCode`)} className="w-full border p-2 rounded-lg text-sm" placeholder="Auto" />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3"/> Expiry</label>
                       <input type="date" {...register(`batches.${index}.expiryDate`)} className="w-full border p-2 rounded-lg text-sm bg-gray-50" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 block mb-1">Quantity</label>
                       <input type="number" {...register(`batches.${index}.quantity`)} className="w-full border p-2 rounded-lg text-sm bg-blue-50 font-bold text-blue-700" />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-red-400 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3"/> Damage</label>
                       <input type="number" {...register(`batches.${index}.damage`)} className="w-full border border-red-100 p-2 rounded-lg text-sm bg-red-50 text-red-600" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-gray-200">
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 block mb-1">Purchase</label>
                       <input type="number" {...register(`batches.${index}.purchasePrice`)} className="w-full border p-2 rounded-lg text-sm" />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 block mb-1">Wholesale</label>
                       <input type="number" {...register(`batches.${index}.wholesalePrice`)} className="w-full border p-2 rounded-lg text-sm" />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-brand block mb-1">Sale Price</label>
                       <input type="number" {...register(`batches.${index}.salePrice`)} className="w-full border border-brand/30 p-2 rounded-lg text-sm bg-brand/5 font-bold" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="fixed bottom-[74px] left-0 w-full bg-white border-t p-4 z-[60] md:sticky md:bottom-0 md:left-auto md:w-auto md:rounded-b-2xl md:border-t-2 md:shadow-[0_-4px_10px_rgba(0,0,0,0.05)] shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <button 
          form="product-form" 
          type="submit" 
          className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-brand/90 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {initialData ? 'Update Product' : 'Save Product'}
        </button>
      </div>

    </div>
  );
}


