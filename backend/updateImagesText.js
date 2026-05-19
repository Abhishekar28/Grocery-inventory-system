import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const categoryColors = {
  "Fruits & Vegetables": "10B981", // Emerald Green
  "Dairy & Eggs": "F59E0B",        // Amber
  "Bakery & Bread": "D97706",      // Orange
  "Beverages": "3B82F6",           // Blue
  "Pantry & Grains": "8B5CF6",     // Purple
  "Snacks & Sweets": "EC4899",     // Pink
  "Meat & Seafood": "EF4444",      // Red
  "Household & Cleaning": "06B6D4" // Cyan
};

const updateImagesText = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const allItems = await Item.find({});
    
    // We update the newly generated items
    const newItems = allItems.filter(item => {
      const parts = item.sku.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return num >= 100;
    });

    let updatedCount = 0;

    for (const item of newItems) {
      const bgColor = categoryColors[item.category] || "5E13C2";
      
      // Split the name to make it look nice on a square tile.
      // E.g., "Red Onions" -> "Red+Onions"
      const encodedName = encodeURIComponent(item.name);
      
      const newUrl = `https://placehold.co/600x600/${bgColor}/FFFFFF/png?text=${encodedName}`;

      if (item.imageUrl !== newUrl) {
        item.imageUrl = newUrl;
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} items with unique Text Tiles in MongoDB.`);

    // Update inventory.json
    const filePath = path.resolve('inventory.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const seedItems = JSON.parse(rawData);
    
    let seedUpdateCount = 0;
    for (const seedItem of seedItems) {
      const parts = seedItem.sku.split('-');
      const idNum = parseInt(parts[parts.length - 1]);
      if (idNum >= 100) {
        const dbItem = newItems.find(i => i.sku === seedItem.sku);
        if (dbItem && seedItem.imageUrl !== dbItem.imageUrl) {
          seedItem.imageUrl = dbItem.imageUrl;
          seedUpdateCount++;
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(seedItems, null, 2));
    console.log(`Successfully updated ${seedUpdateCount} items with unique Text Tiles in inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating images:', error);
    mongoose.disconnect();
  }
};

updateImagesText();
