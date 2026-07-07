import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn("⚠️ MONGODB_URI is not defined in the environment variables!");
    console.warn("⚠️ Database features will not work correctly until you define MONGODB_URI in your secrets settings.");
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds connection timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB connection error: ${(error as Error).message}`);
    console.warn("⚠️ Database features will not work correctly. Please check your IP whitelist on MongoDB Atlas or verify your connection string.");
  }
};
