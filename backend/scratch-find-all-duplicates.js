import fs from 'fs';

const inventory = JSON.parse(fs.readFileSync('./inventory.json', 'utf-8'));

const imageGroups = {};

inventory.forEach(item => {
  if (!imageGroups[item.imageUrl]) {
    imageGroups[item.imageUrl] = [];
  }
  imageGroups[item.imageUrl].push(item.name);
});

console.log('--- Duplicate Image URLs Report ---');
let duplicateCount = 0;
for (const [url, names] of Object.entries(imageGroups)) {
  if (names.length > 1) {
    duplicateCount++;
    console.log(`\nImage URL: ${url}`);
    console.log(`Used by (${names.length} items):`);
    names.forEach(name => console.log(`  - ${name}`));
  }
}

console.log(`\nTotal duplicate image groups found: ${duplicateCount}`);
