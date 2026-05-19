import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LowStockList({ items, onQuickRestock }) {
  const { t } = useTranslation();
  return (
    <div className="panel">
      <h3 className="panel-title" style={{ color: 'var(--color-primary)' }}>
        <AlertCircle size={18} />
        {t('lowStockList.title', 'Critical Stock Alerts')}
      </h3>
      
      {items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1.5rem 0' }}>
          ✅ {t('details.allClearTitle', 'All items are healthy. No alerts!')}
        </div>
      ) : (
        <div className="low-stock-list">
          {items.map((item) => (
            <div key={item.id} className="low-stock-item">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="low-stock-thumb"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='100%25' height='100%25' fill='%23F5F3FF'/><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' stroke='%235E13C2' stroke-width='1.5' fill='none'/></svg>";
                }}
              />
              <div className="low-stock-details">
                <div className="low-stock-name">{t(`products.${item.name}`, item.name)}</div>
                <div className="low-stock-meta">
                  <span>SKU: {item.sku}</span>
                  <span>Stock: <strong className="low-stock-badge">{item.stock}</strong> / {item.minStock}</span>
                </div>
              </div>
              
              <button 
                className="btn-icon edit" 
                title={t('lowStockList.quickRestock', 'Quick Restock (+10)')}
                onClick={() => onQuickRestock(item._id, 10)}
                style={{ color: 'var(--color-primary)', borderColor: 'rgba(94, 19, 194, 0.2)' }}
              >
                <RefreshCw size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStockList;
