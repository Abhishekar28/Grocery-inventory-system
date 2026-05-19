import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, ScanLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BarcodeScanner from './BarcodeScanner';
const CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Beverages',
  'Pantry & Grains',
  'Snacks & Sweets',
  'Meat & Seafood',
  'Household & Cleaning'
];

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

function ItemModal({ isOpen, onClose, onSave, editingItem }) {
  const { t, i18n } = useTranslation();
  const initialFormState = {
    name: '',
    category: CATEGORIES[0],
    price: '',
    unit: '',
    stock: '',
    minStock: '5',
    sku: '',
    expiryDate: '',
    supplier: '',
    description: '',
    imageUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (editingItem) {
      // Format date to YYYY-MM-DD for the input type="date"
      let formattedDate = '';
      if (editingItem.expiryDate) {
        formattedDate = new Date(editingItem.expiryDate).toISOString().split('T')[0];
      }

      setFormData({
        ...editingItem,
        price: editingItem.price.toString(),
        stock: editingItem.stock.toString(),
        minStock: editingItem.minStock.toString(),
        expiryDate: formattedDate,
        supplier: editingItem.supplier || '',
        description: editingItem.description || '',
        imageUrl: editingItem.imageUrl || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.name.trim()) return setError('Item name is required');
    if (!formData.unit.trim()) return setError('Unit of measurement is required (e.g., 1lb bag, 12 count)');
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) return setError('Price must be a positive number');

    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) return setError('Stock must be a positive integer');

    const minStockNum = parseInt(formData.minStock, 10);
    if (isNaN(minStockNum) || minStockNum < 0) return setError('Min stock must be a positive integer');

    // Prepare payload
    const payload = {
      ...formData,
      price: priceNum,
      stock: stockNum,
      minStock: minStockNum,
      imageUrl: formData.imageUrl ? extractDirectImageUrl(formData.imageUrl.trim()) : '',
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? t('modal.editTitle', 'Edit Inventory Item') : t('modal.addTitle', 'Add New Grocery Item')}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--color-critical-glow)', color: 'var(--color-critical)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--color-critical)', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-field full-width">
                <label>{t('modal.name', 'Product Name*')}</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g., Fresh Organic Gala Apples"
                  required 
                  lang={i18n.language}
                />
              </div>

              <div className="form-field">
                <label>{t('modal.category', 'Category*')}</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{t(`categories.${cat}`, cat)}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>{t('modal.unit', 'Unit/Package Size*')}</label>
                <input 
                  type="text" 
                  name="unit" 
                  value={formData.unit} 
                  onChange={handleChange} 
                  placeholder="e.g., 1lb bag, 12 count, 1 Gallon"
                  required 
                />
              </div>

              <div className="form-field">
                <label>{t('modal.price', 'Price (₹)*')}</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required 
                />
              </div>

              <div className="form-field">
                <label>{t('modal.stock', 'Current Stock Quantity*')}</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  min="0"
                  placeholder="e.g., 50"
                  required 
                />
              </div>

              <div className="form-field">
                <label>{t('modal.minStock', 'Min Stock Threshold*')}</label>
                <input 
                  type="number" 
                  name="minStock" 
                  value={formData.minStock} 
                  onChange={handleChange} 
                  min="0"
                  placeholder="e.g., 10"
                  required 
                />
              </div>

              <div className="form-field">
                <label>{t('modal.sku', 'SKU (leave blank to auto-generate)')}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="sku" 
                    value={formData.sku} 
                    onChange={handleChange} 
                    placeholder="e.g., FRU-APP-001" 
                    disabled={!!editingItem} // SKU is unmodifiable on edit
                    style={{ paddingRight: '2.5rem' }}
                  />
                  {!editingItem && (
                    <button 
                      type="button"
                      onClick={() => setShowScanner(true)}
                      style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.35rem', cursor: 'pointer', display: 'flex' }}
                      title="Scan Barcode"
                    >
                      <ScanLine size={14} color="var(--color-primary)" />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label>{t('modal.supplier', 'Supplier')}</label>
                <input 
                  type="text" 
                  name="supplier" 
                  value={formData.supplier} 
                  onChange={handleChange} 
                  placeholder="Supplier Name" 
                />
              </div>

              <div className="form-field">
                <label>{t('modal.expiry', 'Expiry Date')}</label>
                <input 
                  type="date" 
                  name="expiryDate" 
                  value={formData.expiryDate} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-field full-width">
                <label>{t('modal.imageUrl', 'Image URL')}</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://images.unsplash.com/... (optional)" 
                />
              </div>

              <div className="form-field full-width">
                <label>{t('modal.desc', 'Description')}</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Describe the product details..."
                  rows="3"
                  lang={i18n.language}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('modal.cancel', 'Cancel')}</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {editingItem ? (
                <>
                  <Edit2 size={16} />
                  {t('modal.save', 'Save Changes')}
                </>
              ) : (
                <>
                  <Plus size={16} />
                  {t('modal.create', 'Create Item')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Scanner Overlay */}
      {showScanner && (
        <BarcodeScanner 
          onScan={(text) => {
            setFormData(prev => ({ ...prev, sku: text }));
            setShowScanner(false);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}

export default ItemModal;
