import express from 'express';
import Item from '../models/Item.js';
import nodemailer from 'nodemailer';

// Configure Ethereal Email for testing low stock alerts
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log('Ethereal Email transporter initialized for low stock alerts.');
});

const router = express.Router();

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

// GET /api/items - Retrieve all items with search, filter, and sorting
router.get('/', async (req, res) => {
  try {
    const { search, category, sortBy } = req.query;
    let query = {};

    // Apply category filter if specified
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply search filter (matches name, SKU, or supplier)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { supplier: searchRegex }
      ];
    }

    let itemsQuery = Item.find(query);

    // Apply sorting
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      const sortOrder = order === 'desc' ? -1 : 1;
      
      if (field === 'name') {
        itemsQuery = itemsQuery.sort({ name: sortOrder });
      } else if (field === 'price') {
        itemsQuery = itemsQuery.sort({ price: sortOrder });
      } else if (field === 'stock') {
        itemsQuery = itemsQuery.sort({ stock: sortOrder });
      } else {
        itemsQuery = itemsQuery.sort({ createdAt: -1 }); // Default to newest
      }
    } else {
      itemsQuery = itemsQuery.sort({ createdAt: -1 }); // Default to newest
    }

    const items = await itemsQuery;
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

// GET /api/items/stats - Aggregate inventory statistics
router.get('/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    
    // Aggregation for total inventory value
    const valueAggregation = await Item.aggregate([
      {
        $project: {
          totalValue: { $multiply: ['$price', '$stock'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalValue' }
        }
      }
    ]);
    const totalValue = valueAggregation[0]?.total || 0;

    // Count low stock items (where stock <= minStock)
    const lowStockCount = await Item.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] }
    });

    // Count out-of-stock items
    const outOfStockCount = await Item.countDocuments({ stock: 0 });

    // Category distribution aggregation
    const categoryStats = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          value: { $round: ['$value', 2] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockCount,
      outOfStockCount,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating inventory statistics', error: error.message });
  }
});

// GET /api/items/low-stock - Retrieve all low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Item.find({
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ stock: 1 });
    
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock items', error: error.message });
  }
});

// GET /api/items/:id - Fetch single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item details', error: error.message });
  }
});

// POST /api/items - Create a new item
router.post('/', async (req, res) => {
  try {
    const itemData = { ...req.body };
    if (itemData.imageUrl) {
      itemData.imageUrl = extractDirectImageUrl(itemData.imageUrl.trim());
    }
    
    // Generate an automatic SKU if none is provided
    if (!itemData.sku) {
      const categoryPrefix = (itemData.category || 'GEN').substring(0, 3).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      itemData.sku = `${categoryPrefix}-${randomNum}`;
    }

    const newItem = new Item(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate SKU error. The SKU must be unique.' });
    }
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Clean up empty image URL to let schema default or fallback handle it
    if (updateData.imageUrl === '' || (updateData.imageUrl && updateData.imageUrl.trim() === '')) {
      updateData.imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    } else if (updateData.imageUrl) {
      updateData.imageUrl = extractDirectImageUrl(updateData.imageUrl.trim());
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if stock is low and send email alert
    if (updatedItem.stock <= updatedItem.minStock && transporter) {
      const mailOptions = {
        from: '"Grocify Alerts" <alerts@grocify.test>',
        to: 'manager@grocify.com',
        subject: `Low Stock Alert: ${updatedItem.name}`,
        text: `Alert! The stock for ${updatedItem.name} (${updatedItem.sku}) has dropped to ${updatedItem.stock}. Please restock soon.`,
        html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;border-radius:8px;">
                <h2 style="color:#d97706;">⚠️ Low Stock Alert</h2>
                <p>The stock for <b>${updatedItem.name}</b> (SKU: ${updatedItem.sku}) has dropped to <span style="color:red;font-weight:bold;font-size:1.1em;">${updatedItem.stock}</span>.</p>
                <p>The minimum threshold is set to ${updatedItem.minStock}. Please arrange a restock soon.</p>
              </div>`
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email alert:', error);
        } else {
          console.log('\n--- LOW STOCK ALERT TRIGGERED ---');
          console.log('Email Sent for: %s', updatedItem.name);
          console.log('Preview Email URL: %s', nodemailer.getTestMessageUrl(info));
          console.log('---------------------------------\n');
        }
      });
    }

    res.json(updatedItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate SKU error. The SKU must be unique.' });
    }
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item successfully deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

export default router;
