import React, { useState, useRef } from 'react';
import { Search, Edit2, Trash2, Calendar, ShieldAlert, Mic, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  'All',
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Beverages',
  'Pantry & Grains',
  'Snacks & Sweets',
  'Meat & Seafood',
  'Household & Cleaning'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Added' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'stock_asc', label: 'Stock: Low to High' },
  { value: 'stock_desc', label: 'Stock: High to Low' }
];

function InventoryTable({ 
  items, 
  search, 
  setSearch, 
  category, 
  setCategory, 
  sortBy, 
  setSortBy, 
  onEdit, 
  onDelete 
}) {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    // If we're already listening, toggle off and stop cleanly
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;

    // Dynamically load standard, highly optimized speech recognition models based on active language setting
    const activeLang = i18n.language || 'en';
    let recognitionLang = 'en-US';
    if (activeLang === 'hi') {
      recognitionLang = 'hi-IN'; // State-of-the-art Hindi (India) Model
    } else if (activeLang === 'kn') {
      recognitionLang = 'kn-IN'; // State-of-the-art Kannada (India) Model
    } else {
      recognitionLang = 'en-IN'; // State-of-the-art English (India) Model (tuned for regional pronunciation accents)
    }
    
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const cleanText = text.trim().replace(/\.$/g, ''); // Strip trailing period/full stop automatically
      setSearch(cleanText);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Function to determine stock warning level
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return 'critical';
    if (stock <= minStock) return 'warning';
    return 'normal';
  };

  // Function to calculate bar percentage (cap at 100%)
  const getStockPercentage = (stock, minStock) => {
    if (stock === 0) return 0;
    const maxCapacity = Math.max(minStock * 4, 100);
    return Math.min((stock / maxCapacity) * 100, 100);
  };

  const handleDeleteClick = (id, name) => {
    if (window.confirm(t('inventory.deleteConfirm', { name: name }))) {
      onDelete(id);
    }
  };

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      <h3 className="panel-title">📦 {t('inventory.title', 'Inventory Management')}</h3>
      
      {/* Search and Filters */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder={isListening ? "🎙️ Listening... Speak now!" : t('inventory.searchPlaceholder', 'Search by name, SKU, or supplier...')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingRight: '3.4rem' }} /* Added padding to clear mic icon set to right: 1.4rem */
          />
          <button
            type="button"
            onClick={startListening}
            className={`mic-icon-btn ${isListening ? 'listening' : ''}`}
            style={{
              animation: isListening ? 'pulse-mic 1.2s infinite' : 'none'
            }}
            title="Search by voice"
          >
            <Mic size={15} />
          </button>
        </div>
        
        <select 
          className="select-input" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{t(`categories.${cat}`, cat)}</option>
          ))}
        </select>

        <select 
          className="select-input" 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Main Inventory Table */}
      {items.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>{t('inventory.emptyTitle', 'No Inventory Items Found')}</h3>
          <p style={{ marginTop: '0.5rem' }}>{t('inventory.emptySub', 'Try clearing your search query or adjust your filters.')}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>{t('inventory.colProduct', 'Product details')}</th>
                <th>{t('inventory.colCategory', 'Category')}</th>
                <th>{t('inventory.colPrice', 'Price')}</th>
                <th>{t('inventory.colStock', 'Stock Level')}</th>
                <th style={{ textAlign: 'right' }}>{t('inventory.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stockStatus = getStockStatus(item.stock, item.minStock);
                const percent = getStockPercentage(item.stock, item.minStock);
                
                return (
                  <tr key={item._id}>
                    <td>
                      <div className="product-cell">
                         <img 
                          className="product-img" 
                          src={item.imageUrl} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='100%25' height='100%25' fill='%23F5F3FF'/><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' stroke='%235E13C2' stroke-width='1.5' fill='none'/></svg>";
                          }}
                        />
                        <div>
                          <div className="product-info-name" style={{ color: 'var(--text-main)' }}>{t(`products.${item.name}`, item.name)}</div>
                          <div className="product-info-sku">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{t(`categories.${item.category}`, item.category)}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      ₹{item.price.toFixed(2)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.25rem' }}>
                        / {item.unit}
                      </span>
                    </td>
                    <td>
                      <div className="stock-indicator-wrapper">
                        <div className="stock-meta">
                          <span style={{ 
                            color: stockStatus === 'critical' ? 'var(--color-critical)' : 
                                   stockStatus === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)',
                            fontWeight: 700 
                          }}>
                            {item.stock} {item.unit}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>min: {item.minStock}</span>
                        </div>
                        <div className="stock-bar-bg">
                          <div 
                            className={`stock-bar-fill ${stockStatus}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon edit" 
                          onClick={() => onEdit(item)}
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDeleteClick(item._id, item.name)}
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;
