const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../backend/config/db');

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure DB connected for every API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in middleware:', err);
    res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }
});

// Root API Health Route
app.get('/api', (req, res) => {
  res.send('BrandForge AI Backend API is running on Vercel...');
});

// Mount Routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/ai', require('../backend/routes/ai'));
app.use('/api/history', require('../backend/routes/history'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
