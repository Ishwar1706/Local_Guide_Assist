import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('');
    console.error('👉 ACTION NEEDED: Whitelist your IP in MongoDB Atlas:');
    console.error('   1. Go to https://cloud.mongodb.com');
    console.error('   2. Network Access → Add IP Address → Allow Access from Anywhere');
    console.error('   3. Restart this server after whitelisting.');
    console.error('');
    console.error('⚠️  Server is running but DB is NOT connected. API calls will fail until this is fixed.');
    // Do NOT exit — keep server running so frontend loads
  }
};

export default connectDB;
