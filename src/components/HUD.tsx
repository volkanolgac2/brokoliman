import React from 'react';
import { Pause, Volume2, VolumeX, Flag, Zap, Swords, Wind, KeyRound, Sparkles } from 'lucide-react';

interface HUDProps {
  health: number;
  maxHealth: number;
  coins: number;
  stars?: number;
  keys: number;
  levelTime: number;
  levelTitle: string;
  worldNum: number;
  progress?: number;
  currentScreen?: number;
  totalScreens?: number;
  objectiveText?: string;
  canShootEnergy?: boolean;
  canDash?: boolean;
  bossName?: string;
  bossHp?: number;
  maxBossHp?: number;
  bossPhase?: number;
  onPause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  health,
  maxHealth,
  coins,
  stars = 0,
  keys,
  levelTime,
  levelTitle,
  worldNum,
  progress = 0,
  currentScreen = 1,
  totalScreens = 5,
  objectiveText,
  canShootEnergy = true,
  canDash = true,
  bossName,
  bossHp,
  maxBossHp,
  bossPhase,
  onPause,
  soundEnabled,
  onToggleSound,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isBossFight = bossName && bossHp !== undefined && maxBossHp !== undefined;

  return (
    <div className="absolute inset-0 p-3 pointer-events-none select-none z-20 flex flex-col justify-between">
      {/* TOP STATUS BAR */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Left: Hearts & Hero Portrait */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-emerald-500/40 shadow-lg pointer-events-auto">
            <img
              src="/assets/brokoli/02_characters/brokoli_kahraman.png"
              alt="Brokoli"
              className="w-9 h-9 object-contain drop-shadow"
            />
            <div className="flex gap-1.5 items-center">
              {Array.from({ length: maxHealth }).map((_, i) => (
                <img
                  key={i}
                  src="/assets/brokoli/07_ui/can_icon.png"
                  alt="Health"
                  className={`w-5 h-6 object-contain transition-all duration-200 ${
                    i < health ? 'opacity-100 scale-105 drop-shadow' : 'opacity-25 grayscale'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Center: Level Title */}
          <div className="hidden sm:flex flex-col items-center bg-slate-900/90 backdrop-blur-md px-4 py-1 rounded-2xl border-2 border-amber-500/40 shadow-lg">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold">
              Dünya {worldNum}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
              {levelTitle}
            </span>
          </div>

          {/* Right: Coins, Stars, Keys, Timer, Pause & Sound */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-amber-500/40 shadow-lg pointer-events-auto">
            {/* Coins */}
            <div className="flex items-center gap-1.5">
              <img src="/assets/brokoli/07_ui/para_icon.png" alt="Para" className="w-5 h-5 object-contain" />
              <span className="text-sm font-black text-amber-300">{coins}</span>
            </div>

            {/* Stars */}
            {stars > 0 && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <img src="/assets/brokoli/07_ui/yildiz_icon.png" alt="Yıldız" className="w-4 h-4 object-contain" />
                <span className="text-xs font-black text-amber-400">{stars}</span>
              </div>
            )}

            {/* Keys */}
            {keys > 0 && (
              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
                <img src="/assets/brokoli/07_ui/anahtar_icon.png" alt="Anahtar" className="w-5 h-5 object-contain animate-bounce" />
                <span className="text-sm font-black text-yellow-400">{keys}</span>
              </div>
            )}

            {/* Timer */}
            <div className="hidden xs:flex items-center text-xs font-bold text-slate-300 border-l border-slate-700 pl-2">
              ⏱ {formatTime(levelTime)}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95 transition-transform"
              title="Ses"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Pause */}
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 transition-transform"
              title="Durdur"
            >
              <Pause size={16} />
            </button>
          </div>
        </div>

        {/* Level Progression & Active Objective Banner */}
        {!isBossFight && (
          <div className="w-full max-w-xl mx-auto flex flex-col gap-1 pointer-events-auto">
            {/* Objective Banner */}
            {objectiveText && (
              <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/40 text-center shadow-md">
                <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400 animate-spin" />
                  {objectiveText}
                </span>
              </div>
            )}

            {/* Horizontal Distance Progress Bar */}
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-500/30 shadow-lg flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-tight whitespace-nowrap">
                Ekran {currentScreen}/{totalScreens}
              </span>
              <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden relative border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 whitespace-nowrap">
                <Flag size={12} className="text-amber-400 animate-pulse" />
                <span>Portal</span>
              </div>
            </div>
          </div>
        )}

        {/* Boss Health Bar */}
        {isBossFight && (
          <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-rose-500/60 shadow-2xl flex flex-col gap-1.5 pointer-events-auto animate-pulse">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-rose-400 uppercase tracking-wide flex items-center gap-1">
                👑 {bossName}
              </span>
              <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                Aşama {bossPhase} / 3
              </span>
            </div>
            <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden border border-rose-500/40 relative">
              <div
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, (bossHp / maxBossHp) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ABILITY HINTS BAR (Desktop Keyboard Reference) */}
      <div className="hidden md:flex items-center justify-center gap-3 pointer-events-auto pb-1">
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-slate-300 font-bold">
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-amber-300">X</kbd>
          <Swords size={12} className="text-emerald-400" />
          <span>Vuruş</span>
        </div>

        <div className={`flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] font-bold transition-all ${canShootEnergy ? 'text-slate-300' : 'text-slate-500 opacity-60'}`}>
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-amber-300">E</kbd>
          <Zap size={12} className={canShootEnergy ? 'text-emerald-400' : 'text-slate-500'} />
          <span>Enerji</span>
        </div>

        <div className={`flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] font-bold transition-all ${canDash ? 'text-slate-300' : 'text-slate-500 opacity-60'}`}>
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-amber-300">SHIFT</kbd>
          <Wind size={12} className={canDash ? 'text-cyan-400' : 'text-slate-500'} />
          <span>Dash</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-slate-300 font-bold">
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-amber-300">F</kbd>
          <KeyRound size={12} className="text-yellow-400" />
          <span>Etkileşim</span>
        </div>
      </div>
    </div>
  );
};
