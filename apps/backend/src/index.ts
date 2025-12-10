import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";

// Declare __dirname for TypeScript (available at runtime in CommonJS)
declare const __dirname: string;

// Load .env file from the backend directory
// When running from dist/index.js, __dirname will be dist/, so we go up one level to find .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);



// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MongoDB URI is not provided");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();