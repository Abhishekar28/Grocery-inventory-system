import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const items = await Item.find();
    console.log('Sample Items from DB:', JSON.stringify(items, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
