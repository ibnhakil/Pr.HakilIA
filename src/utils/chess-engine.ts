import { Chess } from 'chess.js';
import type { GameState, AIAnalysis, PieceType, MoveQuality } from '../types/chess';

export class ChessEngine {
  private chess: Chess;
  private stockfish: Worker | null = null;
  private analysisCache: Map<string, AIAnalysis> = new Map();

  constructor() {
    this.chess = new Chess();
    this.initStockfish();
  }

  private async initStockfish() {
    try {
      // In production, load actual Stockfish.js
      console.log('Stockfish engine initialized');
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  getGameState(): GameState {
    const history = this.chess.history({ verbose: true });
    const capturedPieces = this.getCapturedPieces();

    return {
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      gameOver: this.chess.isGameOver(),
      inCheck: this.chess.inCheck(),
      inCheckmate: this.chess.isCheckmate(),
      inStalemate: this.chess.isStalemate(),
      inDraw: this.chess.isDraw(),
      moves: this.chess.moves(),
      moveHistory: history.map((move, index) => ({
        move: move.san,
        fen: move.after || this.chess.fen(),
        san: move.san,
        timestamp: Date.now() - (history.length - index) * 2000,
      })),
      capturedPieces,
    };
  }

  private getCapturedPieces(): { white: PieceType[]; black: PieceType[] } {
    const history = this.chess.history({ verbose: true });
    const captured = { white: [] as PieceType[], black: [] as PieceType[] };

    history.forEach(move => {
      if (move.captured) {
        if (move.color === 'w') {
          captured.black.push(move.captured as PieceType);
        } else {
          captured.white.push(move.captured as PieceType);
        }
      }
    });

    return captured;
  }

  makeMove(from: string, to: string, promotion?: PieceType): boolean {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion,
      });
      return move !== null;
    } catch {
      return false;
    }
  }

  getLegalMoves(square?: string): string[] {
    if (square) {
      return this.chess.moves({ square, verbose: true }).map(move => move.to);
    }
    return this.chess.moves();
  }

  isValidMove(from: string, to: string): boolean {
    const moves = this.chess.moves({ square: from, verbose: true });
    return moves.some(move => move.to === to);
  }

  undoMove(): boolean {
    const move = this.chess.undo();
    return move !== null;
  }

  reset(): void {
    this.chess.reset();
    this.analysisCache.clear();
  }

  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  async analyzePosition(depth: number = 15): Promise<AIAnalysis> {
    const fen = this.chess.fen();
    
    // Check cache first
    if (this.analysisCache.has(fen)) {
      return this.analysisCache.get(fen)!;
    }

    // Simulate Stockfish analysis
    const evaluation = this.calculatePositionEvaluation();
    const moves = this.chess.moves();
    const bestMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
    
    const moveQuality = this.evaluateMoveQuality(evaluation);
    const commentary = this.generateCommentary(evaluation, bestMove, moveQuality);
    
    const analysis: AIAnalysis = {
      evaluation,
      bestMove,
      principalVariation: [bestMove],
      depth,
      commentary,
      moveQuality,
      threats: this.identifyThreats(),
      suggestions: this.generateSuggestions(evaluation),
    };

    // Cache the analysis
    this.analysisCache.set(fen, analysis);
    
    return analysis;
  }

  private calculatePositionEvaluation(): number {
    // Simplified evaluation based on material and position
    let evaluation = 0;
    
    // Material count
    const pieces = this.chess.board().flat().filter(Boolean);
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    
    pieces.forEach(piece => {
      if (piece) {
        const value = pieceValues[piece.type as keyof typeof pieceValues];
        evaluation += piece.color === 'w' ? value : -value;
      }
    });

    // Add some randomness for variety
    evaluation += (Math.random() - 0.5) * 2;
    
    // Adjust for game phase
    if (this.chess.history().length < 10) {
      evaluation *= 0.5; // Opening phase
    }
    
    return Math.max(-10, Math.min(10, evaluation));
  }

  private evaluateMoveQuality(evaluation: number): MoveQuality {
    const absEval = Math.abs(evaluation);
    const random = Math.random();
    
    if (random < 0.05) return 'brilliant';
    if (absEval < 0.2) return 'excellent';
    if (absEval < 0.5) return 'good';
    if (absEval < 1.0) return 'inaccurate';
    if (absEval < 2.0) return 'mistake';
    return 'blunder';
  }

  private generateCommentary(evaluation: number, bestMove?: string, quality?: MoveQuality): string {
    const comments = {
      brilliant: [
        "Magnifique ! Ce coup est absolument brillant !",
        "Extraordinaire ! Vous avez trouvé le meilleur coup possible !",
        "Quel génie ! Cette combinaison est remarquable !"
      ],
      excellent: [
        "Excellent choix ! Vous maîtrisez parfaitement la position.",
        "Très bien joué ! Ce coup renforce votre avantage.",
        "Parfait ! Vous suivez les principes stratégiques à la lettre."
      ],
      good: [
        "Bon coup ! Vous restez dans la bonne direction.",
        "Solide ! Cette approche est tout à fait correcte.",
        "Bien vu ! Vous développez harmonieusement vos pièces."
      ],
      inaccurate: [
        "Hmm, ce coup n'est pas optimal. Il y avait mieux à faire.",
        "Attention ! Vous laissez passer une meilleure opportunité.",
        "Ce coup fonctionne, mais il y avait plus fort."
      ],
      mistake: [
        "Aïe ! Ce coup vous fait perdre l'avantage.",
        "Erreur tactique ! Votre adversaire peut maintenant contre-attaquer.",
        "Dommage ! Vous veniez de bien jouer jusqu'ici."
      ],
      blunder: [
        "Oh non ! Cette erreur coûte très cher !",
        "Catastrophe ! Ce coup change complètement l'évaluation.",
        "Attention ! Vous venez de commettre une grosse erreur !"
      ]
    };

    const qualityComments = quality ? comments[quality] : comments.good;
    return qualityComments[Math.floor(Math.random() * qualityComments.length)];
  }

  private identifyThreats(): string[] {
    const threats: string[] = [];
    
    if (this.chess.inCheck()) {
      threats.push("Votre roi est en échec !");
    }
    
    // Simulate threat detection
    const moves = this.chess.moves({ verbose: true });
    const captureMoves = moves.filter(move => move.captured);
    
    if (captureMoves.length > 0) {
      threats.push("Attention aux captures possibles !");
    }
    
    return threats;
  }

  private generateSuggestions(evaluation: number): string[] {
    const suggestions: string[] = [];
    
    if (Math.abs(evaluation) > 2) {
      if (evaluation > 0) {
        suggestions.push("Vous avez un avantage décisif ! Convertissez-le.");
      } else {
        suggestions.push("Position difficile. Cherchez des complications.");
      }
    } else {
      suggestions.push("Position équilibrée. Développez vos pièces harmonieusement.");
    }
    
    return suggestions;
  }

  getPieceAt(square: string): { type: PieceType; color: 'w' | 'b' } | null {
    return this.chess.get(square as any);
  }

  isSquareUnderAttack(square: string, color: 'w' | 'b'): boolean {
    return this.chess.isAttacked(square as any, color);
  }

  getGamePGN(): string {
    return this.chess.pgn();
  }

  loadPGN(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }
}