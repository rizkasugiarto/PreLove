import Link from 'next/link';
import { ShieldCheck, Camera, Hash, Mail, ArrowRight, ShoppingBag, MessageCircle, Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0514] border-t border-white/10 pt-16 pb-8 mt-auto text-white/80 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Main Columns - Tokopedia Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          
          {/* Kolom 1: Tentang PreLove */}
          <div>
            <h3 className="font-bold text-white mb-4 text-[15px]">PreLove</h3>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li><Link href="/info/about" className="hover:text-purple-400 transition-colors">Tentang PreLove</Link></li>
              <li><Link href="/info/hki" className="hover:text-purple-400 transition-colors">Hak Kekayaan Intelektual</Link></li>
              <li><Link href="/info/karir" className="hover:text-purple-400 transition-colors">Karir</Link></li>
              <li><Link href="/info/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
              <li><Link href="/info/sustainability" className="hover:text-purple-400 transition-colors">Dampak Lingkungan</Link></li>
            </ul>
          </div>



          {/* Kolom 3: Bantuan dan Panduan */}
          <div>
            <h3 className="font-bold text-white mb-4 text-[15px]">Bantuan dan Panduan</h3>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li><Link href="/info/care" className="hover:text-purple-400 transition-colors">PreLove Care</Link></li>
              <li><Link href="/info/terms" className="hover:text-purple-400 transition-colors">Syarat dan Ketentuan</Link></li>
              <li><Link href="/info/privacy" className="hover:text-purple-400 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Keamanan, Media Sosial, & Brand */}
          <div className="flex flex-col">
            <h3 className="font-bold text-white mb-5 text-[15px]">Keamanan & Privasi</h3>
            
            {/* Badges Stacked Vertically */}
            <div className="flex flex-col gap-4 mb-10 w-fit">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[13px] font-black tracking-wide whitespace-nowrap text-white/90">100% AMAN</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                <span className="text-[13px] font-black tracking-wide whitespace-nowrap text-white/90">PCI DSS SECURE</span>
              </div>
            </div>

            <h3 className="font-bold text-white mb-5 text-[15px]">Ikuti Kami</h3>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                <Hash size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                <Video size={18} />
              </a>
            </div>
            
            {/* Logo in the right corner like Tokopedia */}
            <div className="flex items-center gap-3 opacity-50 mt-auto pt-4">
              <ShoppingBag size={28} className="text-purple-400" />
              <span className="font-black text-2xl text-white tracking-tight">PreLove.</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/50">
          <p>&copy; 2024 - 2026, PT. PreLove Indonesia</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Server Status</Link>
            <Link href="#" className="hover:text-white">Bug Bounty</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
