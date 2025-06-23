import type { PlayerStats, GameRecord, Achievement, ProfessorHakilIA } from '../types/chess';

const STORAGE_KEYS = {
  PLAYER_NAME: 'mathischess_player_name',
  PLAYER_STATS: 'mathischess_player_stats',
  GAME_HISTORY: 'mathischess_game_history',
  SETTINGS: 'mathischess_settings',
  PROFESSOR_STATE: 'mathischess_professor_state',
  ACHIEVEMENTS: 'mathischess_achievements',
} as const;

export interface Settings {
  soundEnabled: boolean;
  aiCoachEnabled: boolean;
  boardTheme: 'classic' | 'modern' | 'wooden' | 'marble' | 'glass' | 'neon';
  pieceStyle: 'traditional' | 'modern' | 'minimalist' | 'ornate';
  animationSpeed: 'slow' | 'normal' | 'fast';
  showCoordinates: boolean;
  highlightMoves: boolean;
  autoQueen: boolean;
  confirmMoves: boolean;
  volume: number;
}

class StorageManager {
  getPlayerName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
  }

  setPlayerName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
  }

  getPlayerStats(): PlayerStats {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse player stats:', error);
      }
    }
    
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentRating: 1200,
      peakRating: 1200,
      ratingHistory: [{ date: Date.now(), rating: 1200 }],
      averageAccuracy: 0,
      favoriteOpenings: [],
      achievements: [],
      totalPlayTime: 0,
      winStreak: 0,
      bestWinStreak: 0,
    };
  }

  updatePlayerStats(stats: Partial<PlayerStats>): void {
    const currentStats = this.getPlayerStats();
    const updatedStats = { ...currentStats, ...stats };
    
    // Update peak rating if necessary
    if (updatedStats.currentRating > updatedStats.peakRating) {
      updatedStats.peakRating = updatedStats.currentRating;
    }
    
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(updatedStats));
  }

  addGameRecord(game: GameRecord): void {
    const games = this.getGameHistory();
    games.unshift(game);
    
    // Keep only last 200 games
    if (games.length > 200) {
      games.splice(200);
    }
    
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(games));
    
    // Update stats
    this.updateStatsFromGame(game);
  }

  private updateStatsFromGame(game: GameRecord): void {
    const stats = this.getPlayerStats();
    
    stats.gamesPlayed += 1;
    stats.totalPlayTime += game.duration;
    
    if (game.result === 'win') {
      stats.wins += 1;
      stats.winStreak += 1;
      if (stats.winStreak > stats.bestWinStreak) {
        stats.bestWinStreak = stats.winStreak;
      }
    } else {
      stats.winStreak = 0;
      if (game.result === 'loss') {
        stats.losses += 1;
      } else {
        stats.draws += 1;
      }
    }
    
    // Update rating (simplified ELO calculation)
    const ratingChange = this.calculateRatingChange(game.result, game.accuracy);
    stats.currentRating = Math.max(100, stats.currentRating + ratingChange);
    stats.ratingHistory.push({ date: game.date, rating: stats.currentRating });
    
    // Update average accuracy
    const totalAccuracy = (stats.averageAccuracy * (stats.gamesPlayed - 1)) + game.accuracy;
    stats.averageAccuracy = totalAccuracy / stats.gamesPlayed;
    
    this.updatePlayerStats(stats);
    this.checkAchievements(stats, game);
  }

  private calculateRatingChange(result: 'win' | 'loss' | 'draw', accuracy: number): number {
    let baseChange = 0;
    
    switch (result) {
      case 'win': baseChange = 25; break;
      case 'loss': baseChange = -20; break;
      case 'draw': baseChange = 0; break;
    }
    
    // Adjust based on accuracy
    const accuracyBonus = (accuracy - 70) * 0.3;
    return Math.round(baseChange + accuracyBonus);
  }

  private checkAchievements(stats: PlayerStats, game: GameRecord): void {
    const achievements: Achievement[] = [
      {
        id: 'first_win',
        name: 'Première Victoire',
        description: 'Remporter votre première partie',
        icon: '🏆',
      },
      {
        id: 'win_streak_5',
        name: 'Série de 5',
        description: 'Gagner 5 parties consécutives',
        icon: '🔥',
      },
      {
        id: 'accuracy_master',
        name: 'Maître de Précision',
        description: 'Atteindre 90% de précision dans une partie',
        icon: '🎯',
      },
      {
        id: 'rating_1500',
        name: 'Expert',
        description: 'Atteindre 1500 points ELO',
        icon: '⭐',
      },
    ];

    achievements.forEach(achievement => {
      if (!stats.achievements.find(a => a.id === achievement.id)) {
        let shouldUnlock = false;
        
        switch (achievement.id) {
          case 'first_win':
            shouldUnlock = stats.wins >= 1;
            break;
          case 'win_streak_5':
            shouldUnlock = stats.winStreak >= 5;
            break;
          case 'accuracy_master':
            shouldUnlock = game.accuracy >= 90;
            break;
          case 'rating_1500':
            shouldUnlock = stats.currentRating >= 1500;
            break;
        }
        
        if (shouldUnlock) {
          achievement.unlockedAt = Date.now();
          stats.achievements.push(achievement);
        }
      }
    });
  }

  getGameHistory(): GameRecord[] {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse game history:', error);
      }
    }
    return [];
  }

  getSettings(): Settings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
    
    return {
      soundEnabled: true,
      aiCoachEnabled: true,
      boardTheme: 'classic',
      pieceStyle: 'traditional',
      animationSpeed: 'normal',
      showCoordinates: true,
      highlightMoves: true,
      autoQueen: false,
      confirmMoves: false,
      volume: 0.7,
    };
  }

  updateSettings(settings: Partial<Settings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  }

  getProfessorState(): ProfessorHakilIA {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFESSOR_STATE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse professor state:', error);
      }
    }
    
    return {
      mood: 'neutral',
      lastComment: "Bienvenue ! Je suis Pr.HakilIA, votre coach personnel. La stratégie, c'est l'art de ne pas paniquer.",
      commentHistory: [],
    };
  }

  updateProfessorState(state: Partial<ProfessorHakilIA>): void {
    const currentState = this.getProfessorState();
    const updatedState = { ...currentState, ...state };
    localStorage.setItem(STORAGE_KEYS.PROFESSOR_STATE, JSON.stringify(updatedState));
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      playerName: this.getPlayerName(),
      playerStats: this.getPlayerStats(),
      gameHistory: this.getGameHistory(),
      settings: this.getSettings(),
      professorState: this.getProfessorState(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.playerName) this.setPlayerName(data.playerName);
      if (data.playerStats) localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(data.playerStats));
      if (data.gameHistory) localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(data.gameHistory));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.professorState) localStorage.setItem(STORAGE_KEYS.PROFESSOR_STATE, JSON.stringify(data.professorState));
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storage = new StorageManager();