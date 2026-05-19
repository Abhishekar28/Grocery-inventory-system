import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, PackageSearch, ScanLine, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import BarcodeScanner from './BarcodeScanner';

const POSCheckout = ({ items, onBack, onCheckout, theme }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBill, setShowBill] = useState(false);

  // Extract categories for filter
  const categories = ['All', ...new Set(items.map(i => i.category))];

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'All' || item.category === category;
      const hasStock = item.stock > 0; // Only show items with stock for POS
      return matchesSearch && matchesCategory && hasStock;
    });
  }, [items, search, category]);

  // Cart logic
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        if (existing.cartQuantity >= item.stock) return prev; // Cannot exceed stock
        return prev.map(i => i._id === item._id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > item.stock) return item; // limit to available stock
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }).filter(item => item.cartQuantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const tax = subtotal * 0.05; // 5% tax example
  const total = subtotal + tax;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const result = await onCheckout(cart);
    setIsProcessing(false);
    if (result) {
      setSuccess(true);
      setCart([]);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, animation: 'fadeIn 0.25s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', gap: '0.4rem', fontFamily: 'Outfit, sans-serif' }}
          >
            <ArrowLeft size={14} /> {t('details.back', 'Back')}
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="var(--color-primary)" />
            {t('pos.title', 'Point of Sale Checkout')}
          </h2>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Inventory Catalog */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '1rem', overflow: 'hidden' }}>
          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={t('pos.search', 'Search by name or SKU...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', height: '38px' }}
              />
              <button 
                onClick={() => setShowScanner(true)}
                style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}
                title="Scan Barcode"
              >
                <ScanLine size={16} color="var(--color-primary)" />
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '140px', height: '38px' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{t(`categories.${cat}`, cat)}</option>
              ))}
            </select>
          </div>

          {/* Product Grid */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', alignContent: 'start', paddingRight: '0.25rem' }}>
            {filteredItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <PackageSearch size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
                <p>{t('pos.noItems', 'No matching items found in stock.')}</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => addToCart(item)}
                  style={{ 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '0.75rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    background: 'var(--bg-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff', border: '1px solid var(--border-glass)' }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='100%25' height='100%25' fill='%23F5F3FF'/><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' stroke='%235E13C2' stroke-width='1.5' fill='none'/></svg>"; }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {t(`products.${item.name}`, item.name)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.stock} {item.unit} left</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Cart Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{t('pos.cart', 'Current Order')}</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '0.15rem 0.5rem', borderRadius: '100px' }}>
              {cart.reduce((s, i) => s + i.cartQuantity, 0)} items
            </span>
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: '#10b981' }}>
                <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{t('pos.success', 'Sale Completed!')}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory stock has been updated.</p>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', opacity: 0.6 }}>
                <ShoppingCart size={32} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.85rem' }}>{t('pos.emptyCart', 'Cart is empty')}</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid var(--border-glass)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{t(`products.${item.name}`, item.name)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>₹{item.price.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item._id, -1)} style={{ border: 'none', background: 'var(--bg-secondary)', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                        <Minus size={12} />
                      </button>
                      <div style={{ width: '24px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.cartQuantity}
                      </div>
                      <button onClick={() => updateQuantity(item._id, 1)} style={{ border: 'none', background: 'var(--bg-secondary)', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} style={{ border: 'none', background: 'transparent', color: 'var(--color-critical)', cursor: 'pointer', padding: '0.2rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer / Totals */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>{t('pos.subtotal', 'Subtotal')}</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>{t('pos.tax', 'Tax (5%)')}</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <span>{t('pos.total', 'Total')}</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={clearCart}
                disabled={cart.length === 0 || isProcessing}
                style={{ padding: '0.75rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: cart.length === 0 ? 0.5 : 1 }}
              >
                <Trash2 size={18} />
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowBill(true)}
                disabled={cart.length === 0 || isProcessing}
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center' }}
              >
                Generate Bill & Pay
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Scanner Overlay */}
      {showScanner && (
        <BarcodeScanner 
          onScan={(text) => {
            setSearch(text);
            setShowScanner(false);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Digital Bill & QR Payment Overlay */}
      {showBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '400px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowBill(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={16} color="var(--text-main)" />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800 }}>Grocify Store</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scan with any UPI App to Pay</p>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-glass)', borderBottom: '1px dashed var(--border-glass)', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-main)' }}>{item.cartQuantity}x {t(`products.${item.name}`, item.name)}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>{t('pos.subtotal', 'Subtotal')}</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>{t('pos.tax', 'Tax (5%)')}</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-primary)', boxShadow: '0 8px 24px rgba(94,19,194,0.15)' }}>
              <QRCodeSVG 
                value={`upi://pay?pa=store@upi&pn=Grocify%20Store&am=${total.toFixed(2)}&cu=INR`} 
                size={220}
                level="H"
                fgColor="#5E13C2"
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowBill(false);
                handleCompleteSale();
              }}
              disabled={isProcessing}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', justifyContent: 'center', fontWeight: 700 }}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment Received'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSCheckout;
