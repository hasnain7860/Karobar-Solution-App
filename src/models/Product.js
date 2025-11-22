import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batchCode: String,
  quantity: { type: Number, default: 0 }, // Yeh batch ki current qty hai
  initialQuantity: { type: Number, default: 0 }, // Record ke liye: Shuru mein kitni thi
  expiryDate: Date,
  purchasePrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  wholesalePrice: { type: Number, default: 0 },
  damage: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  businessId: { type: String, required: true, index: true },
  
  name: { type: String, required: true },
  nameUrdu: String,
  image: String, // Base64 (Small) or URL
  
  companyId: { type: String, ref: 'Company' },
  baseUnitId: { type: String, ref: 'Unit', required: true },
  secondaryUnitId: { type: String, ref: 'Unit' },
  conversionRate: { type: Number, default: 1 },
  
  barcode: { type: String, index: true },
  
  // --- INVENTORY SEGREGATION (The Logic Fix) ---
  openingStock: { type: Number, default: 0 },   // Form se jo add hoga
  purchasedStock: { type: Number, default: 0 }, // Future Purchase Module se
  soldStock: { type: Number, default: 0 },      // POS se
  damagedStock: { type: Number, default: 0 },   // Manual Damage entry se
  
  // Yeh abhi bhi maintain karenge for fast queries, lekin formula se derive hoga
  totalQuantity: { type: Number, default: 0 }, 
  
  batches: [BatchSchema],
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);


