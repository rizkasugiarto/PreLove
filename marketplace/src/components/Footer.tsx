import Link from 'next/link';
import { ShieldCheck, Camera, Hash, ShoppingBag, MessageCircle, Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0D0520 0%, #080112 100%)',
      borderTop: '1px solid rgba(139,92,246,0.15)',
      paddingTop: '64px',
      paddingBottom: '32px',
      marginTop: 'auto',
      color: 'rgba(255,255,255,0.65)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Brand + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(124,58,237,0.35)',
          }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '20px', color: 'white', letterSpacing: '-0.5px' }}>PreLove</span>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>Platform Preloved Terpercaya</p>
          </div>
        </div>

        {/* Grid Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Kolom 1: PreLove */}
          <div>
            <h3 style={{ fontWeight: 800, color: 'white', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PreLove
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Tentang PreLove', href: '/info/about' },
                { label: 'Hak Kekayaan Intelektual', href: '/info/hki' },
                { label: 'Karir', href: '/info/karir' },
                { label: 'Blog', href: '/info/blog' },
                { label: 'Dampak Lingkungan', href: '/info/sustainability' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                    transition: 'color 0.2s', fontWeight: 500,
                  }}
                  className="hover:text-purple-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 2: Bantuan */}
          <div>
            <h3 style={{ fontWeight: 800, color: 'white', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Bantuan
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'PreLove Care', href: '/info/care' },
                { label: 'Syarat dan Ketentuan', href: '/info/terms' },
                { label: 'Kebijakan Privasi', href: '/info/privacy' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                    transition: 'color 0.2s', fontWeight: 500,
                  }}
                  className="hover:text-purple-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Keamanan & Sosial */}
          <div>
            <h3 style={{ fontWeight: 800, color: 'white', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Keamanan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', width: 'fit-content',
              }}>
                <ShieldCheck size={16} color="#34D399" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.05em' }}>100% AMAN</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', width: 'fit-content',
              }}>
                <ShieldCheck size={16} color="#60A5FA" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.05em' }}>PCI DSS SECURE</span>
              </div>
            </div>

            <h3 style={{ fontWeight: 800, color: 'white', marginBottom: '14px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Ikuti Kami
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <Camera size={16} />, color: '#A855F7' },
                { icon: <MessageCircle size={16} />, color: '#3B82F6' },
                { icon: <Hash size={16} />, color: '#0EA5E9' },
                { icon: <Video size={16} />, color: '#EF4444' },
              ].map((s, i) => (
                <a key={i} href="#" style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s', textDecoration: 'none',
                }}
                className="hover:scale-110 hover:border-white/20 hover:text-white">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '24px' }} />

        {/* Bottom Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px',
          fontSize: '13px', color: 'rgba(255,255,255,0.35)',
        }}>
          <p style={{ margin: 0 }}>&copy; 2024–2026 PT. PreLove Indonesia. Hak cipta dilindungi.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }} className="hover:text-white transition-colors">Server Status</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }} className="hover:text-white transition-colors">Bug Bounty</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
