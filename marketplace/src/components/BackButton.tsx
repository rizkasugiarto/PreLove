'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'Kembali', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 20px 0 6px',
        height: '44px',
        background: 'white',
        border: '1.5px solid rgba(124,58,237,0.12)',
        borderRadius: '999px',
        cursor: 'pointer',
        color: '#374151',
        fontSize: '14px',
        fontWeight: 700,
        marginBottom: '28px',
        boxShadow: '0 2px 12px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.boxShadow = '0 4px 20px rgba(124,58,237,0.18), 0 2px 6px rgba(0,0,0,0.06)';
        el.style.borderColor = 'rgba(124,58,237,0.35)';
        el.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.boxShadow = '0 2px 12px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.06)';
        el.style.borderColor = 'rgba(124,58,237,0.12)';
        el.style.transform = 'translateX(0)';
      }}
    >
      {/* Icon circle */}
      <span style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ArrowLeft size={15} color="#7C3AED" />
      </span>
      <span style={{ color: '#374151' }}>{label}</span>
    </button>
  );
}
