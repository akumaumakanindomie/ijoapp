'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, UserRound, CalendarDays, Sparkles } from 'lucide-react';
import api from '@/lib/axios';

interface Profile {
  fullName: string;
  username: string;
  bio: string;
  email: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints?: number;
  usernameChangedAt: string | null;
}

interface ApiError {
  response?: { data?: { message?: string | string[] } };
}

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.push('/login');
      return;
    }

    api.get('/users/profile').then(({ data }) => {
      setProfile(data);
      setFullName(data.fullName);
      setUsername(data.username);
      setBio(data.bio);
    }).catch(() => {
      Cookies.remove('token');
      router.push('/login');
    }).finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', { fullName, username, bio });
      setProfile(data);
      setFullName(data.fullName);
      setUsername(data.username);
      setBio(data.bio);
      toast.success('Profile berhasil diperbarui');
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || 'Profile gagal diperbarui';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fefaf0] text-[#8ac640]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <main className="min-h-screen bg-[#fefaf0] px-5 py-6 font-sans text-[#135433] md:px-8 md:py-10">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-black text-[#135433]/65 transition-colors hover:text-[#135433]"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <span className="flex items-center gap-2 rounded-full border-2 border-[#8ac640] bg-white px-4 py-2 text-xs font-black uppercase tracking-widest"><UserRound className="h-4 w-4 text-[#8ac640]" /> Profile</span>
        </header>

        <section className="mb-6 overflow-hidden rounded-[2.5rem] bg-[#135433] p-7 text-white shadow-xl md:p-10">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#8ac640] bg-white shadow-lg">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=fefaf0`} alt="Avatar profile" fill unoptimized />
            </div>
            <div><p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#8ac640]">Pahlawan Hijau</p><h1 className="text-3xl font-black md:text-4xl">{profile.fullName}</h1><p className="mt-1 text-emerald-100">@{profile.username}</p></div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border-4 border-emerald-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black"><UserRound className="h-6 w-6 text-[#8ac640]" /> Edit Profile</h2>
            <label className="mb-4 block text-sm font-black">Nama<input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={80} required className="mt-2 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-medium outline-none transition focus:border-[#8ac640]" /></label>
            <label className="mb-4 block text-sm font-black">Username<input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" required className="mt-2 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-medium outline-none transition focus:border-[#8ac640]" /><span className="mt-1 block text-xs font-medium text-[#135433]/50">Username hanya dapat diganti setiap 2 minggu.</span></label>
            <label className="mb-6 block text-sm font-black">Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={240} rows={4} placeholder="Ceritakan sedikit tentang dirimu..." className="mt-2 w-full resize-none rounded-2xl border-2 border-gray-200 px-4 py-3 font-medium outline-none transition focus:border-[#8ac640]" /><span className="mt-1 block text-right text-xs font-medium text-gray-400">{bio.length}/240</span></label>
            <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#135433] px-5 py-4 font-black text-[#8ac640] shadow-lg transition hover:bg-[#0a311d] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-5 w-5" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          </form>

          <div className="space-y-6">
            <section className="rounded-[2rem] border-4 border-[#8ac640] bg-white p-6 shadow-sm"><p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#8ac640]"><Sparkles className="h-4 w-4" /> Poin Minggu Ini</p><p className="text-5xl font-black">{profile.weeklyPoints ?? profile.monthlyPoints ?? 0}</p><p className="mt-2 text-sm font-bold text-[#135433]/55">Perolehan skor dari permainan yang berlangsung selama 1 minggu terakhir.</p></section>
            <section className="rounded-[2rem] border-4 border-yellow-300 bg-white p-6 shadow-sm"><p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-500"><CalendarDays className="h-4 w-4" /> Total Perolehan Poin</p><p className="text-5xl font-black">{profile.totalPoints}</p><p className="mt-2 text-sm font-bold text-[#135433]/55">Akumulasi poin dari seluruh perjalananmu.</p></section>
          </div>
        </div>
      </div>
    </main>
  );
}