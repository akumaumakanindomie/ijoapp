'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import { ArrowLeft, BookOpen, Loader2, ArrowRight, Leaf, LogOut } from 'lucide-react';
import { getDriveImage } from '@/app/utils/driveHelper';

interface ArticleItem {
  slug?: string;
  title: string;
  image: string;
  content: string;
}

interface ProfileSummary {
  username: string;
  fullName: string;
}

export default function ArtikelPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState('🌍');
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [greeting, setGreeting] = useState('Halo');

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/content/public');
      setLogo(response.data?.auth_section?.logo_emoji || '🌍');
      if (response.data && response.data.articles_section) {
        setArticles(response.data.articles_section);
      }
    } catch (err) {
      console.error(err);
      setError('Artikel gagal dimuat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    const hours = new Date().getHours();
    if (hours < 11) setGreeting('Selamat Pagi 🌅');
    else if (hours < 15) setGreeting('Selamat Siang ☀️');
    else if (hours < 18) setGreeting('Selamat Sore ⛅');
    else setGreeting('Selamat Malam 🌙');
  
    const token = Cookies.get('token');
    if (!token) {
      setAuthChecked(true);
      return;
    }

    setIsLoggedIn(true);
    api.get('/users/profile')
      .then(({ data }) => setProfile(data))
      .catch(() => {
        Cookies.remove('token');
        setIsLoggedIn(false);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    window.location.href = '/login';
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefaf0]">
        <Loader2 className="w-12 h-12 animate-spin text-[#8ac640]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefaf0] font-sans text-[#135433] selection:bg-[#8ac640]/30">
      {isLoggedIn && profile ? (
        <nav className="fixed top-0 z-50 w-full border-b border-[#8ac640]/20 bg-[#fefaf0]/80 px-6 py-4 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <button type="button" onClick={() => router.back()} aria-label="Kembali ke halaman sebelumnya" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#8ac640] bg-white text-[#135433] transition-all hover:bg-[#8ac640] hover:text-white active:scale-95">
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 items-center gap-2">
                <Link href="/dashboard/user" aria-label="Buka profile" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#135433] bg-white shadow-lg">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=fefaf0`} alt="Profile" className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8ac640]"><span>{greeting}</span><Leaf className="h-3 w-3 fill-[#8ac640]" /></p>
                  <p className="truncate text-lg font-black text-[#135433]">{profile.fullName}</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end">
              <button onClick={handleLogout} className="group flex items-center gap-2 rounded-full border-2 border-red-200 bg-[#fefaf0] px-4 py-2.5 text-sm font-bold text-red-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:text-white">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="fixed top-0 z-50 w-full border-b border-[#8ac640]/20 bg-[#fefaf0]/80 px-6 py-4 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-linear-to-br from-[#8ac640] to-emerald-500 text-[#135433] shadow-lg shadow-[#8ac640]/30 transition-transform group-hover:scale-110">
                {logo.includes('http') || logo.includes('/') ? <Image src={getDriveImage(logo)} alt="Logo" fill unoptimized className="object-cover" /> : <span className="text-2xl">{logo}</span>}
              </div>
              <span className="text-xl font-black tracking-tighter text-[#135433] transition-colors group-hover:text-[#8ac640]">IJO PROJECT</span>
            </Link>

            <div className="hidden items-center gap-8 text-sm font-black text-[#135433]/70 md:flex">
              <Link href="/#beranda" className="hover:text-[#8ac640] transition-colors">Beranda</Link>
              <Link href="/#video" className="hover:text-[#8ac640] transition-colors">Video</Link>
              <Link href="/#fitur" className="hover:text-[#8ac640] transition-colors">Fitur</Link>
              <Link href="/#tips" className="hover:text-[#8ac640] transition-colors">Tips</Link>
            <Link href="/artikel" className="text-[#8ac640] transition-colors">Artikel</Link>
              <Link href="/#tentang" className="hover:text-[#8ac640] transition-colors">Tentang</Link>
            </div>

            <div className="flex gap-3">
              <Link href="/login" className="rounded-full px-6 py-2.5 text-sm font-black text-[#135433] hover:bg-[#8ac640]/10 transition-colors border-2 border-transparent hover:border-[#8ac640]">Masuk</Link>
              <Link href="/login" className="rounded-full bg-[#135433] px-6 py-2.5 text-sm font-black text-[#8ac640] shadow-lg hover:bg-[#0a311d] hover:shadow-[#135433]/20 transition-all hover:-translate-y-0.5">Akses Juri</Link>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-5xl mx-auto p-6 pt-36 pb-12 space-y-12">
        <div className="text-center space-y-4 mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-[#135433] rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3">
             <BookOpen className="w-10 h-10 text-[#8ac640]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Wawasan <span className="text-[#8ac640]">Hijau</span></h2>
          <p className="text-[#135433]/70 font-bold max-w-lg mx-auto">Baca, pelajari, dan temukan inspirasi untuk menyelamatkan bumi kita melalui langkah-langkah sederhana.</p>
        </div>

        {error ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-4 border-red-200 shadow-sm space-y-4">
            <p className="font-bold text-xl text-red-500">{error}</p>
            <button onClick={fetchArticles} className="px-6 py-2 bg-[#135433] text-white rounded-full font-bold hover:bg-[#8ac640] transition-colors">
               Coba Lagi
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-4 border-dashed border-[#8ac640]/30 shadow-sm">
            <p className="font-bold text-xl text-[#135433]/40">Kumpulan artikel sedang disiapkan.</p>
          </div>
        ) : (
          <div className="grid gap-10">
            {articles.map((article, idx) => (
              <article key={idx} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-emerald-900/5 border-4 border-[#fefaf0] flex flex-col md:flex-row gap-8 hover:-translate-y-2 transition-transform duration-500">
                {article.image && (
                  <div className="w-full md:w-64 md:h-64 aspect-square rounded-3xl overflow-hidden shrink-0 border-4 border-[#8ac640]/20 relative">
                    <Image 
                       src={getDriveImage(article.image)} 
                       alt={article.title} 
                       fill
                       unoptimized
                       className="object-cover transform hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="text-3xl font-black leading-tight mb-4 text-[#135433] break-all">{article.title}</h3>
                  <div className="w-12 h-1.5 bg-[#8ac640] rounded-full mb-6"></div>
                  
                  <p className="text-[#135433]/80 font-medium leading-relaxed whitespace-pre-wrap text-base break-all line-clamp-4">
                    {article.content}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <Link href={`/artikel/${article.slug || idx}`} className="inline-flex items-center text-[#8ac640] font-bold hover:text-[#135433] transition-colors text-sm uppercase tracking-wider">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}