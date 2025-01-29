import express from 'express';
import { 
    addDiscount, 
    getDiscounts, 
    removeDiscount 
} from '../controllers/discountController.js';
import adminAuth from '../middleware/adminAuth.js';
import { checkExpiredDiscounts } from '../middleware/discountMiddleware.js';

const discountRouter = express.Router();

discountRouter.use(checkExpiredDiscounts);
discountRouter.post('/add', adminAuth, addDiscount);
discountRouter.get('/', getDiscounts);
discountRouter.delete('/:productId', adminAuth, removeDiscount);

export default discountRouter;