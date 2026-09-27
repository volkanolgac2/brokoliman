import React from 'react';
import { Play, RotateCcw, Map, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onWorldMap: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onWorldMap,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-xs w-full p-6 text-center text-white shadow-2xl">
        <h2 className="text-xl font-black text-white">OYUN DURAKLATILDI</h2>
        <p className="text-xs text-slate-400 mt-1">Nefes al ve hazır olduğunda devam et!</p>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-white flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg shadow-emerald-950"
          >
            <Play size={18} className="fill-white" />
            <span>Devam Et</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
            <span>Bölümü Yeniden Başlat</span>
          </button>

          <button
            onClick={onToggleSound}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>Ses: {soundEnabled ? 'Açık' : 'Kapalı'}</span>
          </button>

          <button
            onClick={onWorldMap}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Map size={18} />
            <span>Dünya Haritasına Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
