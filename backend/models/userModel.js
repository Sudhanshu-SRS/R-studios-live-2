import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // phone: { type: Number, required: true, unique: true }, // You can re-enable this if needed
    password: { type: String, required: true },
    verifyotp: { type: String, default: '' },
    verifyotpExpireAt: { type: Number, default: 0 }, // Expiration time for OTP
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 }, // Expiration time for reset OTP

    // New fields for OTP request tracking
    otpRequestCount: { type: Number, default: 0 }, // Counter for OTP requests per day
    lastOtpRequestAt: { type: Date, default: Date.now }, // Timestamp for the last OTP request

    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
