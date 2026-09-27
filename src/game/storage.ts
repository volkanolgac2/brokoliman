/**
 * LocalStorage save management for Brokoli Kahraman
 * Key: brokoli_kahraman_save_v1
 */

export interface GameSaveData {
  unlockedLevels: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, { time: number; coins: number }>;
  totalCoins: number;
  rescuedFriends: string[];
  defeatedBosses: number[];
  settings: {
    sound: boolean;
    music: boolean;
  };
}

const STORAGE_KEY = 'brokoli_kahraman_save_v2';

const defaultSave: GameSaveData = {
  unlockedLevels: 1,
  levelStars: {},
  levelHighScores: {},
  totalCoins: 0,
  rescuedFriends: [],
  defeatedBosses: [],
  settings: {
    sound: true,
    music: true,
  },
};

export function loadSave(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSave };
    const parsed = JSON.parse(raw);
    return {
      ...defaultSave,
      ...parsed,
      settings: { ...defaultSave.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...defaultSave };
  }
}

export function saveGame(data: GameSaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

export function recordLevelCompletion(
  levelId: number,
  stars: number,
  coins: number,
  time: number,
  rescuedFriendId?: string
): GameSaveData {
  const save = loadSave();

  // Update stars (keep highest)
  const prevStars = save.levelStars[levelId] || 0;
  save.levelStars[levelId] = Math.max(prevStars, stars);

  // Update total coins
  save.totalCoins += coins;

  // Update best time and coins for level
  const prevScore = save.levelHighScores[levelId];
  if (!prevScore || time < prevScore.time) {
    save.levelHighScores[levelId] = { time, coins };
  }

  // Rescued friend
  if (rescuedFriendId && !save.rescuedFriends.includes(rescuedFriendId)) {
    save.rescuedFriends.push(rescuedFriendId);
  }

  // Boss defeat check
  if ([10, 20, 30, 40, 50].includes(levelId) && !save.defeatedBosses.includes(levelId)) {
    save.defeatedBosses.push(levelId);
  }

  // Unlock next level (up to 50)
  if (levelId >= save.unlockedLevels && levelId < 50) {
    save.unlockedLevels = levelId + 1;
  }

  saveGame(save);
  return save;
}

export function resetGame(): GameSaveData {
  const save = { ...defaultSave };
  saveGame(save);
  return save;
}
