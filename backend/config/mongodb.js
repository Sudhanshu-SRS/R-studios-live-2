import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Ensure the .env variables are loaded

const connectDB = async () => {
    try {
        // Connection logic
        await mongoose.connect(process.env.MONGODB_URI, {
           
        });

        // Connection successful
        console.log("DB Connected");

    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1); // Exit process with failure
    }

    // Optionally, you can listen for other events
    mongoose.connection.on('connected', () => {
        console.log("MongoDB connected.");
    });

    mongoose.connection.on('error', (err) => {
        console.error("MongoDB connection error:", err);
    });
}

export default connectDB;

