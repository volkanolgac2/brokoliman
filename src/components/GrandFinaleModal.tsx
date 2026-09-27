import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, Map } from 'lucide-react';
import { sounds } from '../game/systems/SoundManager';
import { GameSaveData } from '../game/storage';

interface GrandFinaleModalProps {
  saveData: GameSaveData;
  onWorldMap: () => void;
  onRestartGame: () => void;
}

export const GrandFinaleModal: React.FC<GrandFinaleModalProps> = ({
  saveData,
  onWorldMap,
  onRestartGame,
}) => {
  useEffect(() => {
    sounds.playBossDefeated();
    const interval = setInterval(() => {
      confetti({
        particleCount: 50,
        spread: 90,
        origin: { x: Math.random(), y: 0.5 },
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const totalStars = Object.values(saveData.levelStars).reduce((a, b) => a + b, 0);

  const friends = [
    { name: 'Domates', asset: '/assets/brokoli/02_characters/domates_dost.png' },
    { name: 'Biber', asset: '/assets/brokoli/02_characters/biber_dost.png' },
    { name: 'Mısır', asset: '/assets/brokoli/02_characters/misir_dost.png' },
    { name: 'Soğan', asset: '/assets/brokoli/02_characters/sogan_dost.png' },
    { name: 'Patlıcan', asset: '/assets/brokoli/02_characters/patlican_dost.png' },
    { name: 'Salatalık', asset: '/assets/brokoli/02_characters/salatalik_dost.png' },
    { name: 'Bezelye', asset: '/assets/brokoli/02_characters/bezelye_dost.png' },
    { name: 'Mantar', asset: '/assets/brokoli/02_characters/mantar_dost.png' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-center text-white shadow-2xl relative my-auto animate-in zoom-in-95 duration-300">
        {/* Banner Title */}
        <div className="inline-block bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 px-6 py-2 rounded-2xl shadow-xl mb-4">
          <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow">
            🥦 SEBZELER KURTULDU! 🥕
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-md">
          HAMBURGER KRAL YENİLDİ!
        </h1>
        <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-xl mx-auto">
          Brokoli Adam büyük kaleyi aştı, tüm tuzakları çözdü ve biricik aşkı <strong className="text-orange-400">Havuç</strong> ile tüm sebze dostlarını sonsuza dek özgürlüğe kavuşturdu!
        </p>

        {/* Hero & Girlfriend Reunion Centerpiece */}
        <div className="my-6 p-4 rounded-3xl bg-slate-950/60 border-2 border-emerald-500/40 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <img
              src="/assets/brokoli/02_characters/brokoli_kahraman.png"
              alt="Brokoli Adam"
              className="w-24 h-24 object-contain animate-bounce"
            />
            <span className="text-xs font-black text-emerald-300 mt-1">Brokoli Kahraman</span>
          </div>

          <span className="text-3xl animate-pulse">💖</span>

          <div className="flex flex-col items-center">
            <img
              src="/assets/brokoli/02_characters/havuc_kiz_arkadas.png"
              alt="Havuç"
              className="w-24 h-24 object-contain animate-bounce"
            />
            <span className="text-xs font-black text-orange-300 mt-1">Havuç (Kurtarıldı!)</span>
          </div>
        </div>

        {/* All Saved Friends Reunion Row */}
        <div className="mb-6">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
            Tüm Dostlar Artık Bir Arada ve Güvende:
          </span>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {friends.map((f, i) => (
              <div key={i} className="flex flex-col items-center bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
                <img src={f.asset} alt={f.name} className="w-9 h-9 object-contain" />
                <span className="text-[10px] font-bold text-slate-300">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 50 Levels Recap Card */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col items-center">
            <Trophy className="text-amber-400" size={24} />
            <span className="text-xs text-slate-400 mt-1">Tamamlanan</span>
            <span className="text-lg font-black text-white">50 / 50 Bölüm</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800">
            <Star className="text-amber-400 fill-amber-400" size={24} />
            <span className="text-xs text-slate-400 mt-1">Kazanılan Yıldız</span>
            <span className="text-lg font-black text-amber-300">{totalStars} / 150</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">🪙</span>
            <span className="text-xs text-slate-400 mt-1">Toplam Altın</span>
            <span className="text-lg font-black text-yellow-300">{saveData.totalCoins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onWorldMap}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-black text-white text-base shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Map size={20} />
            <span>Eksik Yıldızları Tamamla (Harita)</span>
          </button>
          <button
            onClick={onRestartGame}
            className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
            <span>Macerayı Baştan Oyna</span>
          </button>
        </div>
      </div>
    </div>
  );
};
