import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock threshold is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 5
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  supplier: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  }
}, {
  timestamps: true
});

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
    // If not a valid URL, ignore parsing
  }
  return url;
}

// Pre-save middleware to handle empty strings and search engine wrapper URLs for imageUrl
itemSchema.pre('save', function() {
  // First, clean up and extract direct image URLs if user pasted search page URLs
  if (this.imageUrl) {
    this.imageUrl = extractDirectImageUrl(this.imageUrl.trim());
  }

  if (!this.imageUrl || this.imageUrl.trim() === '') {
    this.imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  }
});

// Virtual for low stock alert
itemSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStock;
});

// Ensure virtuals are serialized
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;
