const mongoose = require('mongoose');
const dns = require('dns');

// Custom DNS fallback for SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS setServers override if restricted by host
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kamalmani895_db_user:vBS0an2oSCFZDplU@cluster0.pfyxnuk.mongodb.net/?appName=Cluster0';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not throw so server process remains alive on Render
  }
};

module.exports = connectDB;
