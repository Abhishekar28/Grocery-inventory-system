import React from 'react';
import { DollarSign, Package, AlertTriangle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
function StatClickCard({ onClick, borderColor, hoverBorderColor, hoverShadow, iconClass, icon, label, value, subtext, arrowColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        boxShadow: 'var(--shadow-card)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.border = `1px solid ${hoverBorderColor}`;
        e.currentTarget.style.boxShadow = hoverShadow;
        const arrow = e.currentTarget.querySelector('.card-arrow');
        if (arrow) arrow.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.border = `1px solid ${borderColor}`;
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        const arrow = e.currentTarget.querySelector('.card-arrow');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
    >
      <div className={`stat-icon ${iconClass}`} style={{ flexShrink: 0 }}>
        {icon}
      </div>
      <div className="stat-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {label}
          <ArrowRight size={10} className="card-arrow" style={{ transition: 'transform 0.2s', color: arrowColor, flexShrink: 0 }} />
        </span>
        <span className="stat-value" style={{ color: arrowColor, fontSize: '1.4rem' }}>{value}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtext}</span>
      </div>
    </button>
  );
}

function DashboardStats({ stats, items, expiringCount, onViewChange, theme }) {
  const { t } = useTranslation();
  const { totalItems = 0, totalValue = 0, lowStockCount = 0, outOfStockCount = 0 } = stats;

  return (
    <div className="stats-grid">
      {/* Total Value */}
      <StatClickCard
        onClick={() => onViewChange('total-value')}
        borderColor="var(--border-glass)"
        hoverBorderColor="var(--color-primary)"
        hoverShadow="0 6px 20px rgba(94, 19, 194, 0.12)"
        iconClass="primary"
        icon={<span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹</span>}
        label={t('stats.totalValue', 'Total Value')}
        value={`₹${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtext={t('stats.viewAnalytics', 'Click to view analytics →')}
        arrowColor="var(--color-primary)"
      />

      {/* Unique Items */}
      <StatClickCard
        onClick={() => onViewChange('unique-items')}
        borderColor="var(--border-glass)"
        hoverBorderColor="var(--color-accent)"
        hoverShadow="0 6px 20px rgba(139, 92, 246, 0.12)"
        iconClass="accent"
        icon={<Package size={20} />}
        label={t('stats.uniqueItems', 'Unique Items')}
        value={totalItems}
        subtext={t('stats.viewItems', 'Click to view items →')}
        arrowColor="var(--color-accent)"
      />

      {/* Low Stock */}
      <StatClickCard
        onClick={() => onViewChange('low-stock')}
        borderColor="rgba(217, 119, 6, 0.15)"
        hoverBorderColor="rgba(217, 119, 6, 0.4)"
        hoverShadow="0 6px 20px rgba(217, 119, 6, 0.12)"
        iconClass="warning"
        icon={<AlertTriangle size={20} />}
        label={t('stats.lowStock', 'Low Stock')}
        value={lowStockCount}
        subtext={t('stats.viewAlerts', 'Click to view alerts →')}
        arrowColor="var(--color-warning)"
      />

      {/* Out of Stock */}
      <StatClickCard
        onClick={() => onViewChange('out-of-stock')}
        borderColor="rgba(220, 38, 38, 0.15)"
        hoverBorderColor="rgba(220, 38, 38, 0.4)"
        hoverShadow="0 6px 20px rgba(220, 38, 38, 0.1)"
        iconClass="critical"
        icon={<XCircle size={20} />}
        label={t('stats.outOfStock', 'Out of Stock')}
        value={outOfStockCount}
        subtext={t('stats.viewItems', 'Click to view items →')}
        arrowColor="var(--color-critical)"
      />

      {/* Expiring Soon */}
      <StatClickCard
        onClick={() => onViewChange('expiring')}
        borderColor="rgba(124, 58, 237, 0.15)"
        hoverBorderColor="rgba(124, 58, 237, 0.4)"
        hoverShadow="0 6px 20px rgba(124, 58, 237, 0.1)"
        iconClass="expiry"
        icon={<Clock size={20} />}
        label={t('stats.expiringSoon', 'Expiring Soon')}
        value={expiringCount}
        subtext={t('stats.viewItems', 'Click to view items →')}
        arrowColor="var(--color-expiry)"
      />
    </div>
  );
}

export default DashboardStats;
