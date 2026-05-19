import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');
    
    // Find all items where imageUrl is empty or null or missing
    const result = await Item.updateMany(
      {
        $or: [
          { imageUrl: "" },
          { imageUrl: null },
          { imageUrl: { $exists: false } }
        ]
      },
      {
        $set: {
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
        }
      }
    );
    
    console.log(`Migration complete. Matched & updated ${result.modifiedCount} items!`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

migrate();
