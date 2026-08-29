'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { getDriveImage } from '@/app/utils/driveHelper';
import {
  Layout,
  LogIn,
  PanelBottom,
  Save,
  ArrowLeft,
  LogOut,
  Loader2,
  Image as ImageIcon,
  Settings,
  Lightbulb,
  Plus,
  Trash2,
  BookOpen,
  Video,
  ShieldCheck,
} from 'lucide-react';

interface HeroSection {
  title: string;
  subtitle: string;
  cta_text: string;
  hero_image: string;
}

interface AuthSection {
  logo_emoji: string;
  project_name: string;
  login_title_start: string;
  login_title_end: string;
  login_desc: string;
  register_title_start: string;
  register_title_end: string;
  register_desc: string;
  register_quote: string;
  feature_card_title: string;
  feature_card_desc: string;
}

interface FooterInfo {
  about: string;
  contact: string;
  address: string;
  social_ig: string;
}

interface TipItem {
  title: string;
  desc: string;
}

interface PendingRegistration {
  _id: string;
  fullName: string;
  email: string;
  schoolClass: string;
  createdAt: string;
}

interface ArticleItem {
  slug?: string;
  title: string;
  image: string;
  content: string;
}

interface VideoSection {
  video_url: string;
}

interface ContentData {
  hero_section: HeroSection;
  auth_section: AuthSection;
  footer_info: FooterInfo;
  tips_section: TipItem[];
  articles_section: ArticleItem[];
  video_section: VideoSection;
  [key: string]: HeroSection | AuthSection | FooterInfo | TipItem[] | ArticleItem[] | VideoSection;
}

