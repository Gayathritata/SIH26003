import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface Props {
  onNavigateLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await authService.forgotPassword(email);
      setSuccessMsg('Password reset instructions have been sent to your email address.');
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
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
          maxWidth: '460px',
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
          <h1 className="text-hero-title" style={{ fontSize: '26px' }}>Reset Password</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enter your registered email to receive reset instructions
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

        {successMsg && (
          <div
            style={{
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#15803D',
              fontSize: '14px',
            }}
          >
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Your Registered Email Address
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

          <button type="submit" className="btn-primary btn-emerald" disabled={loading} style={{ minHeight: '48px' }}>
            <Send size={18} /> {loading ? 'Sending Request...' : 'Send Password Reset Email'}
          </button>
        </form>
      </div>
    </div>
  );
};
