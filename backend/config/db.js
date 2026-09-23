const mongoose = require('mongoose');

// Disable Mongoose buffering so queries return immediately instead of timing out after 10000ms when DB is disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const WORKING_URI = 'mongodb+srv://ruthralekhaantigraviity_db_user:2dDlAOhZiI4svJ13@cluster0.odbdf1p.mongodb.net/brandforge?retryWrites=true&w=majority';

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return true;
  }

  const envURI = process.env.MONGO_URI;
  const primaryURI = (envURI && !envURI.includes('pfyxnuk') && !envURI.includes('<db_password>')) 
    ? envURI 
    : WORKING_URI;

  try {
    const conn = await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Primary Connection Error (${primaryURI}): ${error.message}`);
    
    // If primary failed and envURI was different from WORKING_URI, attempt fallback to working cluster
    if (primaryURI !== WORKING_URI) {
      try {
        console.log('Attempting connection to verified Working URI fallback...');
        const conn = await mongoose.connect(WORKING_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = conn.connections[0].readyState === 1;
        console.log(`MongoDB Connected via Fallback: ${conn.connection.host}`);
        return true;
      } catch (fallbackErr) {
        console.error(`MongoDB Fallback Connection Error: ${fallbackErr.message}`);
      }
    }

    isConnected = false;
    return false;
  }
};

module.exports = connectDB;
