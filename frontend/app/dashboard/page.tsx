'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    LogOut, Trophy, Gamepad2, ChevronRight, ArrowRightLeft,
    Sparkles, Leaf, Recycle, ArrowRight, 
    Quote, Target, BookOpen
} from 'lucide-react';

interface ItemData {
  _id: string;
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  type: string;
  lastCheckIn?: string;
}

interface UserData {
  fullName: string;
  ijoCoins: number;
  gameTickets: number;
  activeItem?: ItemData;
}

interface PanduanSection {
  title: string;
  content: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const DashboardSkeleton = () => (
  <div className="mx-auto max-w-6xl px-6 py-8 space-y-8 animate-pulse relative z-10">
    <div className="flex justify-between items-center">
        <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-900/10"></div>
            <div className="space-y-2">
                <div className="h-4 w-24 rounded-full bg-emerald-900/10"></div>
                <div className="h-8 w-48 rounded-full bg-emerald-900/20"></div>
            </div>
        </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 h-96 rounded-[2.5rem] bg-emerald-900/10 backdrop-blur-sm"></div>
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="h-44 rounded-4xl bg-emerald-900/10 backdrop-blur-sm"></div>
        <div className="h-44 rounded-4xl bg-emerald-900/10 backdrop-blur-sm"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [greeting, setGreeting] = useState('Halo');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [rewardCountdown, setRewardCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [rewardDue, setRewardDue] = useState(false);
  const [rewardToastShown, setRewardToastShown] = useState(false);
  const [panduan, setPanduan] = useState<PanduanSection>({
    title: 'Panduan',
    content: 'Belum ada panduan yang tersedia.',
  });

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 11) setGreeting('Selamat Pagi 🌅');
    else if (hours < 15) setGreeting('Selamat Siang ☀️');
    else if (hours < 18) setGreeting('Selamat Sore ⛅');
    else setGreeting('Selamat Malam 🌙');
  }, []);

  useEffect(() => {
    const getNextWeeklyReset = (now = new Date()) => {
      const reset = new Date(now);
      const daysUntilMonday = (8 - reset.getDay()) % 7 || 7;
      reset.setDate(reset.getDate() + daysUntilMonday);
      reset.setHours(0, 0, 0, 0);
      return reset;
    };

    const updateRewardStatus = () => {
      const now = new Date();
      const nextReset = getNextWeeklyReset(now);
      const diffMs = nextReset.getTime() - now.getTime();

      if (diffMs <= 0) {
        setRewardDue(true);
        setRewardCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      setRewardDue(false);
      setRewardCountdown({ days, hours, minutes });
    };

    updateRewardStatus();
    const intervalId = window.setInterval(updateRewardStatus, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!rewardDue || rewardToastShown) return;

    toast.success('Reward leaderboard mingguan sudah siap dibagikan! Cek klasemen sekarang.', {
      id: 'weekly-reward-ready',
      duration: 7000,
      icon: '🎁',
    });
    setRewardToastShown(true);
  }, [rewardDue, rewardToastShown]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch {
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [router]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchPanduan = async () => {
      try {
        const response = await api.get('/content/public');
        if (response.data?.panduan_section) {
          setPanduan({
            title: response.data.panduan_section.title || 'Panduan',
            content: response.data.panduan_section.content || 'Belum ada panduan yang tersedia.',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil panduan:', error);
      }
    };

    const sendHeartbeat = async () => {
      try {
        await api.post('/users/heartbeat');
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    sendHeartbeat();
    fetchPanduan();
    fetchUserProfile();

    const intervalId = window.setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchUserProfile, router]);

  const hasCheckedInToday = () => {
    if (!user?.activeItem?.lastCheckIn) return false;
    const lastDate = new Date(user.activeItem.lastCheckIn);
    const today = new Date();
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  };

  const handleCheckIn = async () => {
    if (!user?.activeItem) return;
    if (hasCheckedInToday()) {
        toast('Sudah rawat hari ini. Besok lagi ya! 🌟', { icon: '👏' });
        return;
    }

    setCheckInLoading(true);
    try {
      const response = await api.post('/items/checkin');
    const { gainedXp, levelUp, reward } = response.data;
      
      if (levelUp) {
                toast.success(`LEVEL UP! ${user.activeItem.name} naik level! +${reward} 🎉`, {
             duration: 5000,
            icon: '🚀'
        });
      } else {
        toast.success(`+${gainedXp} XP dan ${reward}! Partner makin setia. 💚`);
      }
      fetchUserProfile();
    } catch (error) {
      const err = error as ApiError;
      const msg = err.response?.data?.message || 'Gagal check-in';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleSelectItem = async (selection: 'Tumbler' | 'ToteBag') => {
    setSelectLoading(true);
    try {
        const isTumbler = selection === 'Tumbler';
        const payload = {
            name: isTumbler ? 'Si Botol Sakti' : 'Tas Ajaib',
            type: isTumbler ? 'Tumbler' : 'Tote Bag',
            personality: isTumbler ? 'Ceria & Energik' : 'Ramah & Setia'
        };
        await api.post('/items/choose', payload);
        toast.success(`Selamat! Kamu memilih ${payload.name}`);
        setShowSelectModal(false);
        fetchUserProfile();
    } catch (error) {
        const err = error as ApiError;
        const msg = err.response?.data?.message || 'Gagal memilih item';
        toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
        setSelectLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

    const handleExchange = async () => {
        if (!user || user.ijoCoins < 25) {
            toast.error('Koin tidak cukup. Butuh 25 Ijo Coins.');
            return;
        }

        setExchangeLoading(true);
        try {
            const response = await api.post('/auth/exchange-coins');
            setUser(prev => prev ? {
                ...prev,
                ijoCoins: response.data.ijoCoins,
                gameTickets: response.data.gameTickets,
            } : null);
            toast.success('25 Ijo Coins ditukar menjadi 1 Ijo Ticket!');
        } catch (error) {
            const err = error as ApiError;
            const msg = err.response?.data?.message || 'Exchange gagal';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setExchangeLoading(false);
        }
    };

  const getItemIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('botol') || lower.includes('tumbler')) return '🥤';
    if (lower.includes('tas') || lower.includes('bag')) return '🛍️';
    return '🌱';
  };

  const xpPercentage = user?.activeItem 
    ? Math.min(100, (user.activeItem.currentXp / user.activeItem.nextLevelXp) * 100)
    : 0;

  if (loading) {
    return (
        <div className="min-h-screen bg-[#fefaf0] relative overflow-hidden">
             <div className="absolute top-[-20%] left-[-20%] h-200 w-200 rounded-full bg-emerald-300/20 blur-[120px]"></div>
             <div className="absolute bottom-[-20%] right-[-20%] h-150 w-150 rounded-full bg-teal-300/20 blur-[120px]"></div>
             <div className="relative z-10 pt-10">
                 <DashboardSkeleton />
             </div>
        </div>
    );
  }

  if (!user) return null;

  const isDoneToday = hasCheckedInToday();

  return (
    <main className="min-h-screen bg-[#fefaf0] pb-24 font-sans text-[#135433] selection:bg-[#8ac640]/30 relative overflow-hidden">
      <Toaster position="top-center" />
      
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[#fefaf0]"></div>
          <div className="absolute top-[-10%] left-[-5%] w-150 h-150 rounded-full bg-[#8ac640]/10 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[-10%] w-175 h-175 rounded-full bg-emerald-100/40 blur-[120px]"></div>
          <div className="absolute top-[40%] right-[20%] w-100 h-100 rounded-full bg-yellow-100/40 blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
             <Link href="/dashboard/user" aria-label="Buka profile" className="relative group cursor-pointer">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-[#8ac640] to-emerald-500 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative h-16 w-16 rounded-full p-0.5 bg-[#fefaf0] shadow-lg border-2 border-[#135433]">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                        <Image 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}&backgroundColor=fefaf0`} 
                            alt="Avatar" 
                            fill
                            unoptimized
                        />
                    </div>
                </div>
             </Link>
             <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#8ac640] mb-0.5 flex items-center gap-1">
                    {greeting} <Leaf className="w-3 h-3 fill-[#8ac640]" />
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-[#135433] truncate max-w-50 md:max-w-md tracking-tight">
                    {user.fullName}
                </h1>
             </div>
          </div>
          
          <button onClick={handleLogout} className="group flex items-center gap-3 rounded-full bg-[#fefaf0] px-6 py-3 text-sm font-bold text-red-500 shadow-sm border-2 border-red-200 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-xl hover:-translate-y-0.5">
               <LogOut className="w-4 h-4 stroke-3" />
               <span>Keluar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-[#135433] text-white shadow-xl shadow-emerald-900/10 group transition-transform hover:scale-[1.01] duration-500">
                <div className="absolute inset-0 bg-linear-to-br from-[#135433] to-[#0a311d]"></div>
                <div className="absolute top-0 right-0 h-full w-3/4 bg-[#8ac640]/10 -skew-x-12 blur-3xl rounded-full translate-x-10"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 h-full">
                    <div className="flex-1 w-full flex flex-col justify-between h-full min-h-65">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-[#8ac640]/30 mb-5 shadow-inner">
                                <Sparkles className="w-4 h-4 text-[#8ac640] fill-[#8ac640] animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#8ac640]">SETIA</span>
                            </div>
                            
                            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-3 drop-shadow-md text-white">
                                {user.activeItem ? user.activeItem.name : "Pilih Partner"}
                            </h3>
                            
                            {user.activeItem ? (
                                <p className="text-emerald-100 text-base font-medium flex items-center gap-2">
                                    <span className={`h-3 w-3 rounded-full ${isDoneToday ? 'bg-[#8ac640] shadow-[0_0_10px_#8ac640]' : 'bg-red-400 animate-pulse'}`}></span>
                                    Mood: <span className="text-white font-bold">{isDoneToday ? "Senang & Bersih ✨" : "Butuh Perhatian! 🥺"}</span>
                                </p>
                            ) : (
                                <p className="text-emerald-200 text-base font-medium">Mulai perjalananmu dengan memilih partner.</p>
                            )}
                        </div>

                        {user.activeItem ? (
                            <div className="mt-auto pt-6 w-full max-w-sm">
                                <div className="flex justify-between items-end text-sm font-bold text-emerald-100 mb-2">
                                    <span className="bg-[#8ac640]/20 px-3 py-1 rounded-lg border border-[#8ac640]/30 backdrop-blur-md">LVL {user.activeItem.level}</span>
                                    <span className="text-[#8ac640]">{user.activeItem.currentXp} <span className="text-white/40">/ {user.activeItem.nextLevelXp} XP</span></span>
                                </div>
                                
                                <div className="h-5 w-full overflow-hidden rounded-full bg-black/30 backdrop-blur-sm border border-white/10 relative shadow-inner">
                                    <div 
                                        className="h-full bg-linear-to-r from-[#8ac640] via-emerald-400 to-green-300 relative transition-all duration-1000 ease-out flex items-center justify-end pr-1" 
                                        style={{ width: `${xpPercentage}%` }}
                                    >
                                        <div className="h-full w-full absolute top-0 left-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleCheckIn}
                                    disabled={checkInLoading || isDoneToday}
                                    className={`mt-6 w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold transition-all shadow-xl active:scale-95 group/btn
                                        ${isDoneToday 
                                            ? 'bg-black/20 text-white/50 cursor-not-allowed border border-white/5' 
                                            : 'bg-[#8ac640] text-[#135433] hover:bg-[#9ad354] hover:shadow-[#8ac640]/20'
                                        }`}
                                >
                                    {checkInLoading ? <span className="animate-spin">⏳</span> : isDoneToday ? <span>✨</span> : <span className="group-hover/btn:scale-125 transition-transform">💧</span>}
                                    {checkInLoading ? 'Menyimpan...' : isDoneToday ? 'Selesai Hari Ini' : 'Rawat & Tambah XP'}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <button 
                                    onClick={() => setShowSelectModal(true)}
                                    className="w-full md:w-auto rounded-2xl bg-[#8ac640] px-8 py-4 text-base font-black text-[#135433] shadow-xl hover:bg-[#9ad354] hover:scale-105 transition-all animate-bounce"
                                >
                                    + Pilih Partner Sekarang
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center relative mt-6 md:mt-0">
                        <div className="absolute inset-0 bg-[#8ac640]/20 rounded-full blur-3xl transform scale-150 animate-pulse"></div>
                        <div className="relative h-48 w-48 md:h-56 md:w-56 flex items-center justify-center rounded-full bg-linear-to-b from-white/10 to-transparent border-4 border-[#8ac640]/30 shadow-2xl backdrop-blur-md animate-float hover:scale-105 transition-transform duration-500">
                            <span className="text-8xl md:text-9xl filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] select-none transform hover:rotate-6 transition-transform cursor-pointer">
                                {user.activeItem ? getItemIcon(user.activeItem.name) : '🎁'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-6">
                <div className="flex-1 rounded-[2.5rem] bg-[#fefaf0] p-8 shadow-md border-[6px] border-yellow-400 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-100 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>
                                        <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#135433] text-yellow-300 text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-300">🪙</div>
                            <div>
                                <span className="font-bold text-[#8ac640] text-xs uppercase tracking-wider block">Dompet Saya</span>
                                <span className="font-black text-[#135433] text-lg tracking-tight">Ijo Coins</span>
                            </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleExchange}
                                                        disabled={exchangeLoading || user.ijoCoins < 25}
                                                        title="Tukar 25 Ijo Coins menjadi 1 Ijo Ticket"
                                                        className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#135433] px-3 py-2 text-xs font-black text-[#135433] transition-colors hover:bg-[#135433] hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <ArrowRightLeft className="h-3.5 w-3.5" />
                                                        <span>{exchangeLoading ? 'Menukar...' : 'Exchange'}</span>
                                                    </button>
                        </div>
                        <div className="border-t-[3px] border-yellow-100/50 pt-4">
                            <div className="flex items-end justify-between gap-3">
                                <span className="text-5xl font-black text-[#135433] tracking-tighter">{user.ijoCoins}</span>
                                <span className="text-right text-xs font-black text-[#135433]/50">25 coins = 1 ticket</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 rounded-[2.5rem] bg-[#fefaf0] p-8 shadow-md border-[6px] border-[#8ac640] hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ac640]/20 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#135433] text-[#8ac640] text-3xl shadow-inner group-hover:-rotate-12 transition-transform duration-300">🎟️</div>
                            <div>
                                <span className="font-bold text-[#8ac640] text-xs uppercase tracking-wider block">Tiket Main</span>
                                <span className="font-black text-[#135433] text-lg tracking-tight">Ijo Tickets</span>
                            </div>
                        </div>
                        <div className="border-t-[3px] border-[#8ac640]/30 pt-4">
                             <span className="text-5xl font-black text-[#135433] tracking-tighter">{user.gameTickets}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 bg-white rounded-3xl p-6 border-4 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-[#8ac640]">
           <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                   <Target className="w-7 h-7" />
               </div>
               <div>
                   <h3 className="font-black text-[#135433] text-lg">Misi Hijau</h3>
                   <p className="text-sm font-bold text-[#135433]/60">Selesaikan Misi Hijau yang tersedia untuk mendapatkan tiket!</p>
               </div>
           </div>
           <Link
               href="/dashboard/quest"
               className="px-8 py-4 rounded-2xl font-black flex items-center gap-2 bg-[#8ac640] text-[#135433] hover:bg-[#9ad354] shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
           >
               <Target className="w-5 h-5" />
               <span>Lihat Misi</span>
               <ChevronRight className="w-5 h-5" />
           </Link>
        </div>

        <div className="rounded-3xl border-4 border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-[#135433]">{panduan.title}</h3>
          </div>
          <div className="whitespace-pre-line text-sm font-medium leading-relaxed text-[#135433]/75">
            {panduan.content}
          </div>
        </div>

        <div className={`rounded-3xl border-4 p-5 shadow-lg ${rewardDue ? 'border-[#8ac640] bg-[#f4ffe6]' : 'border-[#135433]/10 bg-white'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8ac640]">
                        {rewardDue ? 'Reward siap dibagikan' : 'Pembagian reward minggu ini'}
                    </p>
                    <h2 className="text-xl font-black text-[#135433]">
                        {rewardDue
                            ? 'Leaderboard mingguan sudah waktunya dibagikan!'
                            : 'Reward leaderboard akan dibagikan setelah reset minggu berikutnya'}
                    </h2>
                </div>

                {!rewardDue && (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#135433] px-4 py-3 text-[#8ac640] shadow-md">
                        <span className="text-sm font-black uppercase tracking-wider">Reset</span>
                        <div className="flex items-center gap-2 text-sm font-black">
                            <span className="rounded-lg bg-white/10 px-2 py-1">{rewardCountdown.days}d</span>
                            <span className="rounded-lg bg-white/10 px-2 py-1">{rewardCountdown.hours}j</span>
                            <span className="rounded-lg bg-white/10 px-2 py-1">{rewardCountdown.minutes}m</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Link href="/dashboard/scan" className="group relative overflow-hidden rounded-[2.5rem] bg-[#fefaf0] p-1 shadow-md border-8 border-[#8ac640] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-bl from-[#8ac640]/30 via-[#8ac640]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="h-20 w-20 mb-6 flex items-center justify-center rounded-3xl bg-[#135433] text-[#8ac640] group-hover:scale-105 transition-transform shadow-md duration-300">
                        <Recycle className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-[#135433] tracking-tight mb-2 uppercase">Pilah2</h3>
                    <p className="text-sm text-[#135433]/70 font-bold mb-6 pr-2 leading-relaxed">Pindai sampahmu, temukan nilainya. Ubah sampah menjadi Tiket Emas untuk bumi.</p>
                    <div className="mt-auto">
                        <span className="inline-flex items-center text-sm font-black text-white bg-[#135433] px-5 py-2.5 rounded-full group-hover:bg-[#8ac640] group-hover:text-[#135433] transition-colors duration-300">PINDAI SEKARANG! <ChevronRight className="w-4 h-4 ml-1 stroke-3" /></span>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/game" className="group relative overflow-hidden rounded-[2.5rem] bg-[#fefaf0] p-1 shadow-md border-8 border-[#135433] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-bl from-[#135433]/30 via-[#135433]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="h-20 w-20 mb-6 flex items-center justify-center rounded-3xl bg-[#135433] text-[#8ac640] group-hover:scale-105 transition-transform shadow-md duration-300">
                        <Gamepad2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-[#135433] tracking-tight mb-2 uppercase">Ijo Games</h3>
                    <p className="text-sm text-[#135433]/70 font-bold mb-6 pr-2 leading-relaxed">Bermain dengan tujuan. Ubah kebiasaanmu dan naiki papan peringkat dampak global.</p>
                    <div className="mt-auto">
                        <span className="inline-flex items-center text-sm font-black text-[#8ac640] bg-[#135433] px-5 py-2.5 rounded-full group-hover:bg-[#8ac640] group-hover:text-[#135433] transition-colors duration-300">MAIN SEKARANG! <ChevronRight className="w-4 h-4 ml-1 stroke-3" /></span>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/leaderboard" className="group relative overflow-hidden rounded-[2.5rem] bg-[#fefaf0] p-1 shadow-md border-8 border-[#8ac640] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-bl from-[#8ac640]/30 via-[#8ac640]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="h-20 w-20 mb-6 flex items-center justify-center rounded-3xl bg-[#135433] text-[#8ac640] group-hover:scale-105 transition-transform shadow-md duration-300">
                        <Trophy className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-[#135433] tracking-tight mb-2 uppercase">Klasemen</h3>
                    <p className="text-sm text-[#135433]/70 font-bold mb-6 pr-2 leading-relaxed">Cari tahu siapa Pahlawan Ijo minggu ini. Coba yang terbaik untuk berada di atas sana!</p>
                    <div className="mt-auto">
                        <span className="inline-flex items-center text-sm font-black text-white bg-[#135433] px-5 py-2.5 rounded-full group-hover:bg-[#8ac640] group-hover:text-[#135433] transition-colors duration-300">CEK PERINGKAT! <ChevronRight className="w-4 h-4 ml-1 stroke-3" /></span>
                    </div>
                </div>
            </Link>
        </div>

        <div className="mt-20 bg-white rounded-[3.5rem] p-8 md:p-12 shadow-xl border-8 border-[#fefaf0] flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-[#135433] uppercase leading-none tracking-tight">
                    Baca Artikel <br /> <span className="text-[#8ac640]">Pilihan!</span>
                </h2>
                <p className="text-[#135433]/70 font-bold leading-relaxed">
                    Temukan berbagai inspirasi, wawasan baru, dan panduan praktis untuk gaya hidup ramah lingkungan. Jadilah bagian dari perubahan dengan terus belajar dan membaca kebiasaan baru yang berkelanjutan.
                </p>
                <Link href="/artikel" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-4 border-[#135433] text-[#135433] font-black hover:bg-[#135433] hover:text-[#8ac640] transition-colors shadow-sm active:scale-95 group">
                    Baca di Web Kami! <ArrowRight className="w-5 h-5 stroke-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl overflow-hidden aspect-3/4 border-4 border-[#8ac640] shadow-md transform lg:-translate-y-4 transition-transform hover:scale-105 relative">
                        <Image src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop" alt="Menanam" fill unoptimized className="object-cover" />
                    </div>
                    <div className="rounded-3xl overflow-hidden aspect-3/4 border-4 border-[#135433] shadow-md transform lg:translate-y-4 transition-transform hover:scale-105 relative">
                        <Image src="https://images.unsplash.com/photo-1625314563148-572c6af9e9d5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlbWJlcnNpaGFuJTIwbGluZ2t1bmdhbnxlbnwwfHwwfHx8MA%3D%3D" alt="Membersihkan" fill unoptimized className="object-cover" />
                    </div>
                </div>
                
                <div className="bg-[#fefaf0] border-4 border-[#8ac640]/30 rounded-3xl p-6 flex items-center gap-5 shadow-sm lg:mt-8">
                    <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full overflow-hidden border-4 border-[#8ac640] shadow-sm relative">
                        <Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Author" fill unoptimized className="object-cover"/>
                    </div>
                    <div className="flex-1 relative">
                        <Quote className="absolute -top-3 -left-3 w-8 h-8 text-[#8ac640]/20 rotate-180" />
                        <p className="text-[#135433] text-sm md:text-base font-bold italic relative z-10 leading-snug">
                           &quot;Perubahan besar selalu dimulai dari langkah kecil. Mari rawat bumi kita hari ini, untuk senyum generasi di masa depan.&quot; 
                         </p>
                        <div className="mt-3 leading-none">
                            <p className="font-black text-[#135433] text-sm">Bpk. Bebeck</p>
                            <p className="text-[10px] font-bold text-[#8ac640] uppercase tracking-widest mt-1">Aktivis Lingkungan</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showSelectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#135433]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-lg bg-[#fefaf0] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border-8 border-[#8ac640] bg-clip-padding">
                    <div className="text-center mb-10">
                        <div className="h-20 w-20 bg-[#135433] text-[#8ac640] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner border-4 border-[#8ac640]">
                            🐾                             
                        </div>
                        <h2 className="text-3xl font-black text-[#135433]">Pilih Partner Kamu</h2>
                        <p className="text-[#135433]/70 mt-2 font-medium">Pilih teman setia yang akan menemanimu menjaga bumi.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                        <button 
                            onClick={() => handleSelectItem('Tumbler')}
                            disabled={selectLoading}
                            className="group relative flex flex-col items-center p-6 rounded-3xl border-4 border-[#8ac640]/30 bg-white hover:border-[#8ac640] transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-md">🥤</div>
                            <span className="font-black text-lg text-[#135433] group-hover:text-[#8ac640]">Si Botol Sakti</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 bg-slate-100 px-2 py-1 rounded-lg">Type: Tumbler</span>
                        </button>
                        <button 
                            onClick={() => handleSelectItem('ToteBag')}
                            disabled={selectLoading}
                            className="group relative flex flex-col items-center p-6 rounded-3xl border-4 border-purple-400/30 bg-white hover:border-purple-400 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-md">🛍️</div>
                            <span className="font-black text-lg text-[#135433] group-hover:text-purple-500">Tas Ajaib</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 bg-slate-100 px-2 py-1 rounded-lg">Type: Tote Bag</span>
                        </button>
                    </div>
                    
                    <button onClick={() => setShowSelectModal(false)} className="mt-8 w-full py-4 text-[#135433]/50 font-bold text-sm hover:text-[#135433] transition-colors">
                        Saya mau pikir-pikir dulu...
                    </button>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}