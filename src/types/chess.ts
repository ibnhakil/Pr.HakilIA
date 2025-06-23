export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  gameOver: boolean;
  inCheck: boolean;
  inCheckmate: boolean;
  inStalemate: boolean;
  inDraw: boolean;
  moves: string[];
  moveHistory: Array<{
    move: string;
    fen: string;
    san: string;
    timestamp: number;
    evaluation?: number;
    quality?: MoveQuality;
  }>;
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
}

export interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  rating?: number;
  avatar?: string;
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameState: GameState;
  createdAt: number;
  isPrivate: boolean;
  timeControl?: {
    initial: number;
    increment: number;
  };
}

export interface AIAnalysis {
  evaluation: number;
  bestMove?: string;
  principalVariation: string[];
  depth: number;
  commentary: string;
  moveQuality: MoveQuality;
  threats?: string[];
  suggestions?: string[];
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentRating: number;
  peakRating: number;
  ratingHistory: Array<{ date: number; rating: number }>;
  averageAccuracy: number;
  favoriteOpenings: string[];
  achievements: Achievement[];
  totalPlayTime: number;
  winStreak: number;
  bestWinStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface GameRecord {
  id: string;
  date: number;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  playerColor: 'white' | 'black';
  moves: string[];
  duration: number;
  accuracy: number;
  opening: string;
  finalPosition: string;
  keyMoments: Array<{
    moveNumber: number;
    evaluation: number;
    comment: string;
  }>;
}

export interface ProfessorHakilIA {
  mood: 'encouraging' | 'analytical' | 'concerned' | 'impressed' | 'neutral';
  lastComment: string;
  commentHistory: Array<{
    move: string;
    comment: string;
    mood: string;
    timestamp: number;
  }>;
}

export type GameMode = 'ai' | 'online' | 'analysis' | 'training';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string;
export type MoveQuality = 'brilliant' | 'excellent' | 'good' | 'inaccurate' | 'mistake' | 'blunder';
export type BoardTheme = 'classic' | 'modern' | 'wooden' | 'marble' | 'glass' | 'neon';
export type PieceStyle = 'traditional' | 'modern' | 'minimalist' | 'ornate';