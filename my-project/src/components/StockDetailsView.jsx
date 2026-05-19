import React from 'react';
import { ArrowLeft, Edit2, AlertCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VIEW_CONFIG = {
  'low-stock': {
    title: 'Low Stock Alerts',
    icon: '⚠️',
    accentColor: 'var(--color-warning)',
    accentGlow: 'rgba(217, 119, 6, 0.08)',
    accentBorder: 'rgba(217, 119, 6, 0.2)',
  },
  'out-of-stock': {
    title: 'Out of Stock Items',
    icon: '❌',
    accentColor: 'var(--color-critical)',
    accentGlow: 'rgba(220, 38, 38, 0.06)',
    accentBorder: 'rgba(220, 38, 38, 0.2)',
  },
  'expiring': {
    title: 'Expiring Soon',
    icon: '🕐',
    accentColor: 'var(--color-expiry)',
    accentGlow: 'rgba(124, 58, 237, 0.06)',
    accentBorder: 'rgba(124, 58, 237, 0.2)',
  },
  'unique-items': {
    title: 'Unique Items List',
    icon: '📦',
    accentColor: 'var(--color-accent)',
    accentGlow: 'rgba(139, 92, 246, 0.06)',
    accentBorder: 'rgba(139, 92, 246, 0.2)',
  }
};

function StockDetailsView({ type, items, onBack, onEdit, onDelete }) {
  const { t } = useTranslation();
  const config = VIEW_CONFIG[type] || VIEW_CONFIG['low-stock'];
  const { title, icon, accentColor, accentGlow, accentBorder } = config;

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0, animation: 'fadeIn 0.25s ease-out' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            flexShrink: 0,
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
          <ArrowLeft size={14} />
          {t('details.back', 'Back')}
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.2 }}>
            <span>{icon}</span> {t(`stats.${type === 'low-stock' ? 'lowStock' : type === 'out-of-stock' ? 'outOfStock' : type === 'expiring' ? 'expiringSoon' : 'uniqueItems'}`, title)}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
            {type === 'unique-items' ? t('details.productsTotal', { count: items.length }) : t('details.productsRequire', { count: items.length })}
          </p>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div style={{ padding: '3rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', textAlign: 'center', flex: 1 }}>
          <AlertCircle size={40} style={{ color: 'var(--color-primary)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>{t('details.allClearTitle', 'All Clear!')}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.875rem' }}>
            {t('details.allClearSub', 'No products currently fit this status. Keep up the great work!')}
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colProduct', 'Product')}</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colCategory', 'Category')}</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colSku', 'SKU')}</th>
                  {type === 'expiring' ? (
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colExpiry', 'Expiry Date')}</th>
                  ) : (
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colStock', 'Stock Level')}</th>
                  )}
                  <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('details.colActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stockPercent = Math.min(100, Math.max(0, (item.stock / (item.minStock || 5)) * 100));
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Product */}
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-glass)', flexShrink: 0 }}
                            onError={(e) => { e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='100%25' height='100%25' fill='%23F5F3FF'/><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' stroke='%235E13C2' stroke-width='1.5' fill='none'/></svg>"; }}
                          />
                          <div style={{ marginLeft: '1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t(`products.${item.name}`, item.name)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              ₹{item.price?.toFixed(2) || '0.00'} / {item.unit}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ padding: '0.25rem 0.6rem', background: accentGlow, border: `1px solid ${accentBorder}`, borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, color: accentColor }}>
                          {t(`categories.${item.category}`, item.category)}
                        </span>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '0.7rem 0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {item.sku}
                      </td>

                      {/* Stock Level OR Expiry Date */}
                      <td style={{ padding: '0.7rem 0.875rem', textAlign: 'center' }}>
                        {type === 'expiring' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                            <span style={{ fontWeight: 700, color: daysLeft !== null && daysLeft <= 0 ? 'var(--color-critical)' : daysLeft !== null && daysLeft <= 3 ? 'var(--color-warning)' : accentColor, fontSize: '0.85rem' }}>
                              {formatExpiryDate(item.expiryDate)}
                            </span>
                            {daysLeft !== null && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: accentGlow, padding: '0.1rem 0.4rem', borderRadius: '100px', border: `1px solid ${accentBorder}` }}>
                                {daysLeft <= 0 ? t('details.expired', 'Expired') : t('details.daysLeft', { days: daysLeft })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontWeight: 700, color: accentColor, fontSize: '0.85rem' }}>
                              {item.stock} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.72rem' }}>/ {item.minStock} {t('details.min', 'min')}</span>
                            </span>
                            <div style={{ width: '70px', height: '4px', background: 'rgba(94, 19, 194, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${stockPercent}%`, height: '100%', background: accentColor, borderRadius: '10px' }} />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.7rem 0.875rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => onEdit(item)}
                            title="Edit"
                            style={{ width: '30px', height: '30px', background: 'rgba(94, 19, 194, 0.06)', border: '1px solid rgba(94, 19, 194, 0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(94, 19, 194, 0.06)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => { if (window.confirm(t('details.deleteConfirm', { name: item.name }))) onDelete(item._id); }}
                            title="Delete"
                            style={{ width: '30px', height: '30px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--color-critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-critical)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.color = 'var(--color-critical)'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetailsView;
