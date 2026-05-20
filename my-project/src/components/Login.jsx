import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Key, Mail, User, ShieldAlert, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoImg from '../assets/logo.png';

function Login({ onLoginSuccess }) {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  // Dynamically load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // You can replace this dummy client ID with your actual Google Cloud Web Client ID
          client_id: '150494498308-dummyclientid12345.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { 
            theme: 'dark', 
            size: 'large', 
            width: '100%', 
            shape: 'rectangular',
            text: 'signin_with'
          }
        );
      }
    };
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Safe check if script was already unmounted
      }
    };
  }, [isLogin]);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic Form Validations
    if (!formData.email.trim()) return setError('Email address is required');
    if (!formData.password) return setError('Password is required');
    
    if (!isLogin) {
      if (!formData.name.trim()) return setError('Username is required');
      if (formData.password.length < 6) return setError('Password must be at least 6 characters');
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    }

    setLoading(true);
    const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/signup`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="panel" style={{ position: 'relative', width: '100%', maxWidth: '420px', padding: '2rem', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)' }}>
        

        {/* Header Ribbon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logoImg} alt="Grocify Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block' }} />
          <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit, sans-serif', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Grocify
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isLogin ? t('login.subtitle', 'Manage your grocery items inventory seamlessly') : 'Get started by setting up your manager account'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: 'hsla(223, 47%, 7%, 0.6)', padding: '0.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
          <button 
            type="button" 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ flex: 1, padding: '0.6rem', border: 'none', background: isLogin ? 'var(--color-primary)' : 'transparent', color: isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'var(--transition-smooth)' }}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button 
            type="button" 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ flex: 1, padding: '0.6rem', border: 'none', background: !isLogin ? 'var(--color-primary)' : 'transparent', color: !isLogin ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'var(--transition-smooth)' }}
          >
            <UserPlus size={14} />
            Register
          </button>
        </div>

        {/* Error Ribbon */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-critical-glow)', color: 'var(--color-critical)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--color-critical)', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {!isLogin && (
            <div className="form-field">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Manager Name" 
                  className="form-input" 
                  style={{ paddingLeft: '2.25rem' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@example.com" 
                className="form-input" 
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ margin: 0 }}>Password</label>
              {isLogin && (
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); alert("Forgot password functionality coming soon!"); }}>
                  Forgot Password?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                className="form-input" 
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-field">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="form-input" 
                  style={{ paddingLeft: '2.25rem' }}
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Manager Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or Continue With</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
        </div>

        {/* Google SSO Container */}
        <div style={{ minHeight: '44px' }}>
          <div id="google-signin-btn" style={{ width: '100%' }}></div>
        </div>

      </div>
    </div>
  );
}

export default Login;
