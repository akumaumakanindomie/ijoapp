'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
// 👇 PERBAIKAN IMPORT DI SINI (Menambahkan /app/)
import TipsCard from '@/app/components/landing/TipsCard'; 

import { Mail, MapPin, Instagram, ArrowRight, Lock, BarChart3, Leaf } from 'lucide-react';
import { getDriveImage } from '@/app/utils/driveHelper';

// --- Interface Data ---
interface LandingData {
  auth_section?: {
    logo_emoji: string; 
  };
  hero_section: {
    title: string;
    subtitle: string;
    cta_text: string;
    hero_image: string;
  };
  tips_section: Array<{
    title: string;
    desc: string;
  }>;
  footer_info: {
    about: string;
    contact: string;
    address: string;
    social_ig: string;
  };
}

export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/content/public');
        setData(response.data);
      } catch (error) {
        console.error("Gagal load konten landing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fefaf0]">
        <div className="relative">
           <div className="h-20 w-20 animate-spin rounded-full border-4 border-[#8ac640]/30 border-t-[#8ac640]"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">🌱</div>
        </div>
      </div>
    );
  }

  // Fallback Logo
  const navbarLogo = data.auth_section?.logo_emoji || '🌱';

  return (
    <div className="min-h-screen font-sans text-[#135433] bg-[#fefaf0] selection:bg-[#8ac640]/40 selection:text-[#135433]">
      
      {/* CUSTOM ANIMATION & STYLE */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(#8ac640 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#8ac640]/20 bg-[#fefaf0]/80 backdrop-blur-xl transition-all shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#8ac640] to-emerald-500 text-[#135433] shadow-lg shadow-[#8ac640]/30 group-hover:scale-110 transition-transform overflow-hidden border-2 border-white">
                {(navbarLogo.includes('http') || navbarLogo.includes('/')) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                        src={getDriveImage(navbarLogo)} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <span className="text-2xl">{navbarLogo}</span>
                )}
            </div>
            <span className="text-xl font-black tracking-tighter text-[#135433] group-hover:text-[#8ac640] transition-colors">
                IJO PROJECT
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-black text-[#135433]/70">
             {['Beranda', 'Tips', 'Tentang'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="relative hover:text-[#8ac640] transition-colors">
                    {item}
                </a>
             ))}
          </div>

          <div className="flex gap-3">
            <Link href="/login" className="rounded-full px-6 py-2.5 text-sm font-black text-[#135433] hover:bg-[#8ac640]/10 transition-colors border-2 border-transparent hover:border-[#8ac640]">
              Masuk
            </Link>
            <Link href="/register" className="rounded-full bg-[#135433] px-6 py-2.5 text-sm font-black text-[#8ac640] shadow-lg hover:bg-[#0a311d] hover:shadow-[#135433]/20 transition-all hover:-translate-y-0.5">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#fefaf0]">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-150 w-150 bg-[#8ac640]/20 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 h-125 w-125 bg-emerald-300/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4"></div>

        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#8ac640]/20 border-2 border-[#8ac640]/50 px-4 py-1.5 text-xs font-black text-[#135433] uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8ac640] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#135433]"></span>
              </span>
              Platform Lingkungan #1
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-[#135433] leading-[1.1] tracking-tight">
              {data.hero_section.title.split(' ').slice(0, -1).join(' ')} 
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8ac640] to-emerald-500"> {data.hero_section.title.split(' ').pop()}</span>
            </h1>
            
            <p className="text-xl text-[#135433]/80 font-semibold leading-relaxed max-w-lg">
              {data.hero_section.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#8ac640] px-8 py-4 text-base font-black text-[#135433] shadow-xl shadow-[#8ac640]/30 transition-transform hover:scale-[1.02] active:scale-95 border-2 border-[#8ac640] hover:bg-[#9ad354]">
                 <span>{data.hero_section.cta_text}</span>
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-3" />
                 <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/40 to-white/0 skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border-4 border-[#135433] bg-[#fefaf0] px-8 py-4 text-base font-black text-[#135433] shadow-sm hover:bg-[#135433] hover:text-[#8ac640] transition-all">
                 <Lock className="w-5 h-5" /> Masuk Akun
              </Link>
            </div>
          </div>
          
          <div className="relative animate-float">
             <div className="relative rounded-[3rem] p-3 bg-white border-4 border-[#8ac640] shadow-2xl shadow-[#135433]/10">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-inner aspect-[4/3] bg-emerald-50">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={getDriveImage(data.hero_section.hero_image)} 
                     alt="Hero" 
                     className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-700"
                     referrerPolicy="no-referrer"
                   />
                   
                   <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-[#fefaf0]/95 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[#8ac640]">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#135433] text-[#8ac640] flex items-center justify-center shadow-inner border-2 border-[#8ac640]">
                               <Leaf className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#135433]/50 uppercase tracking-widest">Impact Tracker</p>
                               <p className="text-xl font-black text-[#135433]">1,240 kg</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8ac640]/20 text-[#135433] border border-[#8ac640]/50 text-xs font-black shadow-sm">
                               <BarChart3 className="w-4 h-4" /> 12%
                             </span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- TIPS SECTION --- */}
      <section id="tips" className="py-24 bg-white relative border-y border-[#8ac640]/20">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-soft-light pointer-events-none"></div>
         <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center mb-20 max-w-2xl mx-auto">
               <span className="text-[#8ac640] bg-[#135433] px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs mb-4 inline-block shadow-md">Edukasi & Literasi</span>
               <h2 className="text-4xl lg:text-5xl font-black text-[#135433] mb-6">Tips & Trik Hijau 💡</h2>
               <p className="text-lg text-[#135433]/70 font-medium">Langkah kecil yang bisa kamu lakukan hari ini untuk dampak besar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {data.tips_section && data.tips_section.length > 0 ? (
                  data.tips_section.map((tip, idx) => (
                    <TipsCard 
                      key={idx} 
                      index={idx}
                      title={tip.title} 
                      desc={tip.desc} 
                    />
                  ))
               ) : (
                  <div className="col-span-3 text-center py-10 bg-[#fefaf0] rounded-3xl border-4 border-[#8ac640]/30 text-[#135433] font-bold">
                    Belum ada tips yang ditambahkan di CMS.
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-24 px-6 bg-[#fefaf0]">
         <div className="mx-auto max-w-6xl rounded-[3.5rem] bg-[#135433] p-12 md:p-20 text-center text-[#fefaf0] relative overflow-hidden shadow-2xl border-8 border-[#8ac640]">
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                <div className="absolute top-10 left-10 h-64 w-64 bg-[#8ac640] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 h-64 w-64 bg-emerald-400 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-md">
                  Siap Menjadi Pahlawan Lingkungan?
               </h2>
               <p className="text-[#8ac640] text-xl font-bold">
                  Kumpulkan poin, tukarkan tiket, dan mainkan gamenya.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                   <Link href="/register" className="w-full sm:w-auto rounded-full bg-[#8ac640] border-2 border-[#8ac640] px-10 py-5 text-lg font-black text-[#135433] shadow-xl hover:bg-[#9ad354] hover:scale-105 transition-all">
                      Gabung Sekarang
                   </Link>
                   <Link href="/login" className="w-full sm:w-auto rounded-full bg-transparent border-4 border-[#8ac640] px-10 py-4 text-lg font-black text-[#8ac640] transition-all hover:bg-[#8ac640]/10">
                      Lihat Demo
                   </Link>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="tentang" className="bg-white border-t-8 border-[#8ac640] pt-20 pb-10">
         <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#135433] border-2 border-[#8ac640] flex items-center justify-center text-xl overflow-hidden shadow-sm">
                      {(navbarLogo.includes('http') || navbarLogo.includes('/')) ? (
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={getDriveImage(navbarLogo)} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                           <span>{navbarLogo}</span>
                        )}
                  </div>
                  <span className="text-2xl font-black text-[#135433] tracking-tight">IJO PROJECT</span>
               </div>
               <p className="text-[#135433]/70 font-semibold leading-relaxed max-w-sm text-lg">
                  {data.footer_info.about}
               </p>
               <div className="flex gap-4">
                   {['twitter', 'facebook', 'instagram'].map((social) => (
                       <div key={social} className="h-10 w-10 rounded-full bg-[#fefaf0] border-2 border-[#8ac640]/50 flex items-center justify-center text-[#135433] hover:bg-[#8ac640] hover:text-[#135433] hover:border-[#8ac640] transition-all cursor-pointer shadow-sm hover:-translate-y-1">
                           <span className="sr-only">{social}</span>
                           <div className="w-4 h-4 bg-current rounded-sm"></div>
                       </div>
                   ))}
               </div>
            </div>
            
            <div>
               <h4 className="font-black text-[#135433] text-lg mb-6">Hubungi Kami</h4>
               <ul className="space-y-4 text-[#135433]/80 font-bold">
                  <li className="flex items-center gap-3 hover:text-[#8ac640] transition-colors cursor-pointer">
                      <Mail className="w-5 h-5 text-[#8ac640]" /> {data.footer_info.contact}
                  </li>
                  <li className="flex items-center gap-3 hover:text-[#8ac640] transition-colors cursor-pointer">
                      <MapPin className="w-5 h-5 text-[#8ac640]" /> {data.footer_info.address}
                  </li>
                  <li className="flex items-center gap-3 hover:text-[#8ac640] transition-colors cursor-pointer">
                      <Instagram className="w-5 h-5 text-[#8ac640]" /> {data.footer_info.social_ig}
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="font-black text-[#135433] text-lg mb-6">Menu</h4>
               <ul className="space-y-3 font-bold text-[#135433]/80">
                  <li><Link href="/login" className="hover:text-[#8ac640] hover:translate-x-1 inline-block transition-transform">🔐 Login Siswa</Link></li>
                  <li><Link href="/register" className="hover:text-[#8ac640] hover:translate-x-1 inline-block transition-transform">🚀 Daftar Baru</Link></li>
                  <li><Link href="/dashboard" className="hover:text-[#8ac640] hover:translate-x-1 inline-block transition-transform">📊 Dashboard</Link></li>
               </ul>
            </div>
         </div>
         
         <div className="mx-auto max-w-7xl px-6 border-t-2 border-[#8ac640]/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#135433]/60 font-black tracking-wide">
               &copy; 2026 Ijo Project. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[#135433]/60 font-black">
                <a href="#" className="hover:text-[#8ac640] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#8ac640] transition-colors">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
}