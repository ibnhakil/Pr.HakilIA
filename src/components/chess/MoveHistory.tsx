import React from 'react';
import { RotateCcw, Download, Clock, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import type { GameState } from '../../types/chess';

interface MoveHistoryProps {
  gameState: GameState;
  onUndoMove?: () => void;
  canUndo?: boolean;
  playerName?: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  gameState,
  onUndoMove,
  canUndo = false,
  playerName,
}) => {
  const formatMoveHistory = () => {
    const moves = gameState.moveHistory;
    const pairs: Array<{ white: any; black?: any; moveNumber: number }> = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moves[i] || null,
        black: moves[i + 1] || null,
      });
    }
    
    return pairs;
  };

  const exportPGN = () => {
    const moves = gameState.moveHistory.map(move => move.san).join(' ');
    const date = new Date().toISOString().split('T')[0];
    const pgn = `[Event "MathisChess Game"]
[Site "MathisChess"]
[Date "${date}"]
[Round "1"]
[White "${playerName || 'Joueur'}"]
[Black "Pr.HakilIA"]
[Result "*"]

${moves}`;
    
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathischess-game-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMoveQualityIcon = (quality?: string) => {
    switch (quality) {
      case 'brilliant': return '💎';
      case 'excellent': return '✨';
      case 'good': return '✅';
      case 'inaccurate': return '⚠️';
      case 'mistake': return '❌';
      case 'blunder': return '💥';
      default: return '';
    }
  };

  const getMoveQualityColor = (quality?: string) => {
    switch (quality) {
      case 'brilliant': return 'text-purple-600';
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'inaccurate': return 'text-yellow-600';
      case 'mistake': return 'text-orange-600';
      case 'blunder': return 'text-red-600';
      default: return 'text-secondary-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-900 font-playfair flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          Historique
        </h3>
        <div className="flex gap-2">
          {canUndo && onUndoMove && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={onUndoMove}
              className="text-secondary-600 hover:text-secondary-800"
            >
              Annuler
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={exportPGN}
            className="text-secondary-600 hover:text-secondary-800"
          >
            PGN
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {gameState.moveHistory.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucun coup joué</p>
            <p className="text-sm text-secondary-400 mt-2">L'histoire commence ici...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {formatMoveHistory().map((pair, index) => (
              <div key={index} className="flex items-center py-3 px-4 rounded-lg hover:bg-secondary-50 transition-colors">
                <span className="w-8 text-sm font-medium text-secondary-600 font-mono">
                  {pair.moveNumber}.
                </span>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">
                      {pair.white?.san || ''}
                    </span>
                    {pair.white?.quality && (
                      <span className={`text-xs ${getMoveQualityColor(pair.white.quality)}`}>
                        {getMoveQualityIcon(pair.white.quality)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">
                      {pair.black?.san || ''}
                    </span>
                    {pair.black?.quality && (
                      <span className={`text-xs ${getMoveQualityColor(pair.black.quality)}`}>
                        {getMoveQualityIcon(pair.black.quality)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-secondary-50 rounded-lg p-3">
            <span className="text-secondary-600 block text-xs uppercase tracking-wide">Coups</span>
            <p className="font-semibold text-lg text-secondary-900">{gameState.moveHistory.length}</p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-3">
            <span className="text-secondary-600 block text-xs uppercase tracking-wide">Tour</span>
            <p className="font-semibold text-lg text-secondary-900">
              {gameState.turn === 'w' ? 'Blancs' : 'Noirs'}
            </p>
          </div>
        </div>
        
        {gameState.inCheck && (
          <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-error-700 font-medium text-center animate-pulse-soft">
              ⚠️ Échec !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};