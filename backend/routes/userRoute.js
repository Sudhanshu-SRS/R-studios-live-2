import express from 'express';
import { loginUser,registerUser,adminLogin, logout, sendverifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword, } from '../controllers/userController.js';

import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/logout',logout)
userRouter.post('/send-verify-otp', authUser , sendverifyOtp)
userRouter.post('/verify-Email', authUser , verifyEmail)
userRouter.post('/is-auth', authUser , isAuthenticated)
userRouter.post('/send-rest-otp',sendResetOtp)
userRouter.post('/reset-password',resetPassword)

userRouter.post('/admin',adminLogin)


export default userRouter;