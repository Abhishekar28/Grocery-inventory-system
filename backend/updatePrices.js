import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const updatePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const items = await Item.find({});
    console.log(`Found ${items.length} items to update...`);

    let count = 0;
    for (const item of items) {
      // The current prices are in USD (e.g. 3.99). Multiply by 85 to convert to INR and round.
      // If the price is already > 50, it might have already been updated, so we skip it to be safe.
      if (item.price < 50) {
        const newPrice = Math.round(item.price * 85);
        item.price = newPrice;
        await item.save();
        count++;
      }
    }

    console.log(`Successfully updated ${count} item prices to realistic INR values!`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating prices:', error);
    mongoose.disconnect();
  }
};

updatePrices();
