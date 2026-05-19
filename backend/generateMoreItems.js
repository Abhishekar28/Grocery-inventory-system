import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item from './models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

const newProducts = {
  "Fruits & Vegetables": [
    "Red Onions", "Garlic Bulbs", "Ginger Root", "Green Bell Peppers", "Red Bell Peppers", 
    "Jalapeno Peppers", "Fresh Cilantro", "Fresh Mint Leaves", "Green Cabbage", "Red Cabbage", 
    "Iceberg Lettuce", "Romaine Hearts", "Fresh Kale", "Zucchini Squash", "Yellow Squash", 
    "Eggplant", "Sweet Potatoes", "Cauliflower Head", "Fresh Green Beans", "Asparagus Spears", 
    "Fresh Lemons", "Fresh Limes", "Navel Oranges", "Ruby Red Grapefruit", "Seedless Watermelon", 
    "Cantaloupe Melon", "Honeydew Melon", "Fresh Pineapple", "Alphonso Mangoes", "Fresh Papaya", 
    "Pomegranate", "Kiwi Fruit", "Red Seedless Grapes", "Green Seedless Grapes", "Fresh Cherries", 
    "Sweet Peaches", "Black Plums", "Nectarines", "Bartlett Pears", "Fuji Apples", "Granny Smith Apples"
  ],
  "Dairy & Eggs": [
    "Skim Milk", "2% Reduced Fat Milk", "Chocolate Milk", "Heavy Whipping Cream", "Half and Half",
    "Sour Cream", "Cottage Cheese", "Cream Cheese Block", "Swiss Cheese Slices", "Provolone Slices",
    "Mozzarella Ball", "Parmesan Wedge", "Gouda Cheese", "Brie Cheese", "Salted Butter Sticks",
    "Unsalted Butter Sticks", "Margarine Tub", "Oat Milk", "Soy Milk", "Coconut Milk",
    "Strawberry Yogurt", "Blueberry Yogurt", "Vanilla Bean Yogurt", "Quail Eggs", "Duck Eggs",
    "Medium White Eggs", "Ghee (Clarified Butter)", "Paneer Block", "Buttermilk"
  ],
  "Bakery & Bread": [
    "White Sandwich Bread", "Multigrain Bread", "Rye Bread", "Pumpernickel Bread", "French Baguette",
    "Ciabatta Rolls", "Hamburger Buns", "Hot Dog Buns", "Plain Bagels", "Everything Bagels",
    "Cinnamon Raisin Bagels", "English Muffins", "Pita Bread", "Naan Bread", "Corn Tortillas",
    "Blueberry Muffins", "Chocolate Chip Muffins", "Apple Fritters", "Glazed Donuts", "Chocolate Donuts",
    "Baguette Crisps", "Garlic Bread Loaf", "Pizza Dough", "Dinner Rolls", "Pretzel Buns"
  ],
  "Beverages": [
    "Cola 12-Pack", "Diet Cola", "Lemon-Lime Soda", "Ginger Ale", "Root Beer",
    "Apple Juice", "Cranberry Juice", "Grape Juice", "Pineapple Juice", "Tomato Juice",
    "Coconut Water", "Sports Drink (Blue)", "Sports Drink (Red)", "Energy Drink", "Iced Tea Lemon",
    "Sweet Tea", "Lemonade", "Purified Water 24-Pack", "Spring Water Gallon", "Sparkling Water (Berry)",
    "Sparkling Water (Grapefruit)", "Instant Coffee Jar", "Espresso Beans", "Earl Grey Tea", "Chamomile Tea",
    "Peppermint Tea", "Hot Cocoa Mix", "Almond Milk Mocha"
  ],
  "Pantry & Grains": [
    "All-Purpose Flour", "Whole Wheat Flour", "Almond Flour", "Granulated Sugar", "Brown Sugar",
    "Powdered Sugar", "Baking Soda", "Baking Powder", "Active Dry Yeast", "Vanilla Extract",
    "Vegetable Oil", "Canola Oil", "Coconut Oil", "Balsamic Vinegar", "Apple Cider Vinegar",
    "White Vinegar", "Soy Sauce", "Teriyaki Sauce", "Hot Sauce", "Ketchup",
    "Yellow Mustard", "Dijon Mustard", "Mayonnaise", "BBQ Sauce", "Spaghetti Pasta",
    "Macaroni Pasta", "Rotini Pasta", "Basmati Rice", "Brown Rice", "Lentils",
    "Chickpeas (Canned)", "Kidney Beans (Canned)", "Tomato Paste", "Diced Tomatoes (Canned)", "Chicken Broth"
  ],
  "Snacks & Sweets": [
    "Tortilla Chips", "BBQ Potato Chips", "Sour Cream & Onion Chips", "Pretzel Twists", "Cheese Puffs",
    "Microwave Popcorn", "Caramel Popcorn", "Peanuts (Roasted)", "Almonds (Raw)", "Cashews (Salted)",
    "Walnuts", "Pecans", "Trail Mix", "Beef Jerky", "Fruit Snacks",
    "Milk Chocolate Bar", "White Chocolate Bar", "Gummy Bears", "Jelly Beans", "Licorice Twists",
    "Chocolate Chip Cookies", "Oatmeal Raisin Cookies", "Sandwich Cookies", "Graham Crackers", "Saltine Crackers",
    "Rice Cakes", "Marshmallows", "Mints"
  ],
  "Meat & Seafood": [
    "Chicken Thighs (Bone-in)", "Chicken Wings", "Whole Roasting Chicken", "Ground Turkey", "Turkey Breast",
    "Pork Chops", "Pork Tenderloin", "Pork Ribs", "Ground Pork", "Beef Sirloin Steak",
    "Beef Chuck Roast", "Beef Stew Meat", "Veal Cutlets", "Lamb Chops", "Ground Lamb",
    "Tilapia Fillets", "Cod Fillets", "Tuna Steaks", "Raw Shrimp (Peeled)", "Cooked Shrimp",
    "Sea Scallops", "Mussels", "Clams", "Lobster Tails", "Crab Legs",
    "Smoked Salmon", "Canned Tuna", "Canned Sardines", "Hot Dogs", "Italian Sausage"
  ],
  "Household & Cleaning": [
    "Bleach", "Fabric Softener", "Dryer Sheets", "Stain Remover", "Glass Cleaner",
    "Toilet Bowl Cleaner", "Bathroom Grime Fighter", "Floor Cleaner", "Carpet Cleaner", "Sponges (4-Pack)",
    "Scrub Brushes", "Dishwasher Pods", "Trash Bags (13 Gallon)", "Trash Bags (30 Gallon)", "Sandwich Bags",
    "Freezer Bags", "Aluminum Foil", "Plastic Wrap", "Parchment Paper", "Napkins",
    "Facial Tissues", "Toilet Paper (12-Roll)", "Hand Soap Refill", "Bar Soap", "Body Wash",
    "Shampoo", "Conditioner", "Toothpaste", "Mouthwash", "Batteries (AA 8-Pack)"
  ]
};

