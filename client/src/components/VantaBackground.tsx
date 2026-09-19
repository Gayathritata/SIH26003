import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export const VantaBackground: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let timer: any = null;

    const initVanta = () => {
      if (vantaRef.current && window.VANTA && window.VANTA.HALO && window.THREE) {
        try {
          if (!vantaEffectRef.current) {
            vantaEffectRef.current = window.VANTA.HALO({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              baseColor: 0x0284c7, // Calm medical blue
              backgroundColor: 0x0f172a, // Soft slate dark background
              amplitudeFactor: 0.8,
              size: 1.0,
            });
          }
        } catch (e) {
          console.warn('[VANTA HALO INIT NOTICE]', e);
        }
      }
    };

    if (window.VANTA && window.VANTA.HALO && window.THREE) {
      initVanta();
    } else {
      timer = setInterval(() => {
        if (window.VANTA && window.VANTA.HALO && window.THREE) {
          clearInterval(timer);
          timer = null;
          initVanta();
        }
      }, 150);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
        try {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        } catch (e) {
          // Ignore destruction notice
        }
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.85,
      }}
    />
  );
};
