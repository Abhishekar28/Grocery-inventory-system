import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_inventory';

// Define minimal Schema
const itemSchema = new mongoose.Schema({
  name: String,
  stock: Number,
  category: String
});

const Item = mongoose.model('Item', itemSchema);

async function setOutOfStock() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!');

    // 1. Update in MongoDB
    // We will pick 5 popular items to set stock to 0
    const itemsToEmpty = [
      'Organic Gala Apples',
      'Fresh Organic Bananas',
      'Organic Baby Spinach',
      'Vine-Ripened Roma Tomatoes',
      'Organic Haas Avocados',
      'Diet Cola'
    ];

    console.log(`Setting stock to 0 for: ${itemsToEmpty.join(', ')}`);
    
    const result = await Item.updateMany(
      { name: { $in: itemsToEmpty } },
      { $set: { stock: 0 } }
    );

    console.log(`Successfully updated ${result.modifiedCount} items to stock = 0 in database!`);

    // Let's also verify their stock
    const updatedItems = await Item.find({ name: { $in: itemsToEmpty } });
    console.log('Current Database Stock levels:');
    updatedItems.forEach(item => {
      console.log(` - ${item.name}: Stock = ${item.stock}`);
    });

    // 2. Also update inventory.json for seed permanency
    const inventoryPath = path.resolve('inventory.json');
    if (fs.existsSync(inventoryPath)) {
      const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
      let seedUpdated = 0;
      inventory.forEach(item => {
        if (itemsToEmpty.includes(item.name)) {
          item.stock = 0;
          seedUpdated++;
        }
      });
      fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2), 'utf-8');
      console.log(`Successfully updated ${seedUpdated} items in inventory.json to stock = 0.`);
    }

  } catch (error) {
    console.error('Error running setOutOfStock:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

setOutOfStock();
