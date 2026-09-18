import React from 'react';
import { Brain, RefreshCw } from 'lucide-react';

export const SplashLoadingScreen: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#070A12',
        color: '#FFFFFF',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
          marginBottom: '24px',
        }}
      >
        <Brain size={52} color="#FFFFFF" />
      </div>

      <h1 className="text-hero-title" style={{ fontSize: '36px' }}>MINDMATE NER</h1>
      <p style={{ fontSize: '18px', color: '#94A3B8', marginTop: '8px' }}>
        AI-Powered Cognitive Companion for Elderly Care
      </p>

      <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <RefreshCw size={24} className="pulse-mic" color="#10B981" />
        <span style={{ fontSize: '16px', color: '#6EE7B7', fontWeight: '600' }}>
          Verifying Secure Firebase Session...
        </span>
      </div>
    </div>
  );
};
