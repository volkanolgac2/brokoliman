import React from 'react';
import { RotateCcw, Map } from 'lucide-react';

interface GameOverModalProps {
  levelId: number;
  onRetry: () => void;
  onWorldMap: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelId,
  onRetry,
  onWorldMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border-3 border-rose-500 rounded-3xl max-w-sm w-full p-6 text-center text-white shadow-2xl">
        <div className="w-18 h-18 mx-auto mb-3 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-3xl">
          💥
        </div>

        <span className="text-xs font-black uppercase text-rose-400 tracking-widest">
          CANLAR TÜKENDİ
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Tekrar Dene!</h2>
        <p className="text-xs text-slate-300 mt-2">
          Pes etmek yok Brokoli! Tuzakları ve düşmanların hareketlerini izleyip tekrar dene!
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-black text-white text-base shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw size={20} />
            <span>Yeniden Başla</span>
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
