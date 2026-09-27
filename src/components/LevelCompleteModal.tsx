import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Map, ArrowRight, Trophy } from 'lucide-react';
import { sounds } from '../game/systems/SoundManager';

interface LevelCompleteModalProps {
  levelId: number;
  stars: number;
  coins: number;
  time: number;
  friendRescued?: {
    name: string;
    asset: string;
    speech: string;
  };
  isBossVictory?: boolean;
  bossName?: string;
  onNextLevel: () => void;
  onReplay: () => void;
  onWorldMap: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  stars,
  coins,
  time,
  friendRescued,
  isBossVictory,
  bossName,
  onNextLevel,
  onReplay,
  onWorldMap,
}) => {
  useEffect(() => {
    // Launch celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    sounds.playDoorOpen();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border-3 border-emerald-500 rounded-3xl max-w-md w-full p-6 text-center text-white shadow-2xl relative overflow-hidden">
        {/* Top Trophy / Badge */}
        <div className="w-20 h-20 mx-auto -mt-2 mb-3 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center shadow-lg">
          <Trophy size={42} className="text-emerald-400" />
        </div>

        <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">
          {isBossVictory ? 'BÜYÜK ZAFER!' : 'BÖLÜM TAMAMLANDI!'}
        </span>
        <h2 className="text-2xl font-black text-white mt-1">
          {isBossVictory ? `${bossName} Yenildi!` : `Bölüm ${levelId} Başarıldı!`}
        </h2>

        {/* 3 Stars */}
        <div className="flex justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-2xl border-2 transition-transform duration-300 ${
                starIdx <= stars
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}
            >
              <Star size={32} className={starIdx <= stars ? 'fill-amber-400' : ''} />
            </div>
          ))}
        </div>

        {/* Rescued Friend Bubble (if rescued) */}
        {friendRescued && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 mb-4 flex items-center gap-3 text-left">
            <img
              src={friendRescued.asset.startsWith('/') ? friendRescued.asset : `/assets/brokoli/${friendRescued.asset}`}
              alt={friendRescued.name}
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="text-xs font-black text-emerald-300">
                🎉 {friendRescued.name} Kurtarıldı!
              </div>
              <p className="text-xs text-slate-200 mt-0.5 italic">
                "{friendRescued.speech}"
              </p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400">Toplanan Altın</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg">🪙</span>
              <span className="text-lg font-black text-amber-300">+{coins}</span>
            </div>
          </div>
          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Tamamlama Süresi</span>
            <span className="text-lg font-black text-slate-200 mt-0.5">⏱ {formatTime(time)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {levelId < 50 && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-black text-white text-base shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Sonraki Bölüm</span>
              <ArrowRight size={20} />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw size={16} />
              <span>Tekrar</span>
            </button>
            <button
              onClick={onWorldMap}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Map size={16} />
              <span>Harita</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
