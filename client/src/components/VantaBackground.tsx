import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

interface VantaBackgroundProps {
  color?: number;
  backgroundColor?: number;
  points?: number;
  maxDistance?: number;
  spacing?: number;
}

export const VantaBackground: React.FC<VantaBackgroundProps> = ({
  color = 0x10B981,
  backgroundColor = 0x060913,
  points = 12.00,
  maxDistance = 24.00,
  spacing = 16.00,
}) => {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any = null;

    const initVanta = () => {
      if (vantaRef.current && window.VANTA && window.VANTA.NET) {
        try {
          vantaEffect = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: color,
            backgroundColor: backgroundColor,
            points: points,
            maxDistance: maxDistance,
            spacing: spacing,
          });
        } catch (e) {
          console.warn('[VANTA INIT WARNING]', e);
        }
      }
    };

    // If script is already loaded
    if (window.VANTA && window.VANTA.NET) {
      initVanta();
    } else {
      // Retry initializing after scripts load
      const timer = setInterval(() => {
        if (window.VANTA && window.VANTA.NET) {
          clearInterval(timer);
          initVanta();
        }
      }, 200);

      return () => {
        clearInterval(timer);
        if (vantaEffect && typeof vantaEffect.destroy === 'function') {
          vantaEffect.destroy();
        }
      };
    }

    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === 'function') {
        vantaEffect.destroy();
      }
    };
  }, [color, backgroundColor, points, maxDistance, spacing]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.3,
      }}
    />
  );
};
