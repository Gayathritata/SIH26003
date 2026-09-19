import React, { useState } from 'react';
import { Brain, LogIn, Key, Mail, AlertCircle, Play, Sparkles, UserCheck, Shield, Volume2, Quote, X, Video, ExternalLink } from 'lucide-react';
import { UserProfile } from '../../services/authService';
import { translations, getTranslation, Language } from '../../i18n/translations';
import { useAuth } from '../../context/AuthContext';
import { VantaBackground } from '../VantaBackground';

interface Props {
  onSuccess: (user: UserProfile) => void;
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  lang: Language;
}

export const LoginScreen: React.FC<Props> = ({ onSuccess, onNavigateRegister, onNavigateForgot, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const { login } = useAuth();
  
  // Modal & Auth State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video Link State (User can provide video link or test with a video)
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [inputVideoUrl, setInputVideoUrl] = useState<string>('');
  const [showVideoInput, setShowVideoInput] = useState(false);

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

  const handleApplyVideoUrl = () => {
    if (!inputVideoUrl.trim()) return;
    let formattedUrl = inputVideoUrl.trim();
    // Convert YouTube watch URL to embed URL if needed
    if (formattedUrl.includes('youtube.com/watch?v=')) {
      const videoId = formattedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (formattedUrl.includes('youtu.be/')) {
      const videoId = formattedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setVideoUrl(formattedUrl);
    setShowVideoInput(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08), transparent 60%), #070A12', color: '#FFFFFF' }}>
      {/* Vanta 3D NET Background Animation */}
      <VantaBackground color={0x473b3f} backgroundColor={0x070a12} />
      
      {/* 1. TOP NAVBAR WITH SIGN IN BUTTON */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 36px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 10, 18, 0.90)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Branding & Title */}
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

        {/* Right: Actions (Nav Sign In Button + Create Account) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 14px',
            }}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={() => setShowSignInModal(true)}
            className="btn-primary btn-emerald"
            style={{
              minHeight: '44px',
              padding: '0 24px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <LogIn size={18} /> Sign In
          </button>
        </div>
      </header>

      {/* 2. MAIN PAGE CONTENT (2 COLUMNS: LEFT TEXT & QUOTE, RIGHT VIDEO) */}
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
          {/* LEFT COLUMN: Title, Impressive Quotation, Highlights & Quick Demo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
              <span className="badge-pill badge-emerald" style={{ fontSize: '14px', padding: '8px 16px' }}>
                <Sparkles size={16} /> AI-Powered Cognitive Companion for North-East India
              </span>
            </div>

            <h1 className="text-hero-title" style={{ fontSize: '38px', lineHeight: '1.2' }}>
              Preserving Memories, Empowering Elders & Supporting Caregivers
            </h1>

            {/* IMPRESSIVE QUOTATION CARD */}
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                padding: '24px 28px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Quote size={32} color="#10B981" style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.3 }} />
              <blockquote
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontStyle: 'italic',
                  color: '#F1F5F9',
                  lineHeight: '1.6',
                  fontWeight: '500',
                }}
              >
                "Memory is the treasury and guardian of all human experience. In honoring and supporting the cognitive journey of our elders, we preserve the heartbeat of our heritage."
              </blockquote>
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '2px', background: '#10B981' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#6EE7B7', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  MindMate Cognitive Care Philosophy
                </span>
              </div>
            </div>

            <p style={{ fontSize: '16px', color: '#CBD5E1', lineHeight: '1.6', margin: 0 }}>
              MINDMATE NER provides adaptive cognitive exercises, multilingual voice guidance (Assamese, Hindi, English), and real-time clinical monitoring dashboards for family caregivers and doctors.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '14px 16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontWeight: '700', fontSize: '15px' }}>
                  <Brain size={18} /> Adaptive ML Engine
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>XGBoost dynamic difficulty scaling</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '14px 16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B', fontWeight: '700', fontSize: '15px' }}>
                  <Volume2 size={18} /> Multilingual Voice
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>Assamese, Hindi & English guidance</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '14px 16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366F1', fontWeight: '700', fontSize: '15px' }}>
                  <UserCheck size={18} /> Caregiver Portal
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>Performance change alerts & trends</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', padding: '14px 16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#14B8A6', fontWeight: '700', fontSize: '15px' }}>
                  <Shield size={18} /> JWT Auth Security
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>Role isolation & session storage</p>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '18px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#6EE7B7', letterSpacing: '0.5px' }}>
                  ⚡ QUICK DEMO ACCESS
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>No registration required</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('elderly_user')}
                  className="btn-primary btn-emerald"
                  style={{ flex: 1, minHeight: '44px', fontSize: '14px' }}
                >
                  Elderly User (Asha Devi 👵)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('caregiver')}
                  className="btn-primary btn-glass-subtle"
                  style={{ flex: 1, minHeight: '44px', fontSize: '14px', border: '1px solid #10B981' }}
                >
                  Caregiver Portal (Demo 👨‍⚕️)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: VIDEO PLAYER FRAME READY FOR USER'S VIDEO LINK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '2px solid rgba(16, 185, 129, 0.35)',
                background: '#0B0F19',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Video Player Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Video size={20} color="#10B981" />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
                    MindMate Video Presentation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVideoInput(!showVideoInput)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6EE7B7',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ExternalLink size={14} /> Update Video Link
                </button>
              </div>

              {/* Dynamic Video Link Input (Optional popup bar) */}
              {showVideoInput && (
                <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={inputVideoUrl}
                    onChange={(e) => setInputVideoUrl(e.target.value)}
                    placeholder="Paste YouTube or video embed URL..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFF',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVideoUrl}
                    className="btn-primary btn-emerald"
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Responsive Video Container (Aspect Ratio 16:9) */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000000' }}>
                {videoUrl ? (
                  <iframe
                    src={videoUrl}
                    title="MindMate Overview Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#94A3B8' }}>
                    <Play size={48} color="#10B981" />
                    <p style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Provide your video link above</p>
                  </div>
                )}
              </div>

              {/* Video Footer Caption */}
              <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '500' }}>
                    MindMate Platform Overview & Demo Video
                  </span>
                </div>
                <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  HD Video Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. SIGN IN MODAL (TRIGGERED BY NAVBAR SIGN IN BUTTON) */}
      {showSignInModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              padding: '32px',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(7, 10, 18, 0.98))',
            }}
          >
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setShowSignInModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94A3B8',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Brain size={30} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Sign In to MINDMATE
              </h2>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '6px' }}>
                Access your cognitive health & caregiving dashboard
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
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
                  onClick={() => {
                    setShowSignInModal(false);
                    onNavigateForgot();
                  }}
                  style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '52px', marginTop: '4px', fontSize: '16px' }}>
                <LogIn size={20} /> {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setShowSignInModal(false);
                  onNavigateRegister();
                }}
                style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

