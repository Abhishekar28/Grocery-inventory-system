import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const updateImagesLorem = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const allItems = await Item.find({});
    
    // We only want to update the newly generated 246 items (ID >= 100)
    const newItems = allItems.filter(item => {
      const parts = item.sku.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return num >= 100;
    });

    let updatedCount = 0;

    for (const item of newItems) {
      const parts = item.sku.split('-');
      const idNum = parseInt(parts[parts.length - 1]);
      
      // Extract the most relevant keyword (usually the last word, e.g., "Apples" from "Gala Apples")
      const words = item.name.split(' ');
      let keyword = words[words.length - 1].toLowerCase();
      if (keyword.endsWith('s')) keyword = keyword.slice(0, -1); // remove plural
      
      // Use LoremFlickr which resolves keywords directly to Flickr images.
      // We use the `lock` parameter to ensure the image doesn't change on every refresh.
      const aiImageUrl = `https://loremflickr.com/600/600/${encodeURIComponent(keyword)},food/all?lock=${idNum}`;

      if (item.imageUrl !== aiImageUrl) {
        item.imageUrl = aiImageUrl;
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} items with LoremFlickr images in MongoDB.`);

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
    console.log(`Successfully updated ${seedUpdateCount} items with LoremFlickr images in inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating images:', error);
    mongoose.disconnect();
  }
};

updateImagesLorem();
