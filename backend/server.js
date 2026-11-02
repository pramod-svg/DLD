const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api', apiRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Digital Voting Machine Simulator Backend (DLD) is running.',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] DLD Voting Machine Server running on port ${PORT}`);
});
