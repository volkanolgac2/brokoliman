import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Swords, Zap, Wind, KeyRound, ArrowUp } from 'lucide-react';
import { EventBus } from '../game/systems/EventBus';

export const TouchControls: React.FC = () => {
  const [active, setActive] = useState({
    left: false,
    right: false,
    jump: false,
    dash: false,
    attack: false,
    energy: false,
    interact: false,
  });

  const updateInput = (patch: Partial<typeof active>) => {
    setActive((prev) => {
      const next = { ...prev, ...patch };
      EventBus.emit('player_input', next);
      return next;
    });
  };

  const triggerAction = (eventKey: 'trigger_attack' | 'trigger_energy' | 'trigger_interact' | 'trigger_dash' | 'trigger_jump') => {
    EventBus.emit(eventKey);
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-3 flex justify-between items-end pointer-events-none select-none z-20 md:hidden">
      {/* Left: Directional Buttons */}
      <div className="flex gap-2.5 pointer-events-auto">
        {/* Move Left */}
        <button
          className={`w-15 h-15 rounded-2xl flex items-center justify-center border-2 shadow-xl backdrop-blur-md transition-all active:scale-90 ${
            active.left
              ? 'bg-emerald-500 border-white text-white scale-95 shadow-emerald-500/50'
              : 'bg-slate-900/85 border-emerald-500/50 text-emerald-400'
          }`}
          onTouchStart={() => updateInput({ left: true })}
          onTouchEnd={() => updateInput({ left: false })}
          onMouseDown={() => updateInput({ left: true })}
          onMouseUp={() => updateInput({ left: false })}
        >
          <ArrowLeft size={30} strokeWidth={3} />
        </button>

        {/* Move Right */}
        <button
          className={`w-15 h-15 rounded-2xl flex items-center justify-center border-2 shadow-xl backdrop-blur-md transition-all active:scale-90 ${
            active.right
              ? 'bg-emerald-500 border-white text-white scale-95 shadow-emerald-500/50'
              : 'bg-slate-900/85 border-emerald-500/50 text-emerald-400'
          }`}
          onTouchStart={() => updateInput({ right: true })}
          onTouchEnd={() => updateInput({ right: false })}
          onMouseDown={() => updateInput({ right: true })}
          onMouseUp={() => updateInput({ right: false })}
        >
          <ArrowRight size={30} strokeWidth={3} />
        </button>
      </div>

      {/* Right: Action Buttons Array */}
      <div className="flex items-end gap-2 pointer-events-auto">
        {/* Interaction [F] */}
        <button
          className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl backdrop-blur-md bg-slate-900/85 border-yellow-500/60 text-yellow-400 active:scale-90 active:bg-yellow-500 active:text-slate-900"
          onTouchStart={() => {
            updateInput({ interact: true });
            triggerAction('trigger_interact');
          }}
          onTouchEnd={() => updateInput({ interact: false })}
          onMouseDown={() => {
            updateInput({ interact: true });
            triggerAction('trigger_interact');
          }}
          onMouseUp={() => updateInput({ interact: false })}
        >
          <KeyRound size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase">F / Aç</span>
        </button>

        {/* Dash [SHIFT] */}
        <button
          className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl backdrop-blur-md bg-slate-900/85 border-cyan-500/60 text-cyan-400 active:scale-90 active:bg-cyan-500 active:text-slate-900"
          onTouchStart={() => {
            updateInput({ dash: true });
            triggerAction('trigger_dash');
          }}
          onTouchEnd={() => updateInput({ dash: false })}
          onMouseDown={() => {
            updateInput({ dash: true });
            triggerAction('trigger_dash');
          }}
          onMouseUp={() => updateInput({ dash: false })}
        >
          <Wind size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase">Dash</span>
        </button>

        {/* Energy Projectile [E] */}
        <button
          className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl backdrop-blur-md bg-slate-900/85 border-emerald-500/60 text-emerald-400 active:scale-90 active:bg-emerald-500 active:text-slate-900"
          onTouchStart={() => {
            updateInput({ energy: true });
            triggerAction('trigger_energy');
          }}
          onTouchEnd={() => updateInput({ energy: false })}
          onMouseDown={() => {
            updateInput({ energy: true });
            triggerAction('trigger_energy');
          }}
          onMouseUp={() => updateInput({ energy: false })}
        >
          <Zap size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase">E / Atış</span>
        </button>

        {/* Melee Attack [X] */}
        <button
          className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl backdrop-blur-md bg-rose-600/90 border-rose-400 text-white active:scale-90 active:bg-rose-500"
          onTouchStart={() => {
            updateInput({ attack: true });
            triggerAction('trigger_attack');
          }}
          onTouchEnd={() => updateInput({ attack: false })}
          onMouseDown={() => {
            updateInput({ attack: true });
            triggerAction('trigger_attack');
          }}
          onMouseUp={() => updateInput({ attack: false })}
        >
          <Swords size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase">X / Vur</span>
        </button>

        {/* Jump [SPACE] */}
        <button
          className="w-15 h-15 rounded-3xl flex flex-col items-center justify-center border-3 shadow-2xl backdrop-blur-md bg-emerald-600/95 border-emerald-300 text-white active:scale-90 active:bg-emerald-500"
          onTouchStart={() => {
            updateInput({ jump: true });
            triggerAction('trigger_jump');
          }}
          onTouchEnd={() => updateInput({ jump: false })}
          onMouseDown={() => {
            updateInput({ jump: true });
            triggerAction('trigger_jump');
          }}
          onMouseUp={() => updateInput({ jump: false })}
        >
          <ArrowUp size={26} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase">Zıpla</span>
        </button>
      </div>
    </div>
  );
};
