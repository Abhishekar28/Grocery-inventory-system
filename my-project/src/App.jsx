import React, { useState, useEffect } from 'react';
import { Activity, Plus, RefreshCw, AlertCircle, TrendingUp, TrendingDown, ArrowLeft, Download, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardStats from './components/DashboardStats';
import LowStockList from './components/LowStockList';
import InventoryTable from './components/InventoryTable';
import ItemModal from './components/ItemModal';
import Login from './components/Login';
import StockDetailsView from './components/StockDetailsView';
import ProfileDropdown from './components/ProfileDropdown';
import AnalyticsChart from './components/AnalyticsChart';
import POSCheckout from './components/POSCheckout';
function App() {
  const { t, i18n } = useTranslation();
  
  // Update HTML lang attribute for OS/Keyboard hinting
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Theme state – persisted to localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('grocify_theme') || 'light');

  // Inventory and Stats State
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [hasNotified, setHasNotified] = useState(false);

  // UI Control State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentView, setCurrentView] = useState('dashboard');

  // Modal and Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Loading / Error State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ── Apply theme to <html> data-theme attribute ─────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('grocify_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ── Auth restore from localStorage ────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
  }, []);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const queryParams = new URLSearchParams({ search, category, sortBy }).toString();
      const res = await fetch(`/api/items?${queryParams}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch items');
      setItems(await res.json());
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure the API server is running.');
    }
  };

  const fetchStats = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/items/stats', { headers });
      if (!res.ok) throw new Error('Failed to fetch statistics');
      setStats(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchLowStock = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/items/low-stock', { headers });
      if (!res.ok) throw new Error('Failed to fetch low stock alerts');
      setLowStockItems(await res.json());
    } catch (err) { console.error(err); }
  };

  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    await Promise.all([fetchItems(), fetchStats(), fetchLowStock()]);
    setLoading(false);
  };

  // Debounced filter re-fetch
  useEffect(() => {
    if (!token) return;
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [search, category, sortBy, token]);

  // Load on auth
  useEffect(() => { if (token) loadDashboardData(); }, [token]);

  // Push Notifications for low stock
  useEffect(() => {
    if (lowStockItems.length > 0 && !hasNotified) {
      if (Notification.permission === 'granted') {
        new Notification('Grocify Alert', {
          body: `You have ${lowStockItems.length} items running low on stock!`,
          icon: '/vite.svg'
        });
        setHasNotified(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Grocify Alert', {
              body: `You have ${lowStockItems.length} items running low on stock!`,
              icon: '/vite.svg'
            });
            setHasNotified(true);
          }
        });
      }
    }
  }, [lowStockItems, hasNotified]);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken); setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); localStorage.removeItem('authUser');
    setToken(null); setUser(null); setItems([]);
  };

  const handleManualRefresh = async () => { setRefreshing(true); await loadDashboardData(false); setRefreshing(false); };

  const handleSaveItem = async (payload) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
      const response = editingItem
        ? await fetch(`/api/items/${editingItem._id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
        : await fetch('/api/items', { method: 'POST', headers, body: JSON.stringify(payload) });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Save failed');
      setIsModalOpen(false); setEditingItem(null);
      loadDashboardData(false);
    } catch (err) { alert(`⚠️ Save Error: ${err.message}`); }
  };

  const handleDeleteItem = async (id) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE', headers });
      if (!response.ok) { const d = await response.json(); throw new Error(d.message || 'Delete failed'); }
      loadDashboardData(false);
    } catch (err) { alert(`⚠️ Delete Error: ${err.message}`); }
  };

  const handleQuickRestock = async (id, amount) => {
    try {
      const item = items.find(i => i._id === id);
      if (!item) return;
      const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
      const response = await fetch(`/api/items/${id}`, { method: 'PUT', headers, body: JSON.stringify({ stock: item.stock + amount }) });
      if (!response.ok) throw new Error('Failed to update stock');
      loadDashboardData(false);
    } catch (err) { alert(`⚠️ Restock Error: ${err.message}`); }
  };

  const handleCheckout = async (cartItems) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
      
      await Promise.all(cartItems.map(async (cartItem) => {
        const item = items.find(i => i._id === cartItem._id);
        if (!item) return;
        const newStock = Math.max(0, item.stock - cartItem.cartQuantity);
        
        const response = await fetch(`/api/items/${item._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ stock: newStock })
        });
        if (!response.ok) throw new Error(`Failed to update ${item.name}`);
      }));
      
      await loadDashboardData(false);
      return true; // Success
    } catch (err) {
      alert(`⚠️ Checkout Error: ${err.message}`);
      return false;
    }
  };

  const openAddModal = () => { setEditingItem(null); setIsModalOpen(true); };
  const openEditModal = (item) => { setEditingItem(item); setIsModalOpen(true); };

  const handleExportCSV = () => {
    if (!items || items.length === 0) return;
    const headers = ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Min Stock', 'Unit', 'Supplier', 'Expiry Date'];
    const rows = items.map(item => [
      item.sku || '',
      `"${item.name || ''}"`,
      `"${item.category || ''}"`,
      item.price || 0,
      item.stock || 0,
      item.minStock || 0,
      `"${item.unit || ''}"`,
      `"${item.supplier || ''}"`,
      item.expiryDate ? item.expiryDate.split('T')[0] : ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `grocify_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  });

  // Daily P&L estimate (simulated from current inventory value)
  const dailyRevenue = stats.totalValue > 0 ? stats.totalValue * 0.035 : 0;
  const dailyCost = dailyRevenue * 0.64;
  const dailyProfit = dailyRevenue - dailyCost;
  const profitPositive = dailyProfit >= 0;

  // ── Theme-aware tokens ─────────────────────────────────────────────────────
  const isDark = theme === 'dark';
  const headerBg = 'var(--bg-card)';
  const borderColor = 'var(--border-glass)';
  const textMain = 'var(--text-main)';
  const textMuted = 'var(--text-muted)';

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-container" data-theme={theme}>
      {/* ── Header ── */}
      <header className="app-header" style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}>
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <div className="brand-title">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#5E13C2', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{t('header.title', 'Grocify')}</h1>
            <span style={{ fontSize: '0.68rem', color: textMuted, fontWeight: 500 }}>{t('header.subtitle', 'Welcome to Grocify')}</span>
          </div>
        </div>

        {/* Center: Daily P&L */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-secondary)', border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '0.5rem 1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{t('header.dailyRevenue', 'Daily Revenue')}</div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#5E13C2' }}>₹{dailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: borderColor }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{t('header.todayPnL', "Today's P&L")}</div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: profitPositive ? '#10b981' : '#DC2626' }}>
              {profitPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {profitPositive ? '+' : ''}{dailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: borderColor }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{t('header.dailyCost', 'Daily Cost')}</div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#DC2626' }}>₹{dailyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setCurrentView('pos')} style={{ padding: '0.5rem 0.8rem', gap: '0.4rem', color: 'var(--color-primary)' }}>
            <ShoppingCart size={15} />
            POS Checkout
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Download CSV" style={{ padding: '0.5rem 0.625rem' }}>
            <Download size={15} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh"
            style={{ padding: '0.5rem 0.625rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'spinner' : ''} />
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={15} />
            {t('header.addItem', 'Add Item')}
          </button>
          <ProfileDropdown user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
          <p style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {/* ── Main Dashboard ── */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
          <p>Loading Grocify...</p>
        </div>
      ) : currentView === 'total-value' ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexShrink: 0 }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s ease', flexShrink: 0,
                fontFamily: 'Outfit, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.border = '1px solid var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.border = '1px solid var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={14} /> {t('details.back', 'Back')}
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.2 }}>
                📊 {t('analytics.title', 'Revenue Analytics')}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0 }}>
            <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '16 / 9', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <AnalyticsChart items={items} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      ) : currentView === 'pos' ? (
        <POSCheckout 
          items={items} 
          onBack={() => setCurrentView('dashboard')} 
          onCheckout={handleCheckout} 
          theme={theme} 
        />
      ) : currentView !== 'dashboard' ? (
        <StockDetailsView
          type={currentView}
          items={
            currentView === 'unique-items'
              ? items
              : currentView === 'low-stock'
              ? items.filter(i => i.stock > 0 && i.stock <= i.minStock)
              : currentView === 'out-of-stock'
              ? items.filter(i => i.stock === 0)
              : expiringItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
          }
          onBack={() => setCurrentView('dashboard')}
          onEdit={openEditModal}
          onDelete={handleDeleteItem}
          theme={theme}
        />
      ) : (
        <>
          {/* Stats Ribbon */}
          <DashboardStats
            stats={stats}
            items={items}
            expiringCount={expiringItems.length}
            onViewChange={setCurrentView}
            theme={theme}
          />

          {/* Main Grid: Table + Sidebar */}
          <div className="dashboard-layout">
            <main className="main-content">
              <InventoryTable
                items={items}
                search={search} setSearch={setSearch}
                category={category} setCategory={setCategory}
                sortBy={sortBy} setSortBy={setSortBy}
                onEdit={openEditModal}
                onDelete={handleDeleteItem}
                theme={theme}
              />
            </main>

            {/* Sidebar: Low Stock */}
            <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', height: '100%', overflow: 'hidden', minHeight: 0 }}>
              {/* Low Stock List - grows to fill */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <LowStockList items={lowStockItems} onQuickRestock={handleQuickRestock} theme={theme} />
              </div>
            </aside>
          </div>
        </>
      )}

      {/* Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />
    </div>
  );
}

export default App;