export default function AdminContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

    const [content, setContent] = useState<ContentData>({
        hero_section: { title: '', subtitle: '', cta_text: '', hero_image: '' },
        auth_section: { logo_emoji: '', project_name: '', login_title_start: '', login_title_end: '', login_desc: '', register_title_start: '', register_title_end: '', register_desc: '', register_quote: '', feature_card_title: '', feature_card_desc: '' },
        footer_info: { about: '', contact: '', address: '', social_ig: '' },
        tips_section: [],
        articles_section: [],
        video_section: { video_url: '' }, 
    });

  const [activeTab, setActiveTab] = useState('hero');
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const fetchPendingRegistrations = async () => {
    setPendingLoading(true);
    try {
      const response = await api.get('/users/pending');
      const data = response.data || [];
      setPendingRegistrations(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal memuat pendaftar yang menunggu persetujuan.');
      setPendingRegistrations([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleRegistrationAction = async (userId: string, status: 'active' | 'rejected') => {
    try {
      await api.patch(`/users/${userId}/status`, { status });
      setPendingRegistrations((prev) => prev.filter((item) => item._id !== userId));
      toast.success(status === 'active' ? 'Akun berhasil disetujui.' : 'Pendaftaran ditolak dan data pengguna berhasil dihapus.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengubah status pendaftaran.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/content/public');
        if (response.data) {
             setContent((prev) => ({
                ...prev,
                hero_section: { ...prev.hero_section, ...response.data.hero_section },
                auth_section: { ...prev.auth_section, ...response.data.auth_section },
                footer_info: { ...prev.footer_info, ...response.data.footer_info },
                tips_section: response.data.tips_section || [],
                articles_section: (response.data.articles_section || []).map((a: any) => ({
                    ...a,
                    slug: a.slug || 'article-' + Math.random().toString(36).substr(2, 9)
                })),
                video_section: { ...prev.video_section, ...(response.data.video_section || {}) },
             }));
        }
      } catch (error) {
        toast.error('Gagal mengambil data konten.');
      } finally {
        setLoading(false);
      }
    };

    const token = Cookies.get('token');
    if (!token) {
        router.push('/login');
    } else {
        fetchData();
        fetchPendingRegistrations();
    }
  }, [router]);

  const handleInputChange = (section: string, field: string, value: string) => {
    setContent((prev: ContentData) => {
      const currentSection = prev[section];
      if (Array.isArray(currentSection)) return prev;

      const updatedSection = {
        ...(currentSection as unknown as Record<string, string>),
        [field]: value
      };

      return {
        ...prev,
        [section]: updatedSection
      } as ContentData;
    });
  };

  const handleTipChange = (index: number, field: keyof TipItem, value: string) => {
    setContent(prev => {
      const newTips = [...prev.tips_section];
      // Gunakan spread operator pada object di dalam array agar React mendeteksi perubahan memori
      newTips[index] = { ...newTips[index], [field]: value };
      return { ...prev, tips_section: newTips };
    });
  };

  const handleAddTip = () => {
    setContent(prev => ({
        ...prev,
        tips_section: [...prev.tips_section, { title: 'Judul Tips Baru', desc: 'Deskripsi singkat tips...' }]
    }));
  };

  const handleRemoveTip = (index: number) => {
    setContent(prev => ({
      ...prev,
      tips_section: prev.tips_section.filter((_, i) => i !== index)
    }));
  };    

  const handleArticleChange = (index: number, field: keyof ArticleItem, value: string) => {
    setContent(prev => {
      const newArticles = [...prev.articles_section];
      // Gunakan spread operator pada object di dalam array agar React mendeteksi perubahan memori
      newArticles[index] = { ...newArticles[index], [field]: value };
      return { ...prev, articles_section: newArticles };
    });
  };

  const handleAddArticle = () => {
    setContent(prev => ({
        ...prev,
        articles_section: [...prev.articles_section, { 
            slug: 'article-' + Math.random().toString(36).substr(2, 9), // TAMBAHAN
            title: 'Judul Artikel', 
            image: '', 
            content: 'Isi artikel...' 
        }]
    }));
  };

  const handleRemoveArticle = (index: number) => {
    setContent(prev => ({
      ...prev,
      articles_section: prev.articles_section.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      await api.post('/content/update', {
        key: section,
        value: content[section]
      });
      toast.success('Perubahan berhasil disimpan!');
    } catch (error) {
      toast.error('Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };  

  const handleLogout = () => {
      Cookies.remove('token');
      router.push('/login');
  };

  useEffect(() => {
    if (activeTab === 'register-approval') {
      fetchPendingRegistrations();
    }
  }, [activeTab]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium">Memuat CMS...</p>
    </div>
  );

  const hero = content.hero_section as HeroSection;
  const auth = content.auth_section as AuthSection;
  const footer = content.footer_info as FooterInfo;
  const tips = content.tips_section as TipItem[];
  const articles = content.articles_section as ArticleItem[];
  const video = content.video_section as VideoSection;  

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex flex-col">
      <Toaster position="top-right" />
      
      <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                  <h1 className="font-bold text-base leading-none">CMS Content</h1>
                  <p className="text-[10px] text-slate-400 mt-0.5">Website Content Manager</p>
              </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <div className="h-4 w-px bg-slate-700"></div>
              <button
                onClick={() => handleSave(activeTab === 'video' ? 'video_section' : `${activeTab}_section`)}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Keluar
              </button>
          </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-120px)]">
              
              <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-2 shrink-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navigasi Halaman</p>

                  <button 
                     onClick={() => setActiveTab('hero')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'hero' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <Layout className="w-4 h-4" />
                      Hero (Home Page)
                  </button>
                  
                  <button 
                     onClick={() => setActiveTab('video')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'video' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <Video className="w-4 h-4" />
                      Video (Home Page)
                  </button>

                  <button 
                     onClick={() => setActiveTab('auth')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'auth' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <LogIn className="w-4 h-4" />
                      Login & Register  
                  </button>

                  <button 
                     onClick={() => setActiveTab('register-approval')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'register-approval' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approval Register</span>
                        </div>
                        {pendingRegistrations.length > 0 && (
                          <span className="min-w-[1.4rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                            {pendingRegistrations.length}
                          </span>
                        )}
                      </div>
                  </button>
                  
                  <button 
                     onClick={() => setActiveTab('tips')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'tips' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <Lightbulb className="w-4 h-4" />
                      Tips & Trick
                  </button>

                  <button 
                     onClick={() => setActiveTab('articles')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'articles' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <BookOpen className="w-4 h-4" />
                      Artikel Edukasi
                  </button>

                  <button 
                     onClick={() => setActiveTab('footer')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'footer' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <PanelBottom className="w-4 h-4" />
                      Footer & Info
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                  <div className="p-8 max-w-3xl mx-auto">

                    {activeTab === 'video' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b pb-4">
                                <h2 className="text-2xl font-black text-slate-800">Edit Video Beranda</h2>
                                <p className="text-slate-500 text-sm">Gunakan tautan sematkan (embed) dari YouTube.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">
                                        Embed URL (YouTube)
                                    </label>
                                    <input 
                                        type="url" 
                                        value={video.video_url}
                                        onChange={(e) => handleInputChange('video_section', 'video_url', e.target.value)}
                                        placeholder="https://www.youtube.com/embed/ID_VIDEO"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                        Cara mendapatkan link: Buka video YouTube &rarr; Klik Bagikan (Share) &rarr; Sematkan (Embed) &rarr; Salin URL yang ada di dalam atribut <strong>src="..."</strong>.
                                    </p>
                                </div>
                                
                                {/* Opsi tambahan: Preview Iframe di Admin */}
                                {video.video_url && video.video_url.includes('embed') && (
                                    <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Preview Video</p>
                                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200">
                                            <iframe 
                                                src={video.video_url} 
                                                className="w-full h-full"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                  
                  {activeTab === 'hero' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Halaman Depan</h2>
                              <p className="text-slate-500 text-sm">Sesuaikan teks dan gambar utama website.</p>
                          </div>
                          
                          <div className="space-y-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Judul Besar (Headline)</label>
                                  <input 
                                     type="text" 
                                     value={hero.title}
                                    onChange={(e) => handleInputChange('hero_section', 'title', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg transition-all"
                                  />
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Sub-Judul (Deskripsi)</label>
                                  <textarea 
                                     value={hero.subtitle}
                                    onChange={(e) => handleInputChange('hero_section', 'subtitle', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none h-28 resize-none transition-all"
                                  />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Teks Tombol CTA</label>
                                      <input 
                                         type="text" 
                                         value={hero.cta_text}
                                        onChange={(e) => handleInputChange('hero_section', 'cta_text', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Link Gambar Hero</label>
                                      <div className="relative">
                                          <input 
                                             type="text" 
                                             value={hero.hero_image}
                                            onChange={(e) => handleInputChange('hero_section', 'hero_image', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all truncate"
                                          />
                                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      </div>
                                  </div>
                              </div>
                              
                              {hero.hero_image && (
                                <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center relative group">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Preview Gambar</p>
                                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-slate-200">
                                        <img 
                                            src={getDriveImage(hero.hero_image)} 
                                            alt="Preview Hero" 
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                              )}
                          </div>

                      </div>
                  )}

                  {activeTab === 'auth' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Login & Register</h2>
                              <p className="text-slate-500 text-sm">Pengaturan tampilan halaman masuk dan daftar.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Project</label>
                                  <input 
                                     type="text" value={auth.project_name}
                                    onChange={(e) => handleInputChange('auth_section', 'project_name', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                  />
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Logo (Link Drive / Emoji)</label>
                                  <div className="flex gap-3">
                                      <input 
                                         type="text" value={auth.logo_emoji}
                                        onChange={(e) => handleInputChange('auth_section', 'logo_emoji', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Paste Link / Emoji"
                                      />
                                      <div className="w-12 h-12 shrink-0 border rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                        {(auth.logo_emoji && (auth.logo_emoji.includes('http') || auth.logo_emoji.includes('/'))) ? (
                                            <img src={getDriveImage(auth.logo_emoji)} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <span className="text-2xl">{auth.logo_emoji || '🌍'}</span>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-2xl space-y-5 border border-slate-200/60">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Halaman Login
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Awal</label>
                                    <input value={auth.login_title_start} onChange={(e) => handleInputChange('auth_section', 'login_title_start', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Akhir (Warna)</label>
                                    <input value={auth.login_title_end} onChange={(e) => handleInputChange('auth_section', 'login_title_end', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-emerald-600 font-bold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi</label>
                                <textarea value={auth.login_desc} onChange={(e) => handleInputChange('auth_section', 'login_desc', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-16 resize-none text-sm" />
                             </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-2xl space-y-5 border border-slate-200/60">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Halaman Register
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Awal</label>
                                    <input value={auth.register_title_start} onChange={(e) => handleInputChange('auth_section', 'register_title_start', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Akhir (Warna)</label>
                                    <input value={auth.register_title_end} onChange={(e) => handleInputChange('auth_section', 'register_title_end', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-blue-600 font-bold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi</label>
                                <textarea value={auth.register_desc} onChange={(e) => handleInputChange('auth_section', 'register_desc', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-16 resize-none text-sm" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Quote Motivasi</label>
                                <input value={auth.register_quote} onChange={(e) => handleInputChange('auth_section', 'register_quote', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-sm italic text-slate-600" />
                             </div>
                          </div>

                      </div>
                  )}

                  {activeTab === 'register-approval' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="border-b pb-4 flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-slate-800">Approval Registrasi</h2>
                          <p className="text-slate-500 text-sm">Review akun baru yang menunggu persetujuan admin.</p>
                        </div>
                        <button
                          onClick={fetchPendingRegistrations}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Refresh
                        </button>
                      </div>

                      {pendingLoading ? (
                        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-slate-500">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memuat daftar pendaftar...
                        </div>
                      ) : pendingRegistrations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                          Tidak ada pendaftar yang menunggu persetujuan.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingRegistrations.map((user) => (
                            <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-lg font-bold text-slate-800">{user.fullName}</p>
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                      Pending
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                                    <p><span className="font-semibold">Kelas:</span> {user.schoolClass}</p>
                                    <p><span className="font-semibold">Daftar:</span> {new Date(user.createdAt).toLocaleString('id-ID')}</p>
                                  </div>
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleRegistrationAction(user._id, 'active')}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRegistrationAction(user._id, 'rejected')}
                                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tips' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4 flex justify-between items-end">
                              <div>
                                <h2 className="text-2xl font-black text-slate-800">Tips & Trick</h2>
                                <p className="text-slate-500 text-sm">Kelola daftar tips yang muncul di halaman depan.</p>
                              </div>
                              <button 
                                 onClick={handleAddTip}
                                className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="w-4 h-4" /> Tambah
                              </button>
                          </div>
                          
                          <div className="space-y-4">
                              {tips.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                                    <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Belum ada tips. Tambahkan sekarang!
                                </div>
                              )}
                              {tips.map((tip, index) => (
                                <div key={index} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 group relative hover:shadow-md transition-shadow">
                                    <button 
                                         onClick={() => handleRemoveTip(index)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                                        title="Hapus Tips"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="grid gap-4 pr-8">
                                        <div className="group/input">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Judul Tips</label>
                                            <input 
                                                 type="text" 
                                                 value={tip.title}
                                                onChange={(e) => handleTipChange(index, 'title', e.target.value)}
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-bold text-slate-700"
                                                placeholder="Contoh: Pisahkan Plastik"
                                            />
                                        </div>
                                        <div className="group/input">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Deskripsi Singkat</label>
                                            <textarea 
                                                 value={tip.desc}
                                                onChange={(e) => handleTipChange(index, 'desc', e.target.value)}
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-20 resize-none text-sm text-slate-600"
                                                placeholder="Penjelasan tips..."
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute top-5 left-0 w-1 h-12 bg-emerald-400 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                              ))}
                          </div>

                      </div>
                  )}

                  {activeTab === 'articles' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4 flex justify-between items-end">
                              <div>
                                <h2 className="text-2xl font-black text-slate-800">Artikel Edukasi</h2>
                                <p className="text-slate-500 text-sm">Kelola daftar artikel yang bisa dibaca pengguna.</p>
                              </div>
                              <button 
                                 onClick={handleAddArticle}
                                className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="w-4 h-4" /> Tambah
                              </button>
                          </div>
                          
                          <div className="space-y-6">
                              {articles.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Belum ada artikel. Tambahkan sekarang!
                                </div>
                              )}
                              {articles.map((article, index) => (
                                <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 group relative hover:shadow-md transition-shadow">
                                    <button 
                                         onClick={() => handleRemoveArticle(index)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                                        title="Hapus Artikel"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="space-y-5 pr-8">
                                        <div className="group/input">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Judul Artikel</label>
                                            <input 
                                                 type="text" 
                                                 value={article.title}
                                                onChange={(e) => handleArticleChange(index, 'title', e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-bold text-slate-700"
                                                placeholder="Judul artikel yang menarik..."
                                            />
                                        </div>
                                        <div className="group/input">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Link Gambar (Google Drive)</label>
                                            <div className="relative">
                                                <input 
                                                     type="text" 
                                                     value={article.image}
                                                    onChange={(e) => handleArticleChange(index, 'image', e.target.value)}
                                                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-sm"
                                                    placeholder="https://drive.google.com/..."
                                                />
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                            {article.image && (
                                                <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                                                    <img src={getDriveImage(article.image)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="group/input">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Isi Artikel</label>
                                            <textarea 
                                                 value={article.content}
                                                onChange={(e) => handleArticleChange(index, 'content', e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-48 resize-y text-sm text-slate-600 leading-relaxed"
                                                placeholder="Tulis isi artikel di sini..."
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-0 w-1 h-12 bg-blue-400 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                              ))}
                          </div>

                      </div>
                  )}

                  {activeTab === 'footer' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Footer & Kontak</h2>
                              <p className="text-slate-500 text-sm">Informasi kontak dan media sosial di bagian bawah website.</p>
                          </div>
                          
                          <div className="space-y-5">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Tentang Singkat</label>
                                  <textarea 
                                     value={footer.about}
                                    onChange={(e) => handleInputChange('footer_info', 'about', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none h-28 resize-none transition-all"
                                  />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Email Kontak</label>
                                      <input 
                                         type="text" value={footer.contact}
                                        onChange={(e) => handleInputChange('footer_info', 'contact', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Instagram / Sosmed</label>
                                      <input 
                                         type="text" value={footer.social_ig}
                                        onChange={(e) => handleInputChange('footer_info', 'social_ig', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                      />
                                  </div>
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Alamat Lengkap</label>
                                  <textarea 
                                     value={footer.address}
                                    onChange={(e) => handleInputChange('footer_info', 'address', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none h-20 resize-none transition-all"
                                  />
                              </div>
                          </div>

                      </div>
                  )}

                  </div>
              </div>
          </div>
      </main>
    </div>
  );
}