import Link from 'next/link';
import { Store, ShieldCheck, Heart, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative pt-24 pb-8 mt-auto overflow-hidden">
      {/* Background Aurora for Footer */}
      <div className="absolute inset-0 bg-[#0F0C29] z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          
          {/* Brand Card - Spans 4 cols */}
          <div className="md:col-span-4 glass-panel-dark bento-card p-8 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3 group mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)' }}>
                  <span className="text-white font-black text-sm">PL</span>
                </div>
                <span className="font-black text-2xl text-white tracking-tight">
                  PreLove.
                </span>
              </Link>
              <p className="text-sm text-purple-200/70 leading-relaxed font-medium">
                Platform marketplace barang preloved nomor 1 untuk mahasiswa. Temukan barang berkualitas dengan harga terjangkau dan dukung gerakan ramah lingkungan.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-black/20">📸</div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-black/20">🐦</div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-black/20">💬</div>
            </div>
          </div>

          {/* Links Container - Spans 8 cols */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* About Card */}
            <div className="glass-panel-dark bento-card p-6 lg:p-8">
              <h3 className="font-black text-base text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> PreLove
              </h3>
              <ul className="space-y-3.5">
                <li><Link href="/about" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Tentang Kami</Link></li>
                <li><Link href="/careers" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Karir</Link></li>
                <li><Link href="/blog" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Blog & Komunitas</Link></li>
                <li><Link href="/sustainability" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Dampak Lingkungan</Link></li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="glass-panel-dark bento-card p-6 lg:p-8">
              <h3 className="font-black text-base text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" /> Bantuan
              </h3>
              <ul className="space-y-3.5">
                <li><Link href="/faq" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> FAQ</Link></li>
                <li><Link href="/terms" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Syarat Ketentuan</Link></li>
                <li><Link href="/privacy" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Kebijakan Privasi</Link></li>
                <li><Link href="/safety" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Pusat Keamanan</Link></li>
              </ul>
            </div>

            {/* Seller Card */}
            <div className="glass-panel-dark bento-card p-6 lg:p-8">
              <h3 className="font-black text-base text-white mb-6 flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-400" /> Penjual
              </h3>
              <ul className="space-y-3.5 mb-6">
                <li><Link href="/seller/open-store" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Buka Toko Gratis</Link></li>
                <li><Link href="/seller/dashboard" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Seller Dashboard</Link></li>
                <li><Link href="/seller/tips" className="text-sm font-medium text-purple-200/60 hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-purple-500/0 group-hover:bg-purple-400 transition-colors" /> Tips Jualan</Link></li>
              </ul>
              
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <p className="text-[11px] text-emerald-100/90 leading-tight font-medium">Transaksi aman terverifikasi mahasiswa</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5">
          <p className="text-sm font-medium text-purple-200/40">
            &copy; {new Date().getFullYear()} PreLove Marketplace. Designed in 2026.
          </p>
          <div className="flex items-center gap-6 text-sm text-purple-200/40 font-semibold">
            <span className="hover:text-white transition-colors cursor-pointer">Status</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
