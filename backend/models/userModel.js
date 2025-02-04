import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyotp: { type: String, default: '' },
    verifyotpExpireAt: { type: Number, default: 0 }, // Expiration time for OTP
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 }, // Expiration time for reset OTP
    phone: {
      type: String,
      required: false, // Optional
      trim: true
  },

    // New fields for OTP request tracking
    otpRequestCount: { type: Number, default: 0 }, // Counter for OTP requests per day
    lastOtpRequestAt: { type: Date, default: Date.now }, // Timestamp for the last OTP request

    // Add address fields
    address: {
        firstName: { type: String },
        lastName: { type: String },
        street: { type: String },
        addressLine2: { type: String }, // Add this
        landmark: { type: String },     
        city: { type: String },
        state: { type: String },
        zipcode: { type: String },
        country: { type: String },
        phone: { type: String }
    },

    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
