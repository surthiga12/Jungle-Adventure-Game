export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  totalDaysPlayed: number;
  streakBrokenDate?: string;
}

export class StreakManager {
  private readonly STORAGE_KEY = 'jungle_adventure_streak';

  getStreak(): DailyStreak {
    if (typeof window === 'undefined') {
      return this.getDefaultStreak();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.getDefaultStreak();
      
      const streak = JSON.parse(stored) as DailyStreak;
      return this.validateAndUpdateStreak(streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
      return this.getDefaultStreak();
    }
  }

  private getDefaultStreak(): DailyStreak {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      totalDaysPlayed: 0
    };
  }

  private validateAndUpdateStreak(streak: DailyStreak): DailyStreak {
    const today = this.getTodayString();
    const lastPlayed = streak.lastPlayedDate;

    if (!lastPlayed) {
      // First time playing
      return streak;
    }

    const daysDiff = this.getDaysDifference(lastPlayed, today);

    if (daysDiff > 1) {
      // Streak broken - more than 1 day gap
      return {
        ...streak,
        currentStreak: 0,
        streakBrokenDate: today
      };
    }

    return streak;
  }

  recordPlay(): DailyStreak {
    const current = this.getStreak();
    const today = this.getTodayString();

    // If already played today, just return current streak
    if (current.lastPlayedDate === today) {
      return current;
    }

    const daysDiff = current.lastPlayedDate ? 
      this.getDaysDifference(current.lastPlayedDate, today) : 1;

    let newStreak: DailyStreak;

    if (daysDiff === 1) {
      // Consecutive day - increment streak
      newStreak = {
        ...current,
        currentStreak: current.currentStreak + 1,
        longestStreak: Math.max(current.longestStreak, current.currentStreak + 1),
        lastPlayedDate: today,
        totalDaysPlayed: current.totalDaysPlayed + 1
      };
    } else {
      // First day or after a break - start new streak
      newStreak = {
        ...current,
        currentStreak: 1,
        longestStreak: Math.max(current.longestStreak, 1),
        lastPlayedDate: today,
        totalDaysPlayed: current.totalDaysPlayed + 1
      };
    }

    this.saveStreak(newStreak);
    return newStreak;
  }

  private saveStreak(streak: DailyStreak): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStreakBonus(streak: number): number {
    // Bonus coins based on streak
    if (streak >= 30) return 100; // Monthly streak
    if (streak >= 7) return 50;   // Weekly streak
    if (streak >= 3) return 20;   // Short streak
    return 0;
  }

  getStreakMessage(streak: DailyStreak): string {
    if (streak.currentStreak === 0) {
      return "Start your coding journey today! 🚀";
    } else if (streak.currentStreak === 1) {
      return "Great start! Come back tomorrow to build your streak! 🌟";
    } else if (streak.currentStreak < 7) {
      return `${streak.currentStreak} days strong! Keep going! 🔥`;
    } else if (streak.currentStreak < 30) {
      return `Amazing ${streak.currentStreak}-day streak! You're on fire! 🔥🔥`;
    } else {
      return `Incredible ${streak.currentStreak}-day streak! You're a coding master! 👑`;
    }
  }

  getStreakEmoji(streak: number): string {
    if (streak >= 30) return '👑';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '🌟';
    if (streak >= 1) return '✨';
    return '🚀';
  }
}
