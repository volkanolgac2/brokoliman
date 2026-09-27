/**
 * Brokoli Kahraman – Sebzeleri Kurtar!
 * Master React + Phaser 3 App Wrapper
 */

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/GameConfig';
import { EventBus } from './game/systems/EventBus';
import { sounds } from './game/systems/SoundManager';
import { loadSave, recordLevelCompletion, GameSaveData } from './game/storage';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { WorldMap } from './components/WorldMap';
import { StoryModal } from './components/StoryModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { GrandFinaleModal } from './components/GrandFinaleModal';

export default function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // App UI State
  const [saveData, setSaveData] = useState<GameSaveData>(loadSave);
  const [screen, setScreen] = useState<'main_menu' | 'world_map' | 'playing'>('main_menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState<boolean>(false);

  // Modals
  const [showStory, setShowStory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [levelCompleteData, setLevelCompleteData] = useState<{
    levelId: number;
    stars: number;
    coins: number;
    time: number;
    friendRescued?: { name: string; asset: string; speech: string };
    isBossVictory?: boolean;
    bossName?: string;
  } | null>(null);
  const [gameOverData, setGameOverData] = useState<{ levelId: number } | null>(null);
  const [showGrandFinale, setShowGrandFinale] = useState<boolean>(false);

  // In-Game Dialog Toasts
  const [rescueToast, setRescueToast] = useState<{ name: string; asset: string; text: string } | null>(null);
  const [bossToast, setBossToast] = useState<{ name: string; title: string; quote: string; asset: string } | null>(null);

  // Live HUD State
  const [hudData, setHudData] = useState({
    health: 5,
    maxHealth: 5,
    coins: 0,
    stars: 0,
    keys: 0,
    levelTime: 0,
    levelTitle: 'Bölüm 1 – Yeşil Vadi: Büyük Başlangıç',
    worldNum: 1,
    progress: 0,
    currentScreen: 1,
    totalScreens: 5,
    objectiveText: undefined as string | undefined,
    canShootEnergy: true,
    canDash: true,
    bossName: undefined as string | undefined,
    bossHp: undefined as number | undefined,
    maxBossHp: undefined as number | undefined,
    bossPhase: undefined as number | undefined,
  });

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(saveData.settings.sound);

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const config = createGameConfig('phaser-game-container');
      gameRef.current = new Phaser.Game(config);

      EventBus.on('assets_loaded', () => {
        setIsAssetsLoaded(true);
      });

      EventBus.on('hud_update', (data: any) => {
        setHudData((prev) => ({ ...prev, ...data }));
      });

      EventBus.on('rescue_dialog', (dialog: any) => {
        setRescueToast(dialog);
        setTimeout(() => setRescueToast(null), 4500);
      });

      EventBus.on('boss_intro', (dialog: any) => {
        setBossToast(dialog);
        setTimeout(() => setBossToast(null), 4500);
      });

      EventBus.on('level_completed', (data: any) => {
        // Record save progress
        const updatedSave = recordLevelCompletion(
          data.levelId,
          data.stars,
          data.coins,
          data.time,
          data.friendRescued?.name ? data.friendRescued.asset.split('/').pop()?.replace('.png', '') : undefined
        );
        setSaveData(updatedSave);
        setLevelCompleteData(data);
      });

      EventBus.on('game_over', (data: any) => {
        setGameOverData(data);
      });

      EventBus.on('victory_all', () => {
        const updatedSave = recordLevelCompletion(50, 3, 50, 90, 'havuc');
        setSaveData(updatedSave);
        setShowGrandFinale(true);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Launch a level in Phaser
  const launchLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setScreen('playing');
    setLevelCompleteData(null);
    setGameOverData(null);
    setIsPaused(false);
    setRescueToast(null);
    setBossToast(null);

    const isBoss = [10, 20, 30, 40, 50].includes(levelId);
    const sceneKey = isBoss ? 'BossScene' : 'LevelScene';

    if (gameRef.current) {
      gameRef.current.scene.stop('LevelScene');
      gameRef.current.scene.stop('BossScene');
      gameRef.current.scene.start(sceneKey, { levelId });
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sounds.setSfx(nextVal);
    sounds.setMusic(nextVal);
    const updated = {
      ...saveData,
      settings: { ...saveData.settings, sound: nextVal, music: nextVal },
    };
    setSaveData(updated);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (gameRef.current) {
      const activeScene = gameRef.current.scene.getScene('LevelScene') || gameRef.current.scene.getScene('BossScene');
      if (activeScene && activeScene.scene.isActive()) {
        activeScene.scene.pause();
      }
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (gameRef.current) {
      const activeScene = gameRef.current.scene.getScene('LevelScene') || gameRef.current.scene.getScene('BossScene');
      if (activeScene && activeScene.scene.isPaused()) {
        activeScene.scene.resume();
      }
    }
  };

  const handleReplay = () => {
    launchLevel(currentLevelId);
  };

  const handleNextLevel = () => {
    launchLevel(currentLevelId + 1);
  };

  const handleBackToMenu = () => {
    setScreen('main_menu');
    sounds.stopBGM();
    if (gameRef.current) {
      gameRef.current.scene.stop('LevelScene');
      gameRef.current.scene.stop('BossScene');
    }
  };

  const handleOpenWorldMap = () => {
    setScreen('world_map');
    sounds.stopBGM();
    if (gameRef.current) {
      gameRef.current.scene.stop('LevelScene');
      gameRef.current.scene.stop('BossScene');
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center font-['Fredoka',sans-serif]">
      {/* Phaser Canvas Container */}
      <div
        id="phaser-game-container"
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />

      {/* Main Menu Screen */}
      {screen === 'main_menu' && (
        <MainMenu
          saveData={saveData}
          onStartGame={launchLevel}
          onOpenWorldMap={handleOpenWorldMap}
          onOpenStory={() => setShowStory(true)}
          onSaveUpdated={setSaveData}
        />
      )}

      {/* World Map Screen */}
      {screen === 'world_map' && (
        <WorldMap
          saveData={saveData}
          onSelectLevel={launchLevel}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* In-Game Overlays (When Screen is 'playing') */}
      {screen === 'playing' && (
        <>
          <HUD
            health={hudData.health}
            maxHealth={hudData.maxHealth}
            coins={hudData.coins}
            stars={hudData.stars}
            keys={hudData.keys}
            levelTime={hudData.levelTime}
            levelTitle={hudData.levelTitle}
            worldNum={hudData.worldNum}
            progress={hudData.progress}
            currentScreen={hudData.currentScreen}
            totalScreens={hudData.totalScreens}
            objectiveText={hudData.objectiveText}
            canShootEnergy={hudData.canShootEnergy}
            canDash={hudData.canDash}
            bossName={hudData.bossName}
            bossHp={hudData.bossHp}
            maxBossHp={hudData.maxBossHp}
            bossPhase={hudData.bossPhase}
            onPause={handlePause}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          <TouchControls />

          {/* Rescue Toast Dialog */}
          {rescueToast && (
            <div className="absolute top-18 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border-2 border-emerald-400 p-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-11/12 animate-in slide-in-from-top-4 duration-300">
              <img
                src={rescueToast.asset.startsWith('/') ? rescueToast.asset : `/assets/brokoli/${rescueToast.asset}`}
                alt={rescueToast.name}
                className="w-12 h-12 object-contain"
              />
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase">
                  🎉 {rescueToast.name} Kurtarıldı!
                </span>
                <p className="text-xs text-white font-medium italic mt-0.5">
                  "{rescueToast.text}"
                </p>
              </div>
            </div>
          )}

          {/* Boss Intro Toast */}
          {bossToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border-2 border-rose-500 p-4 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-lg w-11/12 animate-in zoom-in-95 duration-300">
              <img
                src={`/assets/brokoli/${bossToast.asset}`}
                alt={bossToast.name}
                className="w-14 h-14 object-contain"
              />
              <div>
                <span className="text-xs font-black text-rose-400 uppercase tracking-wide">
                  ⚠️ {bossToast.title}
                </span>
                <h4 className="text-sm font-black text-white">{bossToast.name}</h4>
                <p className="text-xs text-rose-200 mt-1 italic font-medium">
                  "{bossToast.quote}"
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleReplay}
          onWorldMap={handleOpenWorldMap}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Level Complete Modal */}
      {levelCompleteData && (
        <LevelCompleteModal
          levelId={levelCompleteData.levelId}
          stars={levelCompleteData.stars}
          coins={levelCompleteData.coins}
          time={levelCompleteData.time}
          friendRescued={levelCompleteData.friendRescued}
          isBossVictory={levelCompleteData.isBossVictory}
          bossName={levelCompleteData.bossName}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onWorldMap={handleOpenWorldMap}
        />
      )}

      {/* Game Over Modal */}
      {gameOverData && (
        <GameOverModal
          levelId={gameOverData.levelId}
          onRetry={handleReplay}
          onWorldMap={handleOpenWorldMap}
        />
      )}

      {/* Grand Finale Modal (Level 50 Victory) */}
      {showGrandFinale && (
        <GrandFinaleModal
          saveData={saveData}
          onWorldMap={handleOpenWorldMap}
          onRestartGame={() => launchLevel(1)}
        />
      )}

      {/* Story & Lore Modal */}
      {showStory && <StoryModal onClose={() => setShowStory(false)} />}
    </div>
  );
}
