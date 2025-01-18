import express from 'express';
import authUser from '../middleware/auth.js';
import { getUserData } from '../controllers/authcontroller.js';

const authRouter = express.Router();
authRouter.get('/data', authUser,getUserData) ;

export default authRouter;