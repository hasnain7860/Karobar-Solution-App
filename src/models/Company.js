import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  businessId: { type: String, required: true, index: true },
  name: { type: String, required: true }, // e.g., "Nestle", "Unilever"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);

