import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

async function findDbDuplicates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const items = await Item.find({});
    console.log(`Loaded ${items.length} items from MongoDB.`);

    const imageGroups = {};
    items.forEach(item => {
      if (!imageGroups[item.imageUrl]) {
        imageGroups[item.imageUrl] = [];
      }
      imageGroups[item.imageUrl].push({ name: item.name, sku: item.sku });
    });

    console.log('\n--- Live Database Duplicate Image URLs Report ---');
    let duplicateCount = 0;
    for (const [url, itemsList] of Object.entries(imageGroups)) {
      if (itemsList.length > 1) {
        duplicateCount++;
        console.log(`\nImage URL: ${url}`);
        console.log(`Used by (${itemsList.length} items):`);
        itemsList.forEach(i => console.log(`  - ${i.name} (${i.sku})`));
      }
    }

    console.log(`\nTotal duplicate image groups in DB: ${duplicateCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

findDbDuplicates();
