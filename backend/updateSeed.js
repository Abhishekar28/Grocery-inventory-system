import fs from 'fs';
import path from 'path';

const updateSeedFile = () => {
  const filePath = path.resolve('inventory.json');
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(rawData);

    let count = 0;
    for (const item of items) {
      if (item.price < 50) {
        item.price = Math.round(item.price * 85);
        count++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    console.log(`Successfully updated ${count} prices in inventory.json`);
  } catch (err) {
    console.error('Error updating seed file:', err);
  }
};

updateSeedFile();
