import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

// Generate simulated weekly data (last 7 days)
function generateWeeklyData(items) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalValue = items.reduce((s, i) => s + i.price * i.stock, 0);
  const base = totalValue / 7;
  return days.map((day, idx) => {
    const variance = (Math.random() - 0.45) * base * 0.3;
    const revenue = Math.max(0, base + variance);
    const cost = revenue * (0.6 + Math.random() * 0.1);
    return { day, revenue: +revenue.toFixed(0), cost: +cost.toFixed(0), profit: +(revenue - cost).toFixed(0) };
  });
}

// Monthly - last 12 months
function generateMonthlyData(items) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const totalValue = items.reduce((s, i) => s + i.price * i.stock, 0);
  const base = totalValue / 5;
  return months.map((month) => {
    const revenue = Math.max(0, base + (Math.random() - 0.4) * base * 0.4);
    const cost = revenue * (0.55 + Math.random() * 0.15);
    return { day: month, revenue: +revenue.toFixed(0), cost: +cost.toFixed(0), profit: +(revenue - cost).toFixed(0) };
  });
}

// Yearly - last 5 years
function generateYearlyData(items) {
  const currentYear = new Date().getFullYear();
  const totalValue = items.reduce((s, i) => s + i.price * i.stock, 0);
  const base = totalValue * 1.2;
  return [0, 1, 2, 3, 4].map((offset) => {
    const growth = 1 + offset * 0.08;
    const revenue = Math.max(0, base * growth + (Math.random() - 0.3) * base * 0.2);
    const cost = revenue * (0.58 + Math.random() * 0.08);
    return { day: String(currentYear - 4 + offset), revenue: +revenue.toFixed(0), cost: +cost.toFixed(0), profit: +(revenue - cost).toFixed(0) };
  });
}

const PERIODS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const bg = 'var(--bg-card)';
  const border = 'var(--border-glass)';
  const textColor = 'var(--text-main)';
  const muted = 'var(--text-muted)';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '0.625rem 0.875rem', boxShadow: 'var(--shadow-premium)', minWidth: '140px' }}>
      <div style={{ fontSize: '0.72rem', color: muted, fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.75rem', color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontSize: '0.75rem', color: textColor, fontWeight: 700 }}>₹{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function AnalyticsChart({ items, theme }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('week');
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    if (!items.length) return [];
    if (period === 'week') return generateWeeklyData(items);
    if (period === 'month') return generateMonthlyData(items);
    return generateYearlyData(items);
  }, [items, period]);

  // Colors
  const gridColor = 'var(--border-glass)';
  const axisColor = isDark ? '#475569' : '#D4C4B0';
  const textColor = 'var(--text-muted)';
  const cardBg = 'var(--bg-card)';
  const cardBorder = 'var(--border-glass)';

  return (
    <div style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexShrink: 0 }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif' }}>📊 {t('analytics.title', 'Revenue Analytics')}</h3>
          <p style={{ fontSize: '0.7rem', color: textColor, marginTop: '0.1rem' }}>{t('analytics.subtitle', 'Revenue, cost & profit trends')}</p>
        </div>
        {/* Period Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
              padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
              background: period === p.key ? '#5E13C2' : 'transparent',
              color: period === p.key ? '#fff' : textColor,
              transition: 'all 0.2s'
            }}>
              {t(`analytics.${p.key}`, p.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E13C2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5E13C2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: textColor }} axisLine={{ stroke: axisColor }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Legend wrapperStyle={{ fontSize: '0.72rem', color: textColor, paddingTop: '0.5rem' }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#5E13C2" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#5E13C2', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="cost" name="Cost" stroke="#94a3b8" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsChart;
