import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import itemRoutes from './routes/itemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Item from './models/Item.js';

// Setup environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

// Middlewares
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Set up ES module path variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('💚 Connected to MongoDB successfully.');
    
    // Automatic DB Seeding Engine
    try {
      const count = await Item.countDocuments();
      if (count === 0) {
        console.log('🌱 Database is empty. Seeding initial grocery items...');
        const inventoryPath = path.join(__dirname, 'inventory.json');
        
        if (fs.existsSync(inventoryPath)) {
          const rawData = fs.readFileSync(inventoryPath, 'utf-8');
          const seedData = JSON.parse(rawData);
          
          await Item.insertMany(seedData);
          console.log(`✅ Database successfully seeded with ${seedData.length} grocery items!`);
        } else {
          console.log('⚠️ inventory.json not found in backend directory. Skipping seeding.');
        }
      } else {
        console.log(`📈 Database already contains ${count} items. Seeding skipped.`);
      }
    } catch (err) {
      console.error('❌ Error seeding database:', err.message);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Grocery Inventory System REST API',
    endpoints: {
      items: '/api/items',
      stats: '/api/items/stats',
      lowStock: '/api/items/low-stock'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
