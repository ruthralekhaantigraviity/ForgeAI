const mongoose = require('mongoose');
const dns = require('dns');

// Fix SRV DNS resolution on Vercel/AWS Serverless runtime
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('DNS setServers fallback skipped');
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kamalmani895_db_user:vBS0an2oSCFZDplU@cluster0.pfyxnuk.mongodb.net/?appName=Cluster0';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
