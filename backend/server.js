import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import cookieParser from 'cookie-parser';
import imageRouter from './routes/imageRoute.js'; // Import image routes
import authRouter from './routes/authRoute.js'
// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',           // Frontend development
    'http://localhost:5174',           // Admin development
    'https://rashistudio.com',         // Production frontend
    'https://admin.rashistudio.com',   // Production admin
    'https://www.rashistudio.com'      // Production frontend with www
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Pre-flight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/auth',authRouter)
app.use('/api', imageRouter); // Use image routes

app.get('/',(req,res)=>{
    res.send("API Working")
})
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, ()=> console.log('Server started on PORT : '+ port))