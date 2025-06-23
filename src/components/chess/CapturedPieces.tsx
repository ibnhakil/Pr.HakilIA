import React from 'react';
import { Crown } from 'lucide-react';
import type { PieceType } from '../../types/chess';

interface CapturedPiecesProps {
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
  playerColor: 'white' | 'black';
}

const PIECE_SYMBOLS = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
};

const PIECE_VALUES = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  capturedPieces,
  playerColor,
}) => {
  const calculateMaterialAdvantage = () => {
    const whiteValue = capturedPieces.black.reduce((sum, piece) => sum + PIECE_VALUES[piece], 0);
    const blackValue = capturedPieces.white.reduce((sum, piece) => sum + PIECE_VALUES[piece], 0);
    
    return {
      white: whiteValue - blackValue,
      black: blackValue - whiteValue,
    };
  };

  const advantage = calculateMaterialAdvantage();

  const renderCapturedPieces = (pieces: PieceType[], color: 'white' | 'black') => {
    const sortedPieces = [...pieces].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
    
    return (
      <div className="flex flex-wrap gap-1">
        {sortedPieces.map((piece, index) => (
          <span 
            key={index} 
            className={`text-lg ${color === 'white' ? 'text-secondary-800' : 'text-secondary-600'} opacity-80`}
          >
            {PIECE_SYMBOLS[piece]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-accent-600" />
        <h3 className="font-semibold text-secondary-900 font-playfair">Captures</h3>
      </div>

      {/* Player's captures (opponent's pieces) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-secondary-700">
            {playerColor === 'white' ? 'Vos captures' : 'Captures adverses'}
          </span>
          {advantage[playerColor] > 0 && (
            <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full font-medium">
              +{advantage[playerColor]}
            </span>
          )}
        </div>
        <div className="min-h-[32px] p-2 bg-secondary-50 rounded-lg">
          {renderCapturedPieces(
            playerColor === 'white' ? capturedPieces.black : capturedPieces.white,
            playerColor === 'white' ? 'black' : 'white'
          )}
        </div>
      </div>

      {/* Opponent's captures (player's pieces) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-secondary-700">
            {playerColor === 'white' ? 'Captures adverses' : 'Vos captures'}
          </span>
          {advantage[playerColor === 'white' ? 'black' : 'white'] > 0 && (
            <span className="text-xs bg-error-100 text-error-700 px-2 py-1 rounded-full font-medium">
              +{advantage[playerColor === 'white' ? 'black' : 'white']}
            </span>
          )}
        </div>
        <div className="min-h-[32px] p-2 bg-secondary-50 rounded-lg">
          {renderCapturedPieces(
            playerColor === 'white' ? capturedPieces.white : capturedPieces.black,
            playerColor === 'white' ? 'white' : 'black'
          )}
        </div>
      </div>

      {/* Material balance */}
      <div className="pt-3 border-t border-secondary-200">
        <div className="text-center">
          <span className="text-xs text-secondary-600 uppercase tracking-wide">Balance matérielle</span>
          <div className="mt-1">
            {Math.abs(advantage.white) === 0 ? (
              <span className="text-sm font-medium text-secondary-700">Équilibrée</span>
            ) : advantage.white > 0 ? (
              <span className="text-sm font-medium text-success-700">
                Blancs +{advantage.white}
              </span>
            ) : (
              <span className="text-sm font-medium text-error-700">
                Noirs +{advantage.black}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};