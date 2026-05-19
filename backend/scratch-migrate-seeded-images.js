import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Item from './models/Item.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

async function updateImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Read inventory.json
    const inventory = JSON.parse(fs.readFileSync('./inventory.json', 'utf-8'));
    console.log(`Loaded ${inventory.length} items from inventory.json`);

    let updatedCount = 0;

    for (const item of inventory) {
      const result = await Item.updateOne(
        { sku: item.sku },
        { $set: { imageUrl: item.imageUrl } }
      );
      if (result.modifiedCount > 0) {
        updatedCount += result.modifiedCount;
        console.log(`Updated image for ${item.name} (${item.sku}) -> ${item.imageUrl}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} items in the database with their unique matched images!`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Update error:', err);
  }
}

updateImages();
