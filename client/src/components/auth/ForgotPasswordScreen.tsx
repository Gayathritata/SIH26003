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
        background: 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.1), transparent 60%), #070A12',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
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
          <h1 className="text-hero-title" style={{ fontSize: '28px' }}>Reset Password</h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '4px' }}>
            Firebase Auth Password Recovery
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

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#6EE7B7',
              fontSize: '15px',
            }}
          >
            <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              Your Registered Email Address
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

          <button type="submit" className="btn-primary btn-amber" disabled={loading} style={{ minHeight: '56px' }}>
            <Send size={20} /> {loading ? 'Sending Request...' : 'Send Password Reset Email'}
          </button>
        </form>
      </div>
    </div>
  );
};
