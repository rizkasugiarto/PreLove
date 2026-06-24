import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import './prelove.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PreLove - Platform Marketplace Barang Preloved Mahasiswa',
  description: 'Jual beli barang preloved berkualitas untuk mahasiswa dan masyarakat umum secara aman, mudah, dan berkelanjutan.',
  keywords: ['preloved', 'second hand', 'bekas', 'jual beli', 'mahasiswa', 'eco-friendly', 'prelove'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable}`}>
      <body className="bg-gray-50 font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E1B4B',
                color: '#fff',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 10px 40px rgba(139,92,246,0.15)',
              },
              success: {
                iconTheme: { primary: '#A78BFA', secondary: '#1E1B4B' }
              },
              error: {
                iconTheme: { primary: '#F43F5E', secondary: '#1E1B4B' }
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
