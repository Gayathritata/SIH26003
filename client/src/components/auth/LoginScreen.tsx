import React, { useState } from 'react';
import { Brain, LogIn, Key, Mail, AlertCircle, Play, Sparkles, UserCheck, Shield, Volume2 } from 'lucide-react';
import { UserProfile } from '../../services/authService';
import { translations, getTranslation, Language } from '../../i18n/translations';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess: (user: UserProfile) => void;
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  lang: Language;
}

export const LoginScreen: React.FC<Props> = ({ onSuccess, onNavigateRegister, onNavigateForgot, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
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
      const res = await login(demoEmail, 'MindMate@2026');
      onSuccess(res.user);
    } catch (err: any) {
      const fallbackUser: UserProfile = {
        email: role === 'caregiver' ? 'caregiver@demo.mindmate' : 'asha.devi@demo.mindmate',
        name: role === 'caregiver' ? 'Demo Caregiver' : 'Asha Devi',
        role: role as any,
        preferredLanguage: lang,
      };
      onSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08), transparent 60%), #070A12', color: '#FFFFFF' }}>
      
      {/* 1. TOP NAVBAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 36px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Branding & App Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Brain size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px', margin: 0 }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', margin: 0 }}>{t('tagline')}</p>
          </div>
        </div>

        {/* Right: Sign In Title & Register Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '15px', color: '#94A3B8', fontWeight: '600' }}>
            JWT Secure Portal
          </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '44px', padding: '0 20px', fontSize: '15px', fontWeight: '700' }}
          >
            Create Account
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN HERO & SIGN IN LAYOUT */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '40px 24px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* LEFT COLUMN: Title, Description & Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
              <span className="badge-pill badge-emerald" style={{ fontSize: '14px', padding: '8px 16px' }}>
                <Sparkles size={16} /> AI-Powered Cognitive Companion
              </span>
            </div>

            <h1 className="text-hero-title" style={{ fontSize: '38px', lineHeight: '1.2' }}>
              Cognitive Healthcare & Adaptive Care for North-East India
            </h1>

            <p style={{ fontSize: '17px', color: '#CBD5E1', lineHeight: '1.6', margin: 0 }}>
              MINDMATE NER empowers elderly users with adaptive cognitive games, regional language voice guidance (Assamese, Hindi, English), and provides real-time oversight dashboards for family caregivers.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                  <Brain size={20} /> Adaptive ML Engine
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>XGBoost dynamic difficulty scaling</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                  <Volume2 size={20} /> Multilingual Voice
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Assamese, Hindi & English guidance</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366F1', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                  <UserCheck size={20} /> Caregiver Portal
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Performance change alerts & trends</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#14B8A6', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                  <Shield size={20} /> JWT Auth Security
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Role isolation & session storage</p>
              </div>
            </div>

            {/* Quick Demo Selector */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#6EE7B7', display: 'block', marginBottom: '12px' }}>
                ⚡ FAST HACKATHON DEMO SELECTOR
              </span>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('elderly_user')}
                  className="btn-primary btn-emerald"
                  style={{ flex: 1, minHeight: '48px', fontSize: '15px' }}
                >
                  Elderly User (Asha Devi 👵)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('caregiver')}
                  className="btn-primary btn-glass-subtle"
                  style={{ flex: 1, minHeight: '48px', fontSize: '15px', border: '1px solid #10B981' }}
                >
                  Caregiver User (Demo 👨‍⚕️)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Video Showcase Preview + Sign In Form Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Video-Like Preview Element */}
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '2px solid rgba(16, 185, 129, 0.35)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(7, 10, 18, 0.95))',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Video Badge Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
                <span className="badge-pill badge-coral" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  🔴 LIVE DEMO PREVIEW
                </span>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>02:45 / 05:00</span>
              </div>

              {/* Video Player Center Overlay */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', margin: '20px 0', zIndex: 2 }}>
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
                    transition: 'all 0.3s ease',
                  }}
                  title={isPlayingVideo ? 'Pause Video' : 'Play Demo Video'}
                >
                  <Play size={28} color="#FFFFFF" style={{ marginLeft: isPlayingVideo ? 0 : '4px' }} />
                </button>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
                  {isPlayingVideo ? 'Playing MINDMATE NER Overview...' : 'Click to Watch Companion Overview'}
                </span>
              </div>

              {/* Simulated Audio Equalizer Waves */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '24px', zIndex: 2 }}>
                {[40, 70, 30, 90, 60, 80, 45, 100, 65, 35, 75, 50].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: isPlayingVideo ? `${h}%` : '20%',
                      background: '#10B981',
                      borderRadius: '2px',
                      transition: 'height 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sign In Form Card */}
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                borderRadius: '24px',
              }}
            >
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  Sign In to MINDMATE
                </h2>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                  Enter your email and password to access your dashboard
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FDA4AF',
                    fontSize: '14px',
                  }}
                >
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        height: '50px',
                        paddingLeft: '46px',
                        paddingRight: '16px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass-bright)',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        height: '50px',
                        paddingLeft: '46px',
                        paddingRight: '16px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass-bright)',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={onNavigateForgot}
                    style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '52px', marginTop: '4px', fontSize: '17px' }}>
                  <LogIn size={20} /> {loading ? 'Authenticating...' : 'Sign In with JWT'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>Don't have an account? </span>
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create New Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
