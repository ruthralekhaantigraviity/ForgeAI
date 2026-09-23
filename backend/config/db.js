const mongoose = require('mongoose');

// Disable Mongoose buffering so queries return immediately instead of timing out after 10000ms when DB is disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return true;
  }
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://ruthralekhaantigraviity_db_user:2dDlAOhZiI4svJ13@cluster0.odbdf1p.mongodb.net/brandforge?retryWrites=true&w=majority';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    return false;
  }
};

module.exports = connectDB;
