'use client';

import { ShoppingBag } from 'lucide-react';

export default function LogoLoader({ text = "Memuat..." }: { text?: string }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)' 
    }}>
      <div style={{ position: 'relative' }}>
        {/* Pulsing glow background */}
        <div style={{
          position: 'absolute', inset: -20, background: 'linear-gradient(135deg, #D946EF, #A855F7)',
          filter: 'blur(32px)', opacity: 0.4, borderRadius: '50%', animation: 'pulse-glow 2s ease-in-out infinite'
        }} />
        
        {/* Bouncing Logo */}
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg, #D946EF, #A855F7)',
          border: '3px solid #111827', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '4px 4px 0 #111827',
          animation: 'bounce-logo 1.5s infinite cubic-bezier(0.28, 0.84, 0.42, 1)'
        }}>
          <ShoppingBag size={32} color="white" strokeWidth={2.5} />
        </div>
      </div>
      
      <h2 style={{ 
        marginTop: '32px', fontSize: '20px', fontWeight: 900, color: '#1E1B4B', 
        letterSpacing: '-0.02em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        PRELOVE<span style={{ color: '#D946EF', animation: 'blink 1.4s infinite both' }}>.</span>
      </h2>
      
      <p style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: '#6B7280', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        {text}
      </p>

      <style>{`
        @keyframes bounce-logo {
          0%, 100% { transform: translateY(0) rotate(-12deg) scale(1); }
          50% { transform: translateY(-20px) rotate(-5deg) scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
