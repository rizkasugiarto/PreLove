'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Search, Store, User, LogOut, Package, Heart, ChevronDown, Bell, Menu, X, MessageCircle, ShoppingBag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => { if (user) fetchCartCount(); }, [user]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const fetchCartCount = async () => {
    const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user!.id);
    setCartCount(count || 0);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileSearchOpen(false); }
  };

  if (isAuthPage) return null;

  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
    borderBottom: scrolled ? '1px solid rgba(237,233,254,0.8)' : '1px solid rgba(237,233,254,0.4)',
    boxShadow: scrolled ? '0 4px 24px rgba(139,92,246,0.08)' : 'none',
  };

  return (
    <header style={navStyle}>
      {/* ══════ ROW 1: Main Nav Bar ══════ */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px', justifyContent: 'space-between', width: '100%' }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
            className="group">
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #D946EF, #A855F7)',
              border: '2.5px solid #111827',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(-12deg)',
              boxShadow: '3px 3px 0 #111827',
              transition: 'all 0.2s',
            }}
              className="group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-hover:shadow-none"
            >
              <ShoppingBag size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontWeight: 900, fontSize: '20px', color: '#1E1B4B',
              letterSpacing: '-0.05em', textTransform: 'uppercase',
              display: 'none',
            }} className="sm:inline">
              PRELOVE<span style={{ color: '#D946EF', fontSize: '24px' }}>.</span>
            </span>
          </Link>

          {/* ── Search Bar Desktop ── */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '520px' }} className="hidden sm:block">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari barang preloved..."
                style={{
                  width: '100%', height: '42px',
                  paddingLeft: '44px', paddingRight: '72px',
                  borderRadius: '12px',
                  border: '1.5px solid #E8E5F0',
                  background: '#F8F7FF',
                  fontSize: '14px', fontWeight: 500,
                  color: '#1E1B4B', outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#8B5CF6';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#E8E5F0';
                  e.target.style.background = '#F8F7FF';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button type="submit" style={{
                position: 'absolute', right: '6px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#fff', fontWeight: 700, fontSize: '12px',
                border: 'none', borderRadius: '8px',
                padding: '5px 14px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                Cari
              </button>
            </div>
          </form>

          {/* ── Nav Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* Mobile search */}
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              style={iconBtnStyle} className="sm:hidden">
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {user ? (
              <>
                <NavIconLink href="/wishlist" className="hidden md:flex"><Heart size={20} /></NavIconLink>
                <NavIconLink href="/chat" className="hidden md:flex"><MessageCircle size={20} /></NavIconLink>
                <NavIconLink href="/notifications"><Bell size={20} /></NavIconLink>
                <NavIconLink href="/cart">
                  <div style={{ position: 'relative' }}>
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: 'linear-gradient(135deg,#EF4444,#DC2626)',
                        color: '#fff', fontSize: '10px', fontWeight: 800,
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                      }}>
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                </NavIconLink>

                <div style={{ width: '1px', height: '24px', background: '#E8E5F0', margin: '0 4px' }} className="hidden sm:block" />

                {/* User Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 10px', borderRadius: '12px',
                      border: 'none', background: 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F5F3FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '13px', fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                    }}>
                      {(profile?.full_name ?? profile?.username ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block" style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile?.full_name ?? profile?.username ?? 'Akun'}
                    </span>
                    <ChevronDown size={14} color="#9CA3AF" className="hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: '220px',
                      background: 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(237,233,254,0.9)',
                      boxShadow: '0 20px 60px rgba(139,92,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                      padding: '6px 0',
                      zIndex: 100,
                    }}>
                      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #F3F4F6' }}>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px' }}>Masuk sebagai</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile?.full_name ?? user.email}
                        </p>
                      </div>
                      <DDItem href="/orders" icon={<Package size={16} />} label="Pesanan Saya" close={() => setDropdownOpen(false)} />
                      <DDItem href="/wishlist" icon={<Heart size={16} />} label="Wishlist" close={() => setDropdownOpen(false)} />
                      {profile?.store
                        ? <DDItem href="/seller/dashboard" icon={<Store size={16} />} label="Toko Saya" close={() => setDropdownOpen(false)} />
                        : <DDItem href="/seller/open-store" icon={<Store size={16} />} label="Buka Toko" close={() => setDropdownOpen(false)} />
                      }
                      <DDItem href="/profile" icon={<User size={16} />} label="Edit Profil" close={() => setDropdownOpen(false)} />
                      <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '4px', paddingTop: '4px' }}>
                        <button onClick={() => { signOut(); setDropdownOpen(false); router.push('/'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#EF4444', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <LogOut size={16} /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href="/auth/login" style={{
                  fontSize: '14px', fontWeight: 600, color: '#7C3AED',
                  padding: '8px 16px', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EDE9FE')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Masuk
                </Link>
                <Link href="/auth/register" style={{
                  fontSize: '14px', fontWeight: 700, color: '#fff',
                  padding: '8px 18px', borderRadius: '10px',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                  transition: 'all 0.2s',
                }}>
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Search ── */}
      {mobileSearchOpen && (
        <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #EDE9FE', padding: '12px 16px' }} className="sm:hidden">
          <form onSubmit={handleSearch}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari barang preloved..." autoFocus
                style={{
                  width: '100%', height: '44px', paddingLeft: '44px', paddingRight: '16px',
                  borderRadius: '12px', border: '1.5px solid #8B5CF6',
                  background: '#fff', fontSize: '14px', outline: 'none',
                }}
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '38px', height: '38px', borderRadius: '10px',
  border: 'none', background: 'transparent',
  color: '#4C4580', cursor: 'pointer',
  transition: 'all 0.2s', position: 'relative',
};

function NavIconLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={className}
      style={{ ...iconBtnStyle, textDecoration: 'none', display: 'flex' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FE'; (e.currentTarget as HTMLElement).style.color = '#7C3AED'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#4C4580'; }}
    >
      {children}
    </Link>
  );
}

function DDItem({ href, icon, label, close }: { href: string; icon: React.ReactNode; label: string; close: () => void }) {
  return (
    <Link href={href} onClick={close}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: 500, color: '#374151', transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; (e.currentTarget as HTMLElement).style.color = '#7C3AED'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
    >
      <span style={{ color: '#9CA3AF', display: 'flex' }}>{icon}</span>
      {label}
    </Link>
  );
}
