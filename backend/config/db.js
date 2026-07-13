import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("===== MongoDB Connection Error =====");
    console.error(error);
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Cause:", error.cause);
    process.exit(1);
  }
};

export default connectDB;