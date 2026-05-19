import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Shield, Calendar, LogOut, X, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function ProfileDropdown({ user, onLogout, theme, onToggleTheme }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isDark = theme === 'dark';
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-main)',
  };
  const muted = 'var(--text-muted)';
  const rowBg = 'var(--bg-secondary)';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem 0.35rem 0.35rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glass)',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-glass)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #5E13C2, #380B75)',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem',
            fontFamily: 'Outfit, sans-serif', flexShrink: 0
          }}>
            {initials}
          </div>
        )}
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name?.split(' ')[0] || 'Manager'}
        </span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '280px', zIndex: 999,
          borderRadius: '16px',
          boxShadow: 'var(--shadow-premium)',
          animation: 'fadeIn 0.18s ease-out',
          overflow: 'hidden',
          ...card
        }}>
          {/* Header */}
          <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #5E13C2, #380B75)', position: 'relative' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} />
            </button>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '0.625rem' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{user?.name || 'Manager'}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.15rem' }}>Store Manager</div>
          </div>

          {/* Details */}
          <div style={{ padding: '0.875rem' }}>
            {[
              { icon: <Mail size={14} />, label: 'Email', value: user?.email || '—' },
              { icon: <Shield size={14} />, label: 'Role', value: 'Administrator' },
              { icon: <Calendar size={14} />, label: 'Member since', value: joinDate },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '8px', background: rowBg, marginBottom: '0.375rem' }}>
                <span style={{ color: '#5E13C2', flexShrink: 0 }}>{icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                </div>
              </div>
            ))}

            {/* Theme Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem', borderRadius: '8px', background: rowBg, marginBottom: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ color: '#5E13C2' }}>{isDark ? <Moon size={14} /> : <Sun size={14} />}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Theme</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</div>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={onToggleTheme}
                style={{
                  width: '42px', height: '22px',
                  borderRadius: '100px',
                  background: isDark ? '#5E13C2' : '#e5e7eb',
                  border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.25s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '3px',
                  left: isDark ? '23px' : '3px',
                  transition: 'left 0.25s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem', borderRadius: '8px', background: rowBg, marginBottom: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ color: '#5E13C2' }}><Globe size={14} /></span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('profile.language', 'Language')}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    <select
                      value={i18n.language}
                      onChange={(e) => i18n.changeLanguage(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: 0, appearance: 'none' }}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                      <option value="kn">ಕನ್ನಡ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: '100%', marginTop: '0.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.6rem', borderRadius: '8px',
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
                color: '#DC2626', fontWeight: 600, fontSize: '0.82rem',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.color = '#DC2626'; }}
            >
              <LogOut size={14} /> {t('profile.logout', 'Sign Out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
