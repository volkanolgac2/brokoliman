import React, { useState } from 'react';
import { WORLDS, ALL_LEVELS } from '../game/levelData';
import { GameSaveData } from '../game/storage';
import { Trophy, Star, Lock, Play, ArrowLeft, ShieldAlert } from 'lucide-react';
import { sounds } from '../game/systems/SoundManager';

interface WorldMapProps {
  saveData: GameSaveData;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  saveData,
  onSelectLevel,
  onBackToMenu,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number>(() => {
    return Math.min(5, Math.ceil(saveData.unlockedLevels / 10));
  });

  const worldInfo = WORLDS[selectedWorld - 1];
  const levelsInWorld = ALL_LEVELS.filter((lvl) => lvl.world === selectedWorld);
  const totalStars = Object.values(saveData.levelStars).reduce((a, b) => a + b, 0);

  const friendsList = [
    { id: 'domates', name: 'Domates', asset: '/assets/brokoli/02_characters/domates_dost.png' },
    { id: 'biber', name: 'Biber', asset: '/assets/brokoli/02_characters/biber_dost.png' },
    { id: 'misir', name: 'Mısır', asset: '/assets/brokoli/02_characters/misir_dost.png' },
    { id: 'sogan', name: 'Soğan', asset: '/assets/brokoli/02_characters/sogan_dost.png' },
    { id: 'patlican', name: 'Patlıcan', asset: '/assets/brokoli/02_characters/patlican_dost.png' },
    { id: 'salatalik', name: 'Salatalık', asset: '/assets/brokoli/02_characters/salatalik_dost.png' },
    { id: 'bezelye', name: 'Bezelye', asset: '/assets/brokoli/02_characters/bezelye_dost.png' },
    { id: 'mantar', name: 'Mantar', asset: '/assets/brokoli/02_characters/mantar_dost.png' },
    { id: 'havuc', name: 'Havuç', asset: '/assets/brokoli/02_characters/havuc_kiz_arkadas.png' },
  ];

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col text-white overflow-y-auto p-4 sm:p-6">
      {/* Background Image from current selected world */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden transition-all duration-500">
        <img
          src={`/assets/brokoli/04_worlds/${worldInfo.background}.png`}
          alt="World Background"
          className="w-full h-full object-cover filter blur-xs"
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 max-w-6xl mx-auto w-full">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
          Ana Menü
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl">
            <Star className="text-amber-400 fill-amber-400" size={18} />
            <span className="font-extrabold text-amber-300 text-sm sm:text-base">
              {totalStars} / 150 Yıldız
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 rounded-xl">
            <span className="text-lg">🪙</span>
            <span className="font-extrabold text-yellow-300 text-sm sm:text-base">
              {saveData.totalCoins} Altın
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
            <Trophy className="text-emerald-400" size={18} />
            <span className="font-extrabold text-emerald-300 text-sm sm:text-base">
              {saveData.rescuedFriends.length} / 9 Dost
            </span>
          </div>
        </div>
      </div>

      {/* World Tabs */}
      <div className="relative z-10 max-w-6xl mx-auto w-full mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {WORLDS.map((w) => {
            const isUnlocked = saveData.unlockedLevels >= (w.id - 1) * 10 + 1;
            const isSelected = selectedWorld === w.id;

            return (
              <button
                key={w.id}
                onClick={() => {
                  sounds.playCoin();
                  setSelectedWorld(w.id);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/60 shadow-lg shadow-emerald-900/40 scale-102'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase text-emerald-400">
                    Dünya {w.id}
                  </span>
                  {!isUnlocked && <Lock size={12} className="text-slate-400" />}
                </div>
                <span className="text-sm font-extrabold text-slate-100 text-center line-clamp-1">
                  {w.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* World Details Header */}
      <div className="relative z-10 max-w-6xl mx-auto w-full mt-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Dünya {worldInfo.id} Bilgisi
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">{worldInfo.name}</h2>
          <p className="text-sm text-slate-300 mt-0.5">{worldInfo.subtitle}</p>
        </div>
        <div className="bg-rose-950/40 border border-rose-500/40 px-4 py-2 rounded-2xl flex items-center gap-2">
          <ShieldAlert className="text-rose-400" size={20} />
          <div>
            <div className="text-[10px] font-black text-rose-400 uppercase">Dünya Bossu</div>
            <div className="text-sm font-extrabold text-rose-200">{worldInfo.bossName}</div>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="relative z-10 max-w-6xl mx-auto w-full mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {levelsInWorld.map((lvl) => {
          const isUnlocked = saveData.unlockedLevels >= lvl.id;
          const starsEarned = saveData.levelStars[lvl.id] || 0;
          const isBoss = lvl.isBossLevel;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (isUnlocked) {
                  sounds.playCoin();
                  onSelectLevel(lvl.id);
                }
              }}
              className={`relative rounded-3xl p-4 flex flex-col items-center justify-between min-h-[140px] border-3 transition-all select-none ${
                !isUnlocked
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                  : isBoss
                  ? 'bg-gradient-to-b from-rose-950/70 to-slate-900 border-rose-500/80 hover:border-rose-400 cursor-pointer shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-slate-900 border-emerald-500/50 hover:border-emerald-400 cursor-pointer shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-xs font-black text-slate-400">#{lvl.id}</span>
                {isBoss ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase tracking-wide">
                    BOSS
                  </span>
                ) : lvl.rescueCage ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                    Dost Kafesi
                  </span>
                ) : null}
              </div>

              <div className="my-1 flex flex-col items-center">
                {!isUnlocked ? (
                  <Lock size={28} className="text-slate-500 my-1" />
                ) : isBoss ? (
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-xl">
                    👑
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-300">
                    <Play size={22} className="fill-emerald-400 ml-0.5" />
                  </div>
                )}
                <span className="text-xs font-black text-slate-200 mt-1 line-clamp-1 text-center">
                  {lvl.title.split('–')[1] || lvl.title}
                </span>
              </div>

              <div className="flex gap-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    size={14}
                    className={
                      starIdx <= starsEarned
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rescued Friends Showcase */}
      <div className="relative z-10 max-w-6xl mx-auto w-full mt-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-4">
        <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">
          Kurtarılan Meyve ve Sebzeler ({saveData.rescuedFriends.length} / 9)
        </h3>
        <div className="flex flex-wrap gap-3">
          {friendsList.map((f) => {
            const isRescued = saveData.rescuedFriends.includes(f.id);

            return (
              <div
                key={f.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all ${
                  isRescued
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
                    : 'border-slate-800 bg-slate-900/40 opacity-40 grayscale'
                }`}
              >
                <img src={f.asset} alt={f.name} className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold">{f.name}</span>
                {isRescued ? (
                  <span className="text-emerald-400 text-xs">✓</span>
                ) : (
                  <Lock size={12} className="text-slate-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
