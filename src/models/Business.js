import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  // CHANGED: owner_id -> ownerId
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // CHANGED: business_name -> businessName
  businessName: {
    type: String,
    required: [true, 'Business name is required.'],
  },
  // CHANGED: business_type -> businessType
  businessType: {
    type: String,
    enum: ['distributor', 'wholesaler', 'retailer'],
    required: true,
  },
  // CHANGED: logo_url -> logoUrl
  logoUrl: String,
  
  contact: {
    phones: [String],
    email: String,
  },
  
  // CHANGED: bill_extra_line -> billExtraLine
  billExtraLine: String,
  
  settings: {
    // CHANGED: print_mode -> printMode
    printMode: { type: String, default: 'pdf' },
    // CHANGED: paper_size -> paperSize
    paperSize: { type: String, default: 'a4' },
  },
  
  modules: [String], // e.g., ["pos", "preordering"]
  
  subscription: {
    // CHANGED: plan_name -> planName
    planName: { type: String, default: 'free_trial' },
    // CHANGED: start_date -> startDate
    startDate: { type: Date, default: Date.now },
    // CHANGED: end_date -> endDate
    endDate: { type: Date },
    status: { type: String, default: 'trial' },
  },
}, { timestamps: true });

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);

