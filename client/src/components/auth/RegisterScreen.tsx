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
  const [role, setRole] = useState<'elderly_user' | 'caregiver'>('elderly_user');
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
        background: 'var(--bg-dark)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '36px',
          background: '#FFFFFF',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-hover)',
          borderRadius: '20px',
        }}
      >
        <button
          onClick={onNavigateLogin}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="text-hero-title" style={{ fontSize: '26px' }}>Create New Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Register for MINDMATE Cognitive Assistance Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FFE4E6',
              border: '1px solid #FECDD3',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#BE123C',
              fontSize: '14px',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Role Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Select User Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { key: 'elderly_user', label: 'Patient / Elderly 👵' },
                { key: 'caregiver', label: 'Caregiver 👨‍⚕️' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key as any)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: role === r.key ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: role === r.key ? 'var(--accent-primary-glow)' : '#F8FAFC',
                    color: role === r.key ? 'var(--accent-primary)' : 'var(--text-primary)',
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Asha Devi"
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asha.devi@example.com"
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Password (6+ characters)
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

          <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '50px', marginTop: '6px' }}>
            <UserCheck size={20} /> {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Already registered? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
          >
            Sign In 
          </button>
        </div>
      </div>
    </div>
  );
};
