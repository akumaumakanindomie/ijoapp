// frontend/app/dashboard/quest/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Gamepad2, Leaf, Loader2, ScanLine, Ticket, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';

// Pemetaan ikon dinamis
const ICON_MAP: Record<string, any> = { ScanLine, Leaf, Gamepad2, Trophy };

interface UserData { fullName: string; gameTickets: number; }
interface Quest {
  id: string; type: 'daily' | 'weekly'; title: string; description: string;
  target: number; progress: number; rewardTickets: number;
  completed: boolean; claimed: boolean; resetAt: string;
  icon: string; actionLabel: string; actionHref: string;
}

function formatRemaining(targetString: string, now = new Date()) {
  const target = new Date(targetString);
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0 ? `${days} hari ${hours}j ${minutes}m` : `${hours}j ${minutes}m ${seconds}d`;
}

function QuestCountdown({ resetAt }: { resetAt: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <>{formatRemaining(resetAt, now)}</>;
}

export default function QuestPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const [profileRes, questRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/quests')
      ]);
      setUser(profileRes.data);
      setQuests(questRes.data);
    } catch (e) {
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Cookies.get('token')) return router.push('/login');
    fetchInitialData();
  }, [router]);

  const handleClaim = async (questId: string) => {
    const toastId = toast.loading('Mengklaim tiket...');
    try {
      const res = await api.post(`/quests/${questId}/claim`);
      toast.success(res.data.message, { id: toastId });
      
      // Update state lokal tanpa re-fetch utuh
      setUser(prev => prev ? { ...prev, gameTickets: res.data.gameTickets } : null);
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal klaim tiket', { id: toastId });
    }
  };

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fefaf0] text-[#8ac640]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  const dailyQuests = quests.filter(q => q.type === 'daily');
  const weeklyQuests = quests.filter(q => q.type === 'weekly');

  const QuestSection = ({ title, subtitle, questList }: { title: string, subtitle: string, questList: Quest[] }) => {
    if (questList.length === 0) return null;
    return (
      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ac640]">{subtitle}</p>
            <h2 className="text-3xl font-black text-[#135433]">{title}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#135433]/60">
            <Clock3 className="h-4 w-4 text-[#8ac640]" />
            Reset dalam <QuestCountdown resetAt={questList[0].resetAt} />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {questList.map((quest) => {
            const Icon = ICON_MAP[quest.icon] || CheckCircle2;
            return (
              <article key={quest.id} className={`rounded-4xl border-4 ${quest.claimed ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-[#8ac640]/30 bg-white hover:-translate-y-1 hover:border-[#8ac640] hover:shadow-xl'} p-6 shadow-md transition-all`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#135433] text-[#8ac640]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#fefaf0] px-3 py-2 text-sm font-black text-[#135433]">
                    <Ticket className="h-4 w-4 text-[#8ac640]" /> +{quest.rewardTickets}
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-black text-[#135433]">{quest.title}</h3>
                <p className="mt-2 min-h-12 text-sm font-medium leading-relaxed text-[#135433]/65">{quest.description}</p>
                <div className="mt-5 flex items-center justify-between border-t-2 border-gray-100 pt-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[#135433]/45">
                    {Math.min(quest.progress, quest.target)} / {quest.target} selesai
                  </span>
                  
                  {quest.claimed ? (
                    <span className="rounded-xl bg-gray-200 px-4 py-2 text-xs font-black text-gray-500">Telah Diklaim</span>
                  ) : quest.completed ? (
                    <button onClick={() => handleClaim(quest.id)} className="rounded-xl bg-[#8ac640] px-4 py-2 text-xs font-black text-[#135433] shadow-md hover:bg-[#9ad354] transition-colors animate-pulse">
                      Klaim Ticket!
                    </button>
                  ) : (
                    <Link href={quest.actionHref} className="rounded-xl bg-[#135433] px-4 py-2 text-xs font-black text-[#8ac640] transition-colors hover:bg-[#0a311d]">
                      {quest.actionLabel}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-[#fefaf0] px-6 py-8 font-sans text-[#135433]">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#135433]/60 transition-colors hover:text-[#135433]"><ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard</Link>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ac640]">Misi Hijau</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#135433] md:text-5xl">Quest & Ticket</h1>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border-4 border-[#8ac640]/40 bg-white px-5 py-4 shadow-sm">
            <Ticket className="h-7 w-7 text-[#8ac640]" />
            <div><p className="text-xs font-black uppercase tracking-wider text-[#135433]/45">Ticket saat ini</p><p className="text-2xl font-black">{user.gameTickets}</p></div>
          </div>
        </header>

        <QuestSection title="Daily Quest" subtitle="Setiap hari" questList={dailyQuests} />
        <QuestSection title="Weekly Quest" subtitle="Setiap minggu" questList={weeklyQuests} />
      </div>
    </main>
  );
}