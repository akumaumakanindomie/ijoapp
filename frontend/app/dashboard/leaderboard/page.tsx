'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { ArrowLeft, Trophy, Crown, Sparkles, Zap, Leaf, Brain, Activity } from 'lucide-react';

// --- TIPE DATA ---
interface LeaderboardUser {
  _id: string;
  fullName: string;
  schoolClass: string;
  totalScore: number;
  gameScores: {
    catcher: number;
    snake: number;
    quiz: number;
  };
  activeItem?: {
    name: string;
  };
}

// --- CONFIG TABS ---
const GAME_TABS = [
  { id: 'all', label: 'Global Rank', icon: Trophy, color: 'from-yellow-400 to-orange-500' },
  { id: 'catcher', label: 'Ijo Catcher', icon: Leaf, color: 'from-[#8ac640] to-emerald-600' },
  { id: 'snake', label: 'Neuro Snake', icon: Activity, color: 'from-cyan-400 to-blue-500' },
  { id: 'quiz', label: 'Eco Quiz', icon: Brain, color: 'from-purple-400 to-indigo-500' },
];

// --- SKELETON LOADING ---
const LeaderboardSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse relative z-10">
    <div className="h-12 w-full bg-gray-200 rounded-2xl mb-8"></div>
    <div className="h-32 w-full bg-white rounded-3xl border-4 border-gray-100 shadow-sm"></div>
    <div className="flex items-end justify-center gap-4 h-64">
      <div className="w-1/3 h-40 bg-gray-200 rounded-t-3xl border-t-4 border-gray-300"></div>
      <div className="w-1/3 h-56 bg-gray-200 rounded-t-3xl border-t-4 border-gray-300"></div>
      <div className="w-1/3 h-32 bg-gray-200 rounded-t-3xl border-t-4 border-gray-300"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full bg-white rounded-2xl border-2 border-gray-100"></div>
      ))}
    </div>
  </div>
);

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await api.get('/games/leaderboard', {
          params: { game: activeTab }
        });
        setLeaders(response.data);
      } catch (error) {
        console.error("Gagal ambil leaderboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getAvatar = (name: string) => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=fefaf0`;

  const getDisplayScore = (user: LeaderboardUser) => {
    if (activeTab === 'all') return user.totalScore;
    const key = activeTab as keyof typeof user.gameScores;
    return user.gameScores ? user.gameScores[key] || 0 : 0;
  };

  const topThree = leaders.slice(0, 3);
  const restOfList = leaders.slice(3);

  const activeTheme = GAME_TABS.find(t => t.id === activeTab)?.color || 'from-[#8ac640] to-emerald-600';

  return (
    <main className="min-h-screen bg-[#fefaf0] relative font-sans text-[#135433] overflow-x-hidden selection:bg-[#8ac640]/30">
      
      {/* === BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        <div className="absolute inset-0 bg-[#fefaf0]"></div>
        <div className={`absolute top-0 left-0 w-full h-96 bg-linear-to-b opacity-[0.08] ${activeTheme}`}></div>
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-[#8ac640]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-125 h-125 bg-emerald-200/40 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 pb-24">
        
        {/* === HEADER === */}
        <div className="flex items-center justify-between mb-8">
            <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 rounded-full bg-white border-2 border-gray-200 px-5 py-2.5 text-sm font-bold text-[#135433] transition-all hover:bg-[#8ac640] hover:text-white hover:border-[#8ac640] shadow-sm"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#135433] text-[#8ac640] border-2 border-[#135433] text-xs font-black tracking-widest uppercase shadow-sm">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Season 2026
            </div>
        </div>

        {/* === TITLE === */}
        <div className="mb-8 text-center animate-in slide-in-from-top-5 duration-700">
            <h1 className="text-4xl md:text-5xl font-black text-[#135433] tracking-tight drop-shadow-sm mb-2">
                Klasemen <span className={`text-transparent bg-clip-text bg-linear-to-r ${activeTheme}`}>Pahlawan</span>
            </h1>
            <p className="text-[#135433]/70 font-bold text-sm">Bersaing secara sehat, selamatkan bumi dengan aksi nyata.</p>
        </div>

        {/* === TABS === */}
        <div className="flex p-2 mb-12 overflow-x-auto no-scrollbar gap-2 sm:justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-gray-100 w-max mx-auto max-w-full">
            {GAME_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all duration-300 whitespace-nowrap
                            ${isActive 
                                ? 'bg-[#135433] text-white shadow-md scale-105 z-10 border-2 border-[#135433]' 
                                : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-[#135433] border-2 border-transparent'}
                        `}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? (tab.id === 'all' ? 'text-yellow-400' : 'text-[#8ac640]') : ''}`} />
                        {tab.label}
                    </button>
                )
            })}
        </div>

        {/* === CONTENT === */}
        {loading ? (
             <LeaderboardSkeleton />
        ) : (
            <>
                {/* === PODIUM (TOP 3) === */}
                {leaders.length > 0 ? (
                    <div className="flex flex-col-reverse items-end justify-center gap-4 sm:flex-row sm:items-end mb-16 px-4 animate-in slide-in-from-bottom-10 duration-700">
                        
                        {/* RANK 2 */}
                        {topThree[1] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center group">
                                <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="h-20 w-20 rounded-full border-4 border-gray-300 bg-white shadow-xl p-0.5 relative z-10">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getAvatar(topThree[1].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-700 font-black px-3 py-1 rounded-full text-xs shadow-sm border-2 border-gray-300 z-20">#2</div>
                                </div>
                                <div className="w-full rounded-t-3xl bg-white p-6 pt-8 text-center border-t-4 border-l-4 border-r-4 border-gray-200 shadow-sm min-h-[160px] flex flex-col justify-start">
                                    <p className="truncate font-black text-[#135433] mb-1">{topThree[1].fullName}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        <span className="font-black text-[#135433]">{getDisplayScore(topThree[1])}</span>
                                        <span className="text-[10px] font-bold text-gray-400">PTS</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RANK 1 */}
                        {topThree[0] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center z-20 -mx-2 sm:mx-0 order-first sm:order-none group">
                                <div className="relative mb-4 transform group-hover:-translate-y-3 transition-transform duration-500">
                                    <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-md animate-bounce" />
                                    <div className={`h-28 w-28 rounded-full border-[6px] bg-white shadow-xl p-1 relative z-10 ${activeTab === 'all' ? 'border-yellow-400' : 'border-[#8ac640]'}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getAvatar(topThree[0].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-400 to-orange-500 text-white font-black px-5 py-1.5 rounded-full text-sm shadow-lg border-2 border-white z-20 whitespace-nowrap">
                                        JUARA 1 👑
                                    </div>
                                </div>
                                <div className={`w-full rounded-t-[2.5rem] bg-white p-6 pt-10 text-center border-t-8 border-l-4 border-r-4 shadow-lg min-h-[200px] flex flex-col justify-start relative overflow-hidden ${activeTab === 'all' ? 'border-yellow-400' : 'border-[#8ac640]'}`}>
                                    <div className={`absolute top-0 left-0 w-full h-24 bg-linear-to-b to-transparent opacity-10 pointer-events-none ${activeTab === 'all' ? 'from-yellow-400' : 'from-[#8ac640]'}`}></div>
                                    <p className="truncate font-black text-xl text-[#135433] mb-1 relative z-10">{topThree[0].fullName}</p>
                                    <p className="text-xs font-bold text-gray-500 mb-4 relative z-10">{topThree[0].schoolClass}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-[#135433] text-white px-5 py-2 rounded-xl shadow-md mx-auto relative z-10">
                                        <Zap className={`w-5 h-5 ${activeTab === 'all' ? 'text-yellow-400 fill-yellow-400' : 'text-[#8ac640] fill-[#8ac640]'}`} />
                                        <span className="font-black text-2xl">{getDisplayScore(topThree[0])}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RANK 3 */}
                        {topThree[2] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center group">
                                <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="h-20 w-20 rounded-full border-4 border-orange-300 bg-white shadow-xl p-0.5 relative z-10">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getAvatar(topThree[2].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-800 font-black px-3 py-1 rounded-full text-xs shadow-sm border-2 border-orange-200 z-20">#3</div>
                                </div>
                                <div className="w-full rounded-t-3xl bg-white p-6 pt-8 text-center border-t-4 border-l-4 border-r-4 border-orange-200 shadow-sm min-h-[140px] flex flex-col justify-start">
                                    <p className="truncate font-black text-[#135433] mb-1">{topThree[2].fullName}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        <span className="font-black text-[#135433]">{getDisplayScore(topThree[2])}</span>
                                        <span className="text-[10px] font-bold text-gray-400">PTS</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-20 text-center text-[#135433]/40 bg-white rounded-3xl border-4 border-gray-100 mx-4 shadow-sm">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30 text-[#8ac640]" />
                        <p className="font-bold">Belum ada data kompetisi untuk kategori ini.</p>
                        <p className="text-sm mt-2 font-medium">Jadilah yang pertama bermain!</p>
                    </div>
                )}

                {/* === LIST SISA === */}
                <div className="space-y-3 px-1 animate-in slide-in-from-bottom-20 duration-1000 delay-100">
                    {restOfList.map((user, index) => {
                        const rank = index + 4;
                        return (
                            <div key={user._id} className="group flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-2 border-gray-100 hover:border-[#8ac640]">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 font-black text-gray-500 text-base group-hover:bg-[#8ac640] group-hover:text-[#135433] transition-colors">
                                        {rank}
                                    </div>
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getAvatar(user.fullName)} alt="Avatar" className="h-12 w-12 rounded-full bg-gray-50 border-2 border-gray-200 group-hover:border-[#8ac640] transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-black text-[#135433] text-lg leading-tight mb-1">{user.fullName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{user.schoolClass}</span>
                                            {user.activeItem && (
                                                <span className="truncate flex items-center gap-1 text-[#8ac640] bg-[#135433]/5 px-2 py-0.5 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8ac640]"></span> 
                                                    {user.activeItem.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                     <div className="flex flex-col items-end">
                                        <span className="font-black text-[#135433] text-xl tabular-nums group-hover:text-[#8ac640] transition-colors leading-none">
                                            {getDisplayScore(user)}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Points</span>
                                     </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </div>
    </main>
  );
}