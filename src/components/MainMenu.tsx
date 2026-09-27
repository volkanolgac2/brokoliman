import React, { useState } from 'react';
import { Play, Map, BookOpen, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { GameSaveData, resetGame } from '../game/storage';
import { sounds } from '../game/systems/SoundManager';

interface MainMenuProps {
  saveData: GameSaveData;
  onStartGame: (levelId: number) => void;
  onOpenWorldMap: () => void;
  onOpenStory: () => void;
  onSaveUpdated: (save: GameSaveData) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onStartGame,
  onOpenWorldMap,
  onOpenStory,
  onSaveUpdated,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const nextLevel = saveData.unlockedLevels;

  const toggleSound = () => {
    const updated = {
      ...saveData,
      settings: { ...saveData.settings, sound: !saveData.settings.sound },
    };
    sounds.setSfx(updated.settings.sound);
    sounds.setMusic(updated.settings.music);
    onSaveUpdated(updated);
  };

  const handleReset = () => {
    if (confirm('Tüm ilerlemeyi sıfırlamak istediğinize emin misiniz?')) {
      const fresh = resetGame();
      onSaveUpdated(fresh);
      setShowSettings(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Background Banner with Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <img
          src="/assets/brokoli/01_brand/feature_banner.png"
          alt="Banner"
          className="w-full h-full object-cover scale-105 filter blur-xs"
        />
      </div>

      {/* Top Brand Logo & Title */}
      <div className="relative z-10 flex flex-col items-center mt-2 sm:mt-6 text-center">
        <div className="flex items-center gap-3">
          <img
            src="/assets/brokoli/02_characters/brokoli_kahraman.png"
            alt="Brokoli"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl animate-bounce"
          />
          <div className="text-left">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>🥦</span> Macera & Platform
            </span>
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wide uppercase select-none my-0.5 leading-none"
              style={{
                fontFamily: "'Lilita One', 'Russo One', 'Fredoka', sans-serif",
                background: 'linear-gradient(180deg, #fef08a 0%, #86efac 25%, #22c55e 65%, #15803d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 3px 0 #064e3b) drop-shadow(0 5px 0 #022c22) drop-shadow(0 8px 20px rgba(34, 197, 94, 0.5))',
              }}
            >
              BROKOLİ KAHRAMAN
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-300 drop-shadow-sm">
              Sebzeleri Kurtar! • 50 Bölüm & 5 Büyük Dünya
            </p>
          </div>
          <img
            src="/assets/brokoli/02_characters/havuc_kiz_arkadas.png"
            alt="Havuç"
            className="w-14 h-14 sm:w-18 sm:h-18 object-contain drop-shadow-xl animate-bounce delay-150"
          />
        </div>
      </div>

      {/* Center Character Lineup Showcase */}
      <div className="relative z-10 my-4 sm:my-6 max-w-2xl w-full bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-500/40 shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/02_characters/brokoli_kahraman.png" alt="Brokoli" className="w-14 h-14 object-contain" />
            <span className="text-[10px] font-bold text-emerald-300">Brokoli</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/02_characters/havuc_kiz_arkadas.png" alt="Havuç" className="w-13 h-13 object-contain" />
            <span className="text-[10px] font-bold text-amber-300">Havuç</span>
          </div>
          <span className="text-lg text-slate-500">vs</span>
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/03_enemies_bosses/ketcap.png" alt="Ketçap" className="w-11 h-11 object-contain" />
            <span className="text-[10px] font-bold text-rose-300">Ketçap</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/03_enemies_bosses/hardal.png" alt="Hardal" className="w-11 h-11 object-contain" />
            <span className="text-[10px] font-bold text-yellow-300">Hardal</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/03_enemies_bosses/mayonez.png" alt="Mayonez" className="w-11 h-11 object-contain" />
            <span className="text-[10px] font-bold text-slate-300">Mayonez</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/brokoli/03_enemies_bosses/hamburger_krali.png" alt="Kral" className="w-14 h-14 object-contain" />
            <span className="text-[10px] font-bold text-red-400">Hamburger Kral</span>
          </div>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3">
        {/* Play / Continue */}
        <button
          onClick={() => {
            sounds.playDoorOpen();
            onStartGame(nextLevel);
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 font-black text-white text-lg shadow-xl shadow-emerald-950 flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all border-2 border-emerald-300/40"
        >
          <Play size={24} className="fill-white" />
          <span>{nextLevel > 1 ? `Devam Et (Bölüm ${nextLevel})` : 'Oyuna Başla'}</span>
        </button>

        {/* Level Select & World Map */}
        <button
          onClick={() => {
            sounds.playCoin();
            onOpenWorldMap();
          }}
          className="w-full py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-500/50 font-bold text-amber-300 text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Map size={20} />
          <span>Bölüm Seç / Dünya Haritası</span>
        </button>

        {/* Story & Characters */}
        <button
          onClick={() => {
            sounds.playCoin();
            onOpenStory();
          }}
          className="w-full py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-700 font-bold text-slate-200 text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <BookOpen size={18} />
          <span>Hikâye ve Karakterler</span>
        </button>

        {/* Settings / Reset Toggle */}
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className="flex-1 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            {saveData.settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Ses: {saveData.settings.sound ? 'Açık' : 'Kapalı'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-950 border border-slate-800 hover:border-rose-700 text-xs font-bold text-slate-400 hover:text-rose-300 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="İlerlemeyi Sıfırla"
          >
            <RotateCcw size={14} />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-10 text-center text-slate-400 text-xs mt-3 flex items-center gap-1 font-bold">
        <Sparkles size={14} className="text-amber-400" />
        <span>Brokoli Kahraman &copy; 2026 • Çocuk Dostu Platform Macerası</span>
      </div>
    </div>
  );
};
