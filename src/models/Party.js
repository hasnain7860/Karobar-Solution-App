import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  // HUM MONGODB KI OBJECTID NAHI, APNI UUID USE KARENGE
  _id: { 
    type: String, 
    required: true 
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Party name is required'],
  },
  type: {
    type: String,
    enum: ['customer', 'supplier', 'both'], // 'both' unke liye jo maal lete bhi hain aur dete bhi hain
    default: 'customer'
  },
  phone: String,
  email: String,
  address: String,
  balance: {
    type: Number,
    default: 0 // +ve means receivable, -ve means payable
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.Party || mongoose.model('Party', PartySchema);