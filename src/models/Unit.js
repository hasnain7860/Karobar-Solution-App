import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  businessId: { type: String, required: true, index: true },
  name: { type: String, required: true }, // e.g., "Kg", "Piece", "Carton"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Unit || mongoose.model('Unit', UnitSchema);

