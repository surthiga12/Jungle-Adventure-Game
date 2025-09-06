import { Level, levels, badges, characters } from './gameData';

export interface GameState {
  currentLevel: number;
  completedLevels: number[];
  streak: number;
  stars: number;
  totalCoins: number;
  totalKeys: number;
  unlockedBadges: number[];
  selectedCharacter: 'boy' | 'girl';
}

const STORAGE_KEY = 'kids-adventure-game-progress';

export class GameManager {
  private state: GameState;

  constructor() {
    this.state = this.loadProgress();
  }

  private loadProgress(): GameState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...this.getDefaultState(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    
    return this.getDefaultState();
  }

  private getDefaultState(): GameState {
    return {
      currentLevel: 1,
      completedLevels: [],
      streak: 0,
      stars: 0,
      totalCoins: 0,
      totalKeys: 0,
      unlockedBadges: [],
      selectedCharacter: 'boy'
    };
  }

  private saveProgress(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  getCurrentLevel(): Level | null {
    return levels.find(level => level.id === this.state.currentLevel) || null;
  }

  getState(): GameState {
    return { ...this.state };
  }

  completeLevel(levelId: number, coinsCollected: number, keysCollected: number): { newBadges: number[] } {
    const level = levels.find(l => l.id === levelId);
    if (!level || this.state.completedLevels.includes(levelId)) {
      return { newBadges: [] };
    }

    // Update state
    this.state.completedLevels.push(levelId);
    this.state.stars += level.starReward;
    this.state.streak += 1;
    this.state.totalCoins += coinsCollected;
    this.state.totalKeys += keysCollected;
    
    // Move to next level if available
    if (levelId === this.state.currentLevel && levelId < levels.length) {
      this.state.currentLevel = levelId + 1;
    }

    // Check for new badges
    const newBadges = this.checkNewBadges();

    this.saveProgress();
    
    return { newBadges };
  }

  private checkNewBadges(): number[] {
    const newBadges: number[] = [];
    
    for (const badge of badges) {
      if (this.state.unlockedBadges.includes(badge.id)) continue;
      
      let unlocked = false;
      
      if (typeof badge.requirement === 'number') {
        unlocked = this.state.completedLevels.length >= badge.requirement;
      } else if (badge.requirement === 'collectKey') {
        unlocked = this.state.totalKeys >= 1;
      } else if (badge.requirement === 'collect10Coins') {
        unlocked = this.state.totalCoins >= 10;
      }
      
      if (unlocked) {
        this.state.unlockedBadges.push(badge.id);
        newBadges.push(badge.id);
      }
    }
    
    return newBadges;
  }

  resetStreak(): void {
    this.state.streak = 0;
    this.saveProgress();
  }

  selectCharacter(character: 'boy' | 'girl'): void {
    this.state.selectedCharacter = character;
    this.saveProgress();
  }

  resetProgress(): void {
    this.state = this.getDefaultState();
    this.saveProgress();
  }

  // Check if current level goals are met
  checkLevelCompletion(gameState: any): boolean {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return false;

    // Check if required keys and coins are collected
    const hasRequiredKeys = gameState.keysCollected >= currentLevel.requiredKeys;
    const hasRequiredCoins = gameState.score >= (currentLevel.requiredCoins * 10); // 10 points per coin
    
    // Must be at the exit
    const atExit = gameState.levelComplete;
    
    return hasRequiredKeys && hasRequiredCoins && atExit;
  }

  getLevelData(levelId: number): Level | null {
    return levels.find(level => level.id === levelId) || null;
  }
}
