import React, { useState } from 'react';
import { User, Mail, Key, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../services/authService';
import { translations, getTranslation, Language } from '../../i18n/translations';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess: (user: UserProfile) => void;
  onNavigateLogin: () => void;
  lang: Language;
}

export const RegisterScreen: React.FC<Props> = ({ onSuccess, onNavigateLogin, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'elderly_user' | 'caregiver' | 'admin'>('elderly_user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await register({
        email,
        pass: password,
        name,
        role,
        language: lang,
      });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
        background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.1), transparent 60%), #070A12',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px',
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <button
          onClick={onNavigateLogin}
          style={{ background: 'none', border: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', marginBottom: '16px' }}
        >
          <ArrowLeft size={18} /> Back to Sign In
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="text-hero-title" style={{ fontSize: '28px' }}>Create New Account</h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '4px' }}>
            JWT Authentication & MongoDB User Registration
          </p>
        </div>

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

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Role Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px' }}>
              Select User Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { key: 'elderly_user', label: 'Elderly 👵' },
                { key: 'caregiver', label: 'Caregiver 👨‍⚕️' },
                { key: 'admin', label: 'Admin ⚙️' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key as any)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '14px',
                    border: role === r.key ? '2px solid #10B981' : '1px solid var(--border-glass)',
                    background: role === r.key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Asha Devi"
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
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asha.devi@example.com"
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
              Password (6+ characters)
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

          <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '56px', marginTop: '10px' }}>
            <UserCheck size={22} /> {loading ? 'Registering...' : 'Register Account with JWT'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '15px', color: '#94A3B8' }}>Already registered? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
