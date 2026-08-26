'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { ArrowLeft, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { getDriveImage } from '@/app/utils/driveHelper';

interface ArticleItem {
  slug?: string;
  title: string;
  image: string;
  content: string;
}

export default function ArtikelPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/content/public');
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefaf0]">
        <Loader2 className="w-12 h-12 animate-spin text-[#8ac640]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefaf0] font-sans text-[#135433] selection:bg-[#8ac640]/30">
      <nav className="sticky top-0 z-50 bg-[#fefaf0]/90 backdrop-blur-xl border-b border-[#8ac640]/20 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-[#8ac640] hover:bg-[#8ac640] hover:text-white transition-all active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight uppercase">Ijo Project</h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 py-12 space-y-12">
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