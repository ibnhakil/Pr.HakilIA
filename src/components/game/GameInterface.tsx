import React, { useState, useEffect, useCallback } from 'react';
import { Home, BarChart3, RefreshCw, Flag, Settings, Crown, Clock } from 'lucide-react';
import { ChessBoard } from '../chess/ChessBoard';
import { MoveHistory } from '../chess/MoveHistory';
import { CapturedPieces } from '../chess/CapturedPieces';
import { ProfessorHakilIA } from '../ai/ProfessorHakilIA';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ChessEngine } from '../../utils/chess-engine';
import { storage } from '../../utils/storage';
import type { GameMode, AIAnalysis, GameState, PieceType, ProfessorHakilIA as ProfessorState } from '../../types/chess';

interface GameInterfaceProps {
  gameMode: GameMode;
  playerName: string;
  onBackToMenu: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameMode,
  playerName,
  onBackToMenu,
}) => {
  const [engine] = useState(() => new ChessEngine());
  const [gameState, setGameState] = useState<GameState>(engine.getGameState());
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerColor] = useState<'white' | 'black'>('white');
  const [showResignModal, setShowResignModal] = useState(false);
  const [gameStartTime] = useState(Date.now());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [professorState, setProfessorState] = useState<ProfessorState>(storage.getProfessorState());
  const settings = storage.getSettings();

  const updateGameState = useCallback(() => {
    const newState = engine.getGameState();
    setGameState(newState);
    setIsPlayerTurn(newState.turn === (playerColor === 'white' ? 'w' : 'b'));
  }, [engine, playerColor]);

  const analyzePosition = useCallback(async () => {
    if (gameMode === 'ai' && settings.aiCoachEnabled && !gameState.gameOver) {
      setIsAnalyzing(true);
      try {
        const analysis = await engine.analyzePosition();
        setCurrentAnalysis(analysis);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [engine, gameMode, settings.aiCoachEnabled, gameState.gameOver]);

  const makeAIMove = useCallback(async () => {
    if (gameMode !== 'ai' || gameState.gameOver || isPlayerTurn) return;

    // AI thinking time simulation
    const thinkingTime = 1000 + Math.random() * 2000;
    
    setTimeout(async () => {
      try {
        const moves = engine.getLegalMoves();
        if (moves.length > 0) {
          // Simple AI: random move with slight preference for captures
          const captureMoves = moves.filter(move => {
            const from = move.substring(0, 2);
            const to = move.substring(2, 4);
            return engine.getPieceAt(to) !== null;
          });
          
          const selectedMoves = captureMoves.length > 0 && Math.random() > 0.3 ? captureMoves : moves;
          const randomMove = selectedMoves[Math.floor(Math.random() * selectedMoves.length)];
          
          if (randomMove.length >= 4) {
            const from = randomMove.substring(0, 2);
            const to = randomMove.substring(2, 4);
            const promotion = randomMove.length > 4 ? randomMove[4] as PieceType : undefined;
            
            const success = engine.makeMove(from, to, promotion);
            if (success) {
              updateGameState();
              analyzePosition();
            }
          }
        }
      } catch (error) {
        console.error('AI move failed:', error);
      }
    }, thinkingTime);
  }, [engine, gameMode, gameState.gameOver, isPlayerTurn, updateGameState, analyzePosition]);

  const handleMove = useCallback((from: string, to: string, promotion?: PieceType) => {
    const success = engine.makeMove(from, to, promotion);
    if (success) {
      updateGameState();
      analyzePosition();
    }
    return success;
  }, [engine, updateGameState, analyzePosition]);

  const handleUndoMove = useCallback(() => {
    if (gameMode === 'ai') {
      // Undo both AI and player moves
      engine.undoMove(); // AI move
      engine.undoMove(); // Player move
      updateGameState();
      analyzePosition();
    }
  }, [engine, gameMode, updateGameState, analyzePosition]);

  const handleResign = useCallback(() => {
    // Record game result
    const gameRecord = {
      id: Date.now().toString(),
      date: Date.now(),
      result: 'loss' as const,
      opponent: gameMode === 'ai' ? 'Pr.HakilIA' : 'Joueur en ligne',
      playerColor,
      moves: gameState.moveHistory.map(m => m.san),
      duration: Date.now() - gameStartTime,
      accuracy: Math.random() * 30 + 60, // Simulate accuracy
      opening: 'Ouverture inconnue',
      finalPosition: engine.getGameState().fen,
      keyMoments: [],
    };
    
    storage.addGameRecord(gameRecord);
    
    setShowResignModal(false);
    onBackToMenu();
  }, [gameState, gameMode, gameStartTime, onBackToMenu, playerColor, engine]);

  const handleNewGame = useCallback(() => {
    engine.reset();
    updateGameState();
    setCurrentAnalysis(null);
    setProfessorState(prev => ({
      ...prev,
      mood: 'neutral',
      lastComment: "Nouvelle partie ! Montrez-moi ce dont vous êtes capable.",
      commentHistory: [],
    }));
  }, [engine, updateGameState]);

  const handleProfessorStateUpdate = useCallback((update: Partial<ProfessorState>) => {
    setProfessorState(prev => {
      const newState = { ...prev, ...update };
      storage.updateProfessorState(newState);
      return newState;
    });
  }, []);

  // AI move effect
  useEffect(() => {
    makeAIMove();
  }, [makeAIMove]);

  // Initial analysis
  useEffect(() => {
    analyzePosition();
  }, [analyzePosition]);

  const getGameModeTitle = () => {
    switch (gameMode) {
      case 'ai': return 'Contre Pr.HakilIA';
      case 'online': return 'Multijoueur';
      case 'training': return 'Entraînement';
      case 'analysis': return 'Mode Analyse';
      default: return 'MathisChess';
    }
  };

  const getGameModeIcon = () => {
    switch (gameMode) {
      case 'ai': return Crown;
      case 'online': return Clock;
      case 'training': return BarChart3;
      case 'analysis': return BarChart3;
      default: return Crown;
    }
  };

  const GameModeIcon = getGameModeIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                icon={Home}
                onClick={onBackToMenu}
                className="text-secondary-600 hover:text-secondary-800"
              >
                Menu Principal
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                  <GameModeIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900 font-playfair">MathisChess</h1>
                  <p className="text-sm text-secondary-600">{getGameModeTitle()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-sm text-secondary-600">Joueur</p>
                <p className="font-semibold text-secondary-900">{playerName}</p>
              </div>
              
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-primary-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Analyse...</span>
                </div>
              )}
              
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={handleNewGame}
                size="sm"
                className="text-secondary-600 hover:text-secondary-800"
              >
                Nouvelle partie
              </Button>
              <Button
                variant="outline"
                icon={Flag}
                onClick={() => setShowResignModal(true)}
                size="sm"
                className="text-error-600 hover:text-error-700"
              >
                Abandonner
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Move History & Captured Pieces */}
          <div className="lg:col-span-3 space-y-6">
            <MoveHistory
              gameState={gameState}
              onUndoMove={gameMode === 'ai' ? handleUndoMove : undefined}
              canUndo={gameMode === 'ai' && gameState.moveHistory.length > 0}
              playerName={playerName}
            />
            <CapturedPieces
              capturedPieces={gameState.capturedPieces}
              playerColor={playerColor}
            />
          </div>

          {/* Center - Chess Board */}
          <div className="lg:col-span-6 flex justify-center">
            <ChessBoard
              engine={engine}
              onMove={handleMove}
              isPlayerTurn={isPlayerTurn}
              playerColor={playerColor}
              highlightMoves={settings.highlightMoves}
              disabled={gameState.gameOver}
            />
          </div>

          {/* Right Panel - Professor HakilIA */}
          <div className="lg:col-span-3">
            <ProfessorHakilIA
              analysis={currentAnalysis}
              gameState={gameState}
              playerName={playerName}
              isEnabled={gameMode === 'ai' && settings.aiCoachEnabled}
              professorState={professorState}
              onStateUpdate={handleProfessorStateUpdate}
            />
          </div>
        </div>
      </main>

      {/* Resign Modal */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title="Abandonner la partie"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Flag className="w-8 h-8 text-error-600" />
            </div>
            <p className="text-secondary-700 text-lg">
              Êtes-vous sûr de vouloir abandonner cette partie ?
            </p>
            <p className="text-sm text-secondary-500 mt-2">
              Cette action ne peut pas être annulée et sera comptabilisée comme une défaite.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResignModal(false)}
              className="flex-1"
            >
              Continuer à jouer
            </Button>
            <Button
              variant="danger"
              onClick={handleResign}
              className="flex-1"
            >
              Abandonner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};