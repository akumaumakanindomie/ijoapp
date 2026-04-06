'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';
import * as tmImage from '@teachablemachine/image';
import { ArrowLeft, Loader2, Zap, Scan, RefreshCw, XCircle, Leaf, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- KONFIGURASI AI ---
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/mF1G2Xwy_2/';
const CONFIDENCE_THRESHOLD = 0.88; 
const STABILITY_FRAMES = 45; 
const UI_UPDATE_DELAY = 100;

export default function ScanPage() {
  const router = useRouter();

  // STATE UI
  const [predictions, setPredictions] = useState<{ className: string; probability: number }[]>([]);
  const [bestGuess, setBestGuess] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // REFS
  const webcamRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const webcamInstanceRef = useRef<tmImage.Webcam | null>(null);
  const requestRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  // REFS LOGIC
  const stabilityCounterRef = useRef<number>(0);
  const currentClassRef = useRef<string | null>(null);
  const lastUiUpdateRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);

  // LOGIC FILTER EDUKASI 
  const isValidTrash = (className: string) => {
    const lower = className.toLowerCase();
    const invalidKeywords = ['muka', 'wajah', 'face', 'background', 'kosong', 'orang', 'bukan'];
    if (invalidKeywords.some(kw => lower.includes(kw))) return false;
    return true; 
  };

  // --- FUNGSI API ---
  const handleLapor = useCallback(async (detectedClass: string, isManual = false) => {
    if (isSendingRef.current) return;
    
    if (!isValidTrash(detectedClass)) {
        toast.error("Benda tidak valid! Harap scan sampah yang benar.", { icon: '⚠️' });
        stabilityCounterRef.current = 0;
        setScanProgress(0);
        return;
    }

    isSendingRef.current = true;
    setIsProcessing(true);

    try {
      let categoryBackend = detectedClass;
      const lower = detectedClass.toLowerCase();

      // Mapping Kategori Backend
      if (lower.includes('plastik') || lower.includes('plastic')) categoryBackend = 'Plastik';
      else if (lower.includes('kertas') || lower.includes('paper')) categoryBackend = 'Kertas';
      else if (lower.includes('kaleng') || lower.includes('logam')) categoryBackend = 'Logam';
      else if (lower.includes('organik')) categoryBackend = 'Organik';

      const response = await api.post('/garbage/scan', { category: categoryBackend });
      const data = response.data;

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold text-sm text-[#135433]">{isManual ? 'Pilah Manual Sukses!' : 'Objek Teridentifikasi!'}</span>
          <span className="text-xs text-[#135433]/80">Reward: +{data.reward} Koin</span>
        </div>,
        { duration: 4000, icon: '🌿', style: { borderRadius: '16px', background: '#fefaf0', border: '2px solid #8ac640' } }
      );

      if (data.tickets > 0 && data.newCoinBalance === 0) {
        setTimeout(() => toast('🎉 Selamat! Koinmu ditukar jadi Tiket Emas!', { icon: '🎟️' }), 1000);
      }

      router.refresh();
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      console.error("Gagal Lapor:", error);
      toast.error('Koneksi terputus. Coba lagi ya pahlawan!', { icon: '📡' });
      isSendingRef.current = false;
      setIsProcessing(false);
      stabilityCounterRef.current = 0;
      setScanProgress(0);
    }
  }, [router]);

  // --- INIT & LOOP ---
  useEffect(() => {
    isMountedRef.current = true;

    const loop = async () => {
        if (!isMountedRef.current) return;

        if (webcamInstanceRef.current) {
            webcamInstanceRef.current.update();
            
            if (modelRef.current && !isSendingRef.current) {
                const prediction = await modelRef.current.predict(webcamInstanceRef.current.canvas);
                const sorted = prediction.sort((a, b) => b.probability - a.probability);
                const topResult = sorted[0];
                const now = Date.now();

                // Stabilizer Logic
                if (topResult.probability > CONFIDENCE_THRESHOLD && isValidTrash(topResult.className)) {
                    if (topResult.className === currentClassRef.current) {
                        stabilityCounterRef.current += 1;
                    } else {
                        currentClassRef.current = topResult.className;
                        stabilityCounterRef.current = 0;
                    }
                } else {
                    stabilityCounterRef.current = Math.max(0, stabilityCounterRef.current - 1);
                }

                // Trigger Auto Send
                if (stabilityCounterRef.current >= STABILITY_FRAMES && !isSendingRef.current) {
                    handleLapor(currentClassRef.current!);
                }

                // Update UI
                if (now - lastUiUpdateRef.current > UI_UPDATE_DELAY) {
                    setPredictions(sorted.slice(0, 3));
                    setBestGuess(topResult.probability > 0.45 ? topResult.className : null);
                    
                    const progress = Math.min(100, (stabilityCounterRef.current / STABILITY_FRAMES) * 100);
                    setScanProgress(progress);
                    lastUiUpdateRef.current = now;
                }
            }
            requestRef.current = window.requestAnimationFrame(loop);
        }
    };

    const initAI = async () => {
      try {
        const modelURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';
        
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        modelRef.current = loadedModel;

        const webcam = new tmImage.Webcam(400, 400, true);
        await webcam.setup();
        
        if (!isMountedRef.current) return; 

        const videoEl = webcam.canvas;
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('muted', 'true');
        
        await webcam.play();
        webcamInstanceRef.current = webcam;

        if (webcamRef.current) {
            webcamRef.current.innerHTML = ''; 
            // Perbaikan: Menggunakan object-contain agar kamera tidak terpotong
            webcam.canvas.className = "w-full h-full object-contain transform scale-x-[-1]";
            webcamRef.current.appendChild(webcam.canvas);
        }

        setIsCameraReady(true);
        requestRef.current = window.requestAnimationFrame(loop);

      } catch (error) {
        console.error("AI Init Error:", error);
        if (isMountedRef.current) {
            setErrorMessage("Kamera tidak dapat diakses.");
        }
      }
    };

    initAI();

    return () => {
      isMountedRef.current = false;
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamInstanceRef.current) {
        try { 
            webcamInstanceRef.current.stop(); 
        } catch (error) {
            // Abaikan error jika kamera sudah berhenti
        }
      }
    };
  }, [handleLapor]);

  return (
    <main className="fixed inset-0 bg-[#fefaf0] overflow-hidden flex flex-col font-sans select-none">
      <Toaster position="top-center" />

      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 right-0 z-30 pt-safe-top px-6 py-6 flex justify-between items-start pointer-events-none">
        <Link href="/dashboard" className="pointer-events-auto group flex items-center justify-center w-12 h-12 bg-[#fefaf0] shadow-md rounded-full border-2 border-[#8ac640] active:scale-95 transition-all hover:bg-[#8ac640]">
            <ArrowLeft size={24} className="text-[#135433] group-hover:text-white" />
        </Link>
        
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-[#fefaf0] shadow-md px-4 py-2 rounded-full border-2 border-[#8ac640]">
                <div className={`w-2.5 h-2.5 rounded-full ${isCameraReady ? 'bg-[#8ac640] animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-black tracking-widest text-[#135433]">
                    PILAH2 AI
                </span>
            </div>
        </div>
      </header>

      {/* --- VIEWPORT KAMERA --- */}
      {/* Perbaikan: min-h-[50vh] flex-1 bg-[#0a311d] agar gambar muat dengan baik di desktop */}
      <div className="relative flex-1 min-h-[50vh] bg-[#0a311d] w-full rounded-b-[2.5rem] md:rounded-b-[3.5rem] overflow-hidden shadow-2xl z-10 flex items-center justify-center">
        
        {/* Loading / Error State */}
        {!isCameraReady && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#fefaf0] text-center px-6">
                {errorMessage ? (
                    <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200">
                        <XCircle className="text-red-500 mb-4 mx-auto" size={48} />
                        <p className="text-red-700 font-bold mb-2">Akses Kamera Ditolak</p>
                        <p className="text-red-600/70 text-sm mb-6">{errorMessage}</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto">
                            <RefreshCw size={16} /> Coba Lagi
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-[#8ac640]/30 border-t-[#8ac640] animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Leaf size={28} className="text-[#8ac640] animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-[#135433] font-black tracking-[0.2em] animate-pulse">MENYIAPKAN AI...</p>
                    </div>
                )}
             </div>
        )}

        {/* Video Feed */}
        <div ref={webcamRef} className="absolute inset-0 w-full h-full z-0 flex items-center justify-center p-4 md:p-8" />
        
        {/* --- OVERLAYS VISUAL --- */}
        {isCameraReady && !isProcessing && (
            <>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(10,49,29,0.8)_100%)] z-10" />

                {/* Scan Line Laser */}
                <div className="absolute inset-x-0 h-1 bg-[#8ac640]/80 shadow-[0_0_40px_rgba(138,198,64,0.8)] z-10 animate-[scan_3s_ease-in-out_infinite]" />

                {/* RETICLE (Kotak Bidik Tengah) - Disesuaikan agar lebih responsif */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-[280px] aspect-square border-2 border-white/20 rounded-3xl z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-[#8ac640] rounded-tl-xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-[#8ac640] rounded-tr-xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-[#8ac640] rounded-bl-xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-[#8ac640] rounded-br-xl -mb-1 -mr-1"></div>
                </div>

                {/* Progress Circle (Indikator Auto-Lock) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                     <div className={cn("relative transition-all duration-300 ease-out", scanProgress > 5 ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                        <svg className="w-64 h-64 md:w-80 md:h-80 -rotate-90 drop-shadow-md">
                             <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                             <circle 
                                cx="50%" cy="50%" r="48%" 
                                stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className="text-[#8ac640] transition-all duration-100 ease-linear"
                                strokeDasharray={880} 
                                strokeDashoffset={880 - (880 * scanProgress) / 100}
                                strokeLinecap="round"
                             />
                        </svg>
                        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 mt-2 bg-[#fefaf0] px-4 py-1.5 rounded-full text-[#135433] text-xs font-black tracking-widest shadow-md border-2 border-[#8ac640]">
                            MENGUNCI... {Math.round(scanProgress)}%
                        </div>
                     </div>
                </div>
            </>
        )}
      </div>

      {/* --- FOOTER & CONTROLS --- */}
      <div className="relative z-20 shrink-0 bg-[#fefaf0] pt-6 pb-6 px-6 flex flex-col justify-between overflow-y-auto">
         
         <div className="max-w-3xl mx-auto w-full">
             <div className="flex justify-between items-end mb-4">
                 <div>
                    <p className="text-xs text-[#8ac640] font-black uppercase tracking-widest mb-1">
                        {isProcessing ? "MENGANALISA DATA..." : "STATUS DETEKSI"}
                    </p>
                    <h2 className={cn("text-2xl md:text-3xl font-black tracking-tight transition-colors", bestGuess ? "text-[#135433]" : "text-[#135433]/40")}>
                        {isProcessing ? "Tunggu..." : bestGuess ? bestGuess.toUpperCase() : "Arahkan Kamera"}
                    </h2>
                 </div>
                 <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-4 transition-all shrink-0 ml-4", 
                    bestGuess ? "bg-[#8ac640] border-[#8ac640] text-[#135433] shadow-lg" : "bg-white border-gray-200 text-gray-400")}>
                     {isProcessing ? <Loader2 className="animate-spin w-6 h-6 md:w-7 md:h-7" /> : <Scan className="w-6 h-6 md:w-7 md:h-7" />}
                 </div>
             </div>

             {/* Bar Probabilitas */}
             <div className="space-y-2 mb-4 bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm">
                {predictions.length > 0 ? predictions.map((pred, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className={cn("w-24 text-xs font-bold truncate text-right", pred.className === bestGuess ? 'text-[#135433]' : 'text-gray-400')}>
                            {pred.className}
                        </span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all duration-300", 
                                    pred.className === bestGuess ? 'bg-linear-to-r from-[#8ac640] to-emerald-400' : 'bg-gray-300')}
                                style={{ width: `${pred.probability * 100}%` }}
                            />
                        </div>
                        <span className="w-10 text-xs font-black text-gray-500">{Math.round(pred.probability*100)}%</span>
                    </div>
                )) : (
                    <div className="text-center py-2 text-xs text-gray-400 font-medium">Belum ada sampah terdeteksi...</div>
                )}
             </div>

             {/* Pesan Edukasi */}
             <div className="flex items-start gap-2 mb-4 px-2">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[11px] md:text-xs text-gray-500 font-medium leading-tight">
                    <strong className="text-[#135433]">Edukasi:</strong> Pastikan hanya menscan sampah asli. Wajah atau benda asing tidak akan mendapatkan tiket permainan.
                </p>
             </div>

             {/* Tombol Manual Action */}
             <button 
                onClick={() => bestGuess && handleLapor(bestGuess, true)}
                disabled={!bestGuess || isProcessing}
                className={cn(
                    "w-full py-4 md:py-5 rounded-[2rem] font-black text-base md:text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-4",
                    bestGuess && !isProcessing 
                        ? "bg-[#135433] hover:bg-[#0a311d] text-[#8ac640] border-[#0a311d] shadow-xl active:translate-y-1 active:border-b-0" 
                        : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                )}
             >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> 
                        <span>MENGIRIM DATA...</span>
                    </>
                ) : bestGuess ? (
                    <>
                        <Zap className="w-5 h-5 md:w-6 md:h-6 fill-[#8ac640]" />
                        <span>LAPOR: {bestGuess.toUpperCase()}</span>
                    </>
                ) : (
                    <span>TUNGGU DETEKSI AI...</span>
                )}
             </button>
         </div>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </main>
  );
}