import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const setOutOfStock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    // Find the first 3 items and set their stock to 0
    const items = await Item.find({}).limit(3);
    
    let count = 0;
    for (const item of items) {
      item.stock = 0;
      await item.save();
      console.log(`Set ${item.name} to Out of Stock.`);
      count++;
    }

    console.log(`Successfully set ${count} items to 0 stock!`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating stock:', error);
    mongoose.disconnect();
  }
};

setOutOfStock();
