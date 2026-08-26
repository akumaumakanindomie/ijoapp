'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { getDriveImage } from '@/app/utils/driveHelper';

interface ArticleItem {
  slug?: string;
  title: string;
  image: string;
  content: string;
}

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get('/content/public');
        const articles = response.data?.articles_section || [];
        const paramId = params.id;
        
        // Pencarian menggunakan slug unik, fallback dengan index (menghindari break di data lama)
        const foundArticle = articles.find((a: ArticleItem, idx: number) => 
            a.slug === paramId || String(idx) === paramId
        );

        setArticle(foundArticle || null);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat artikel.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefaf0]">
        <Loader2 className="w-12 h-12 animate-spin text-[#8ac640]" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#fefaf0] text-[#135433] flex flex-col items-center justify-center gap-6 p-6">
        <BookOpen className="w-16 h-16 text-red-400" />
        <h1 className="text-3xl font-black text-red-500">{error}</h1>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#135433] text-white rounded-full font-bold hover:bg-[#8ac640] transition-colors">
           Coba Lagi
        </button>
        <Link href="/artikel" className="inline-flex items-center gap-2 font-bold text-[#8ac640] mt-4">
          <ArrowLeft className="w-5 h-5" /> Kembali ke artikel
        </Link>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#fefaf0] text-[#135433] flex flex-col items-center justify-center gap-6 p-6">
        <BookOpen className="w-16 h-16 text-[#8ac640]" />
        <h1 className="text-3xl font-black">Artikel tidak ditemukan</h1>
        <Link href="/artikel" className="inline-flex items-center gap-2 font-bold text-[#8ac640]">
          <ArrowLeft className="w-5 h-5" /> Kembali ke artikel
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fefaf0] text-[#135433]">
      <nav className="sticky top-0 z-50 bg-[#fefaf0]/90 backdrop-blur-xl border-b border-[#8ac640]/20 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link href="/artikel" className="inline-flex items-center gap-2 font-bold hover:text-[#8ac640] transition-colors">
            <ArrowLeft className="w-5 h-5" /> Semua Artikel
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {article.image && (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-10">
            <Image
              src={getDriveImage(article.image)}
              alt={article.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ac640] mb-4">Literasi Lingkungan</p>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{article.title}</h1>
        <div className="w-14 h-1.5 bg-[#8ac640] rounded-full mb-8" />
        <p className="text-lg text-[#135433]/80 font-medium leading-relaxed whitespace-pre-wrap break-all">
          {article.content}
        </p>
      </article>
    </main>
  );
}