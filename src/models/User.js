import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email.'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false, // Default query mein password nahi aayega
  },
  // CHANGED: business_id -> businessId
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false, // Signup par null, onboarding ke baad set hoga
  },
  role: {
    type: String,
    enum: ['admin', 'salesman', 'manager', 'pending_onboarding'],
    default: 'pending_onboarding',
  },
  // CHANGED: is_active -> isActive
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// --- Middleware Fixes ---

UserSchema.pre('save', async function (next) {
  // FIX: 'password_hash' (snake_case) ko 'passwordHash' (camelCase) kar diya
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  // Agar passwordHash memory mein nahi hai (select: false ki wajah se), to usay fetch karo
  if (!this.passwordHash) {
    const userWithPassword = await mongoose.model('User').findById(this._id).select('+passwordHash');
    if (!userWithPassword) return false;
    return bcrypt.compare(candidatePassword, userWithPassword.passwordHash);
  }
  
  // Agar memory mein hai, to direct compare karo
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);

