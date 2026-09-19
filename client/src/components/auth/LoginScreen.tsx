import React, { useState } from 'react';
import { Brain, LogIn, Key, Mail, AlertCircle, Play, Sparkles, UserCheck, Shield, Volume2, Quote, X, Video, ExternalLink } from 'lucide-react';
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

  // Modal & Auth State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video Link State
  const [videoUrl, setVideoUrl] = useState<string>('/Video.mp4');
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
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
      {/* 1. TOP NAVBAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border-glass)',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7, #0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
            }}
          >
            <Brain size={24} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', margin: 0 }}>{t('tagline')}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
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
              minHeight: '42px',
              padding: '0 20px',
              fontSize: '15px',
              borderRadius: '10px',
            }}
          >
            <LogIn size={17} /> Sign In
          </button>
        </div>
      </header>

      {/* 2. MAIN LANDING CONTENT */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '40px 24px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* LEFT COLUMN: Philosophy & Quick Demo Access */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
              <span className="badge-pill badge-emerald" style={{ fontSize: '13px', padding: '6px 14px' }}>
                <Sparkles size={15} /> AI Cognitive Care for North-East India
              </span>
            </div>

            <h1 className="text-hero-title" style={{ fontSize: '36px', lineHeight: '1.2' }}>
              Preserving Memories, Empowering Elders & Supporting Caregivers
            </h1>

            {/* QUOTATION CARD */}
            <div
              style={{
                position: 'relative',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <Quote size={28} color="#16A34A" style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.25 }} />
              <blockquote
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontStyle: 'italic',
                  color: '#14532D',
                  lineHeight: '1.6',
                  fontWeight: '500',
                }}
              >
                "Memory is the treasury and guardian of all human experience. In honoring and supporting the cognitive journey of our elders, we preserve the heartbeat of our heritage."
              </blockquote>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '2px', background: '#16A34A' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#15803D', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  MindMate Cognitive Care Philosophy
                </span>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.5px' }}>
                  ⚡ QUICK DEMO ACCESS
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No password required</span>
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
                  style={{ flex: 1, minHeight: '44px', fontSize: '14px', border: '1px solid var(--border-glass)' }}
                >
                  Caregiver Portal (Demo 👨‍⚕️)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: VIDEO PLAYER FRAME */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                padding: 0,
                border: '1px solid var(--border-glass)',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-hover)',
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
                  background: '#F8FAFC',
                  borderBottom: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="var(--accent-primary)" />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    MindMate Video Presentation
                  </span>
                </div>
        
              </div>

              {/* Dynamic Video Link Input */}
              {showVideoInput && (
                <div style={{ padding: '12px 16px', background: '#F0FDF4', borderBottom: '1px solid #DCFCE7', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={inputVideoUrl}
                    onChange={(e) => setInputVideoUrl(e.target.value)}
                    placeholder="Paste YouTube or video embed URL..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVideoUrl}
                    className="btn-primary btn-emerald"
                    style={{ padding: '8px 14px', fontSize: '13px', minHeight: '36px' }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Responsive Video Container */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0F172A' }}>
                {videoUrl ? (
                  videoUrl.endsWith('.mp4') || videoUrl.startsWith('/') || videoUrl.includes('blob:') ? (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
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
                  )
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#94A3B8' }}>
                    <Play size={44} color="#0284C7" />
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Provide your video link above</p>
                  </div>
                )}
              </div>

              {/* Video Footer Caption */}
              <div style={{ padding: '14px 20px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    MindMate Platform Overview Video
                  </span>
                </div>
                <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  HD Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. SIGN IN MODAL */}
      {showSignInModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
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
              border: '1px solid var(--border-glass)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              borderRadius: '20px',
              background: '#FFFFFF',
            }}
          >
            {/* Close Modal */}
            <button
              type="button"
              onClick={() => setShowSignInModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                color: 'var(--text-muted)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Brain size={28} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Sign In to MINDMATE
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Access your cognitive health & caregiver dashboard
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#FFE4E6',
                  border: '1px solid #FECDD3',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#BE123C',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '42px',
                      paddingRight: '14px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '42px',
                      paddingRight: '14px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
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
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '48px', marginTop: '4px', fontSize: '15px' }}>
                <LogIn size={18} /> {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '18px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setShowSignInModal(false);
                  onNavigateRegister();
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
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
