import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  logout,
  sendverifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile, // Add this line
} from '../controllers/userController.js';

import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logout);
userRouter.post('/send-verify-otp', authUser, sendverifyOtp);
userRouter.post('/verify-Email', authUser, verifyEmail);
userRouter.get('/is-auth', authUser, isAuthenticated);
userRouter.post('/send-reset-otp', sendResetOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.get('/profile', authUser, getUserProfile);
userRouter.put('/profile/update', authUser, updateUserProfile); // Add this line

userRouter.post('/admin', adminLogin);

export default userRouter;