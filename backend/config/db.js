const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kamalmani895_db_user:vBS0an2oSCFZDplU@cluster0.pfyxnuk.mongodb.net/?appName=Cluster0';
  try {
    const conn = await mongoose.connect(mongoURI);
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
