import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const allItems = await Item.find({});
    
    // Separate original items and new items using SKU
    const originalItems = allItems.filter(item => {
      const parts = item.sku.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return num <= 50;
    });

    const newItems = allItems.filter(item => {
      const parts = item.sku.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return num >= 100;
    });

    console.log(`Found ${originalItems.length} original items and ${newItems.length} new items`);

    // Create a pool of images per category from original items
    const categoryImagePool = {};
    const keywordImageMap = [];

    for (const orig of originalItems) {
      if (!categoryImagePool[orig.category]) {
        categoryImagePool[orig.category] = [];
      }
      categoryImagePool[orig.category].push(orig.imageUrl);

      const words = orig.name.split(' ');
      const mainNoun = words[words.length - 1].toLowerCase();
      const singular = mainNoun.endsWith('s') ? mainNoun.slice(0, -1) : mainNoun;
      
      keywordImageMap.push({ keyword: singular, url: orig.imageUrl });
      keywordImageMap.push({ keyword: orig.name.toLowerCase(), url: orig.imageUrl });
    }

    const manualKeywords = [
      { k: 'apple', u: originalItems.find(i => i.name.includes('Apple'))?.imageUrl },
      { k: 'banana', u: originalItems.find(i => i.name.includes('Banana'))?.imageUrl },
      { k: 'milk', u: originalItems.find(i => i.name.includes('Milk'))?.imageUrl },
      { k: 'cheese', u: originalItems.find(i => i.name.includes('Cheddar'))?.imageUrl },
      { k: 'bread', u: originalItems.find(i => i.name.includes('Bread'))?.imageUrl },
      { k: 'chicken', u: originalItems.find(i => i.name.includes('Chicken'))?.imageUrl },
      { k: 'beef', u: originalItems.find(i => i.name.includes('Beef'))?.imageUrl },
      { k: 'water', u: originalItems.find(i => i.name.includes('Water'))?.imageUrl },
      { k: 'juice', u: originalItems.find(i => i.name.includes('Juice'))?.imageUrl },
      { k: 'tea', u: originalItems.find(i => i.name.includes('Tea'))?.imageUrl },
      { k: 'coffee', u: originalItems.find(i => i.name.includes('Coffee'))?.imageUrl },
      { k: 'pork', u: originalItems.find(i => i.name.includes('Bacon'))?.imageUrl },
      { k: 'clean', u: originalItems.find(i => i.name.includes('Cleaner'))?.imageUrl },
      { k: 'bag', u: originalItems.find(i => i.name.includes('Bag'))?.imageUrl },
      { k: 'chip', u: originalItems.find(i => i.name.includes('Chip'))?.imageUrl },
      { k: 'nut', u: originalItems.find(i => i.name.includes('Nut'))?.imageUrl },
      { k: 'chocolate', u: originalItems.find(i => i.name.includes('Chocolate'))?.imageUrl },
      { k: 'tomato', u: originalItems.find(i => i.name.includes('Tomato'))?.imageUrl },
      { k: 'potato', u: originalItems.find(i => i.name.includes('Potato'))?.imageUrl },
      { k: 'onion', u: originalItems.find(i => i.name.includes('Onion'))?.imageUrl }
    ].filter(i => i.u);

    let updatedCount = 0;

    for (const item of newItems) {
      let selectedUrl = null;
      const itemNameLower = item.name.toLowerCase();

      for (const mapping of manualKeywords) {
        if (itemNameLower.includes(mapping.k)) {
          selectedUrl = mapping.u; break;
        }
      }

      if (!selectedUrl) {
        for (const mapping of keywordImageMap) {
          if (itemNameLower.includes(mapping.keyword) && mapping.keyword.length > 3) {
            selectedUrl = mapping.url; break;
          }
        }
      }

      if (!selectedUrl && categoryImagePool[item.category] && categoryImagePool[item.category].length > 0) {
        const pool = categoryImagePool[item.category];
        selectedUrl = pool[Math.floor(Math.random() * pool.length)];
      }

      if (selectedUrl && item.imageUrl !== selectedUrl) {
        item.imageUrl = selectedUrl;
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} items with relevant images in MongoDB.`);

    // 5. Update inventory.json
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
    console.log(`Successfully updated ${seedUpdateCount} items with relevant images in inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating images:', error);
    mongoose.disconnect();
  }
};

updateImages();
