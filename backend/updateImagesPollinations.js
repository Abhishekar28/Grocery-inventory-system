import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const updateImagesPollinations = async () => {
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

    console.log(`Found ${newItems.length} new items to update with AI images.`);

    let updatedCount = 0;

    for (const item of newItems) {
      const parts = item.sku.split('-');
      const idNum = parseInt(parts[parts.length - 1]);
      
      // Use Pollinations.ai for on-the-fly, 100% unique, perfectly matched AI image generation
      // We append a seed to ensure the image remains constant on reloads, and use precise prompting.
      const prompt = `A highly detailed, professional grocery store product photography close up shot of ${item.name}`;
      const encodedPrompt = encodeURIComponent(prompt);
      const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true&seed=${idNum}`;

      if (item.imageUrl !== aiImageUrl) {
        item.imageUrl = aiImageUrl;
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} items with unique AI images in MongoDB.`);

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
    console.log(`Successfully updated ${seedUpdateCount} items with unique AI images in inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating images:', error);
    mongoose.disconnect();
  }
};

updateImagesPollinations();
