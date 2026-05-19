import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

function extractDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url);
    
    // Yahoo Search Images
    if (parsed.hostname.includes('search.yahoo.com')) {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) {
        return imgurl.startsWith('http') ? imgurl : `https://${imgurl}`;
      }
    }
    
    // Google Search Images
    if (parsed.hostname.includes('google') && parsed.pathname.includes('imgres')) {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return imgurl;
    }
    
    // Bing Search Images
    if (parsed.hostname.includes('bing.com') && parsed.pathname.includes('images')) {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return imgurl;
    }
  } catch (e) {
    // Ignore invalid URLs
  }
  return url;
}

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const items = await Item.find({ imageUrl: /search\.yahoo\.com/ });
    console.log(`Found ${items.length} items with Yahoo search image URLs.`);

    let migrated = 0;
    for (const item of items) {
      const cleanUrl = extractDirectImageUrl(item.imageUrl);
      if (cleanUrl !== item.imageUrl) {
        item.imageUrl = cleanUrl;
        await item.save();
        migrated++;
        console.log(`Successfully migrated item "${item.name}" -> ${cleanUrl}`);
      }
    }

    console.log(`Migration complete. Cleaned ${migrated} Yahoo search images!`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

migrate();