const generateItems = () => {
  const generated = [];
  let idCounter = 100; // Start at 100 to avoid conflicts with GROC-001 to GROC-050

  for (const [category, itemNames] of Object.entries(newProducts)) {
    for (const name of itemNames) {
      const price = Math.floor(Math.random() * (400 - 40 + 1)) + 40; // Random price between 40 and 400 INR
      const stock = Math.floor(Math.random() * 150) + 10;
      const minStock = Math.floor(stock * 0.2); // 20% of initial stock

      const catPrefix = category.substring(0, 3).toUpperCase();
      const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
      const sku = `${catPrefix}-${namePrefix}-${idCounter}`;
      
      const expiryDays = Math.floor(Math.random() * 365) + 30; // 30 to 395 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      generated.push({
        id: `GROC-${idCounter}`,
        name: name,
        category: category,
        price: price,
        unit: category === 'Beverages' ? '1 Unit' : (category === 'Fruits & Vegetables' ? '1 kg' : '1 Pack'),
        stock: stock,
        minStock: minStock === 0 ? 5 : minStock,
        sku: sku,
        expiryDate: expiryDate.toISOString().split('T')[0],
        supplier: "Global Suppliers Network",
        description: `Premium quality ${name} sourced for freshness and reliability.`,
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" // Generic grocery image
      });
      
      idCounter++;
    }
  }
  return generated;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-inventory');
    console.log('Connected to MongoDB');

    const newItems = generateItems();
    console.log(`Generated ${newItems.length} unique items.`);

    // 1. Insert into MongoDB
    let addedCount = 0;
    for (const itemData of newItems) {
      // Check if item exists to prevent duplicates
      const exists = await Item.findOne({ name: itemData.name });
      if (!exists) {
        await Item.create(itemData);
        addedCount++;
      }
    }
    console.log(`Successfully added ${addedCount} NEW items to MongoDB.`);

    // 2. Append to inventory.json
    const filePath = path.resolve('inventory.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const existingSeedItems = JSON.parse(rawData);
    
    const combinedItems = [...existingSeedItems];
    let seedAdded = 0;
    
    for (const newItem of newItems) {
      const existsInSeed = combinedItems.find(i => i.name === newItem.name);
      if (!existsInSeed) {
        combinedItems.push(newItem);
        seedAdded++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(combinedItems, null, 2));
    console.log(`Successfully appended ${seedAdded} items to inventory.json.`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding items:', error);
    mongoose.disconnect();
  }
};

seedDatabase();
