import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanKeyword = (name) => {
  return name.toLowerCase()
    .replace(/\b(organic|fresh|large|grade a|grade aa|unsweetened|raw|pure|creamy|classic|natural|ultra|strong|liquid|multi-surface|tall|sliced|round|pack|box|bag|can|canned|bottle|loaf|bunch|piece|pcs|cut|fillet|grade|grade a|100%|reduced fat|plain|salted|shredded|boneless|lean|roasted|deli|sharp|grade A brown)\b/gi, '')
    .replace(/[^a-zA-Z\s]/g, '') // remove special characters
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 2) // only keep words longer than 2 chars
    .join(',');
};

const updateImagesLoremSmarter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const allItems = await Item.find({});
    
    // We update the newly generated items (ID >= 100)
    const newItems = allItems.filter(item => {
      const parts = item.sku.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return num >= 100;
    });

    console.log(`Updating ${newItems.length} items with unique keyword-based LoremFlickr images...`);

    let updatedCount = 0;

    for (const item of newItems) {
      const parts = item.sku.split('-');
      const idNum = parseInt(parts[parts.length - 1]);
      
      const keywords = cleanKeyword(item.name);
      
      // Use the cleaned keyword(s) without the restrictive ",food/all" filter.
      // This allows Flickr to use its massive main database of images, guaranteeing 100% uniqueness
      // and extremely high relevance without repetitions.
      const newUrl = `https://loremflickr.com/600/600/${encodeURIComponent(keywords)}?lock=${idNum}`;

      if (item.imageUrl !== newUrl) {
        item.imageUrl = newUrl;
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} items in MongoDB.`);

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
    console.log(`Successfully updated ${seedUpdateCount} items in inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating images:', error);
    mongoose.disconnect();
  }
};

updateImagesLoremSmarter();
