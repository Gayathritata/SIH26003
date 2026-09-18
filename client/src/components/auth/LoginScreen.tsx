import React, { useState } from 'react';
import { Brain, LogIn, Key, Mail, AlertCircle } from 'lucide-react';
import { authService, UserProfile } from '../../services/authService';
import { translations, getTranslation, Language } from '../../i18n/translations';

interface Props {
  onSuccess: (user: UserProfile) => void;
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  lang: Language;
}

export const LoginScreen: React.FC<Props> = ({ onSuccess, onNavigateRegister, onNavigateForgot, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'elderly_user' | 'caregiver' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = role === 'caregiver' ? 'caregiver@demo.mindmate' : (role === 'admin' ? 'admin@demo.mindmate' : 'asha.devi@demo.mindmate');
      const res = await authService.login(demoEmail, 'MindMate@2026');
      onSuccess(res.user);
    } catch (err: any) {
      // Fallback demo user profile for fast hackathon demo
      onSuccess({
        email: role === 'caregiver' ? 'caregiver@demo.mindmate' : 'asha.devi@demo.mindmate',
        name: role === 'caregiver' ? 'Demo Caregiver' : 'Asha Devi',
        role: role as any,
        preferredLanguage: lang,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.1), transparent 60%), #070A12',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* App Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Brain size={40} color="#FFFFFF" />
          </div>
          <h1 className="text-hero-title" style={{ fontSize: '30px' }}>{t('appTitle')}</h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '4px' }}>JWT Secure Authentication</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '14px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#FDA4AF',
              fontSize: '15px',
            }}
          >
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  height: '54px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass-bright)',
                  color: '#FFFFFF',
                  fontSize: '17px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '54px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass-bright)',
                  color: '#FFFFFF',
                  fontSize: '17px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onNavigateForgot}
              style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '56px', marginTop: '6px' }}>
            <LogIn size={22} /> {loading ? 'Authenticating...' : 'Sign In with JWT'}
          </button>
        </form>

        {/* Quick Demo Selector */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
            ⚡ DEMO QUICK LOGIN SELECTOR
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('elderly_user')}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '46px', fontSize: '15px' }}
            >
              Elderly User (Asha Devi 👵)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('caregiver')}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '46px', fontSize: '15px' }}
            >
              Caregiver User (Demo Caregiver 👨‍⚕️)
            </button>
          </div>
        </div>

        {/* Register Navigation Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '15px', color: '#94A3B8' }}>Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};
