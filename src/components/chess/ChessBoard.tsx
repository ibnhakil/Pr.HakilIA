import React, { useState, useCallback, useEffect } from 'react';
import { ChessEngine } from '../../utils/chess-engine';
import { storage } from '../../utils/storage';
import type { Square, PieceType } from '../../types/chess';

interface ChessBoardProps {
  engine: ChessEngine;
  onMove: (from: string, to: string, promotion?: PieceType) => void;
  isPlayerTurn: boolean;
  playerColor: 'white' | 'black';
  highlightMoves?: boolean;
  disabled?: boolean;
}

const PIECE_SYMBOLS = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  onMove,
  isPlayerTurn,
  playerColor,
  highlightMoves = true,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameState, setGameState] = useState(engine.getGameState());
  const [draggedPiece, setDraggedPiece] = useState<{ square: string; piece: any } | null>(null);
  const settings = storage.getSettings();

  useEffect(() => {
    setGameState(engine.getGameState());
  }, [engine]);

  const playMoveSound = useCallback(() => {
    if (settings.soundEnabled) {
      // In production, play actual sound
      console.log('♪ Move sound');
    }
  }, [settings.soundEnabled]);

  const handleSquareClick = useCallback((square: string) => {
    if (disabled || !isPlayerTurn) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (selectedSquare && legalMoves.includes(square)) {
      // Make move
      const success = onMove(selectedSquare, square);
      if (success) {
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        playMoveSound();
      }
    } else {
      // Select new square
      const piece = engine.getPieceAt(square);
      const isPlayerPiece = piece && 
        ((playerColor === 'white' && piece.color === 'w') || 
         (playerColor === 'black' && piece.color === 'b'));

      if (isPlayerPiece && gameState.turn === piece.color) {
        setSelectedSquare(square);
        setLegalMoves(engine.getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  }, [selectedSquare, legalMoves, isPlayerTurn, onMove, playerColor, engine, gameState.turn, disabled, playMoveSound]);

  const handleDragStart = useCallback((e: React.DragEvent, square: string) => {
    if (disabled || !isPlayerTurn) {
      e.preventDefault();
      return;
    }

    const piece = engine.getPieceAt(square);
    const isPlayerPiece = piece && 
      ((playerColor === 'white' && piece.color === 'w') || 
       (playerColor === 'black' && piece.color === 'b'));

    if (isPlayerPiece && gameState.turn === piece.color) {
      setDraggedPiece({ square, piece });
      setSelectedSquare(square);
      setLegalMoves(engine.getLegalMoves(square));
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
    }
  }, [disabled, isPlayerTurn, engine, playerColor, gameState.turn]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, square: string) => {
    e.preventDefault();
    
    if (draggedPiece && legalMoves.includes(square)) {
      const success = onMove(draggedPiece.square, square);
      if (success) {
        setLastMove({ from: draggedPiece.square, to: square });
        playMoveSound();
      }
    }
    
    setDraggedPiece(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [draggedPiece, legalMoves, onMove, playMoveSound]);

  const renderSquare = (square: string, piece: any, file: number, rank: number) => {
    const isLight = (file + rank) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isLegalMove = legalMoves.includes(square);
    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
    const isInCheck = gameState.inCheck && piece && piece.type === 'k' && 
                     ((piece.color === 'w' && gameState.turn === 'w') || 
                      (piece.color === 'b' && gameState.turn === 'b'));
    const isDraggedOver = draggedPiece && legalMoves.includes(square);

    let squareClasses = `
      relative w-16 h-16 flex items-center justify-center cursor-pointer
      transition-all duration-200 hover:brightness-110
      ${isLight ? 'bg-chess-light' : 'bg-chess-dark'}
      ${isSelected ? 'ring-4 ring-chess-selected ring-inset shadow-lg' : ''}
      ${isLastMove ? 'ring-2 ring-accent-500 ring-inset' : ''}
      ${isInCheck ? 'bg-chess-check animate-pulse-soft' : ''}
      ${isDraggedOver ? 'brightness-125 scale-105' : ''}
    `;

    return (
      <div
        key={square}
        className={squareClasses}
        onClick={() => handleSquareClick(square)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, square)}
      >
        {isLegalMove && highlightMoves && (
          <div className={`absolute inset-0 flex items-center justify-center ${piece ? 'ring-4 ring-chess-capture ring-inset' : ''}`}>
            {!piece && <div className="w-4 h-4 bg-chess-move rounded-full opacity-70 animate-pulse-soft" />}
          </div>
        )}
        
        {piece && (
          <span 
            className="text-4xl select-none relative z-10 transition-transform duration-200 hover:scale-110 cursor-grab active:cursor-grabbing"
            draggable={!disabled && isPlayerTurn}
            onDragStart={(e) => handleDragStart(e, square)}
          >
            {PIECE_SYMBOLS[`${piece.color}${piece.type}` as keyof typeof PIECE_SYMBOLS]}
          </span>
        )}
        
        {/* Coordinates */}
        {settings.showCoordinates && (
          <>
            {rank === (playerColor === 'white' ? 7 : 0) && (
              <span className="absolute bottom-1 right-1 text-xs font-medium text-secondary-600 opacity-70">
                {String.fromCharCode(97 + file)}
              </span>
            )}
            {file === (playerColor === 'white' ? 0 : 7) && (
              <span className="absolute top-1 left-1 text-xs font-medium text-secondary-600 opacity-70">
                {playerColor === 'white' ? 8 - rank : rank + 1}
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBoard = () => {
    const squares = [];
    const files = playerColor === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const ranks = playerColor === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

    for (const rank of ranks) {
      for (const file of files) {
        const square = String.fromCharCode(97 + file) + (8 - rank);
        const piece = engine.getPieceAt(square);
        squares.push(renderSquare(square, piece, file, rank));
      }
    }

    return squares;
  };

  return (
    <div className="inline-block p-6 bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl shadow-2xl">
      <div className="grid grid-cols-8 gap-0 border-4 border-secondary-700 rounded-lg overflow-hidden shadow-inner">
        {renderBoard()}
      </div>
      
      {gameState.gameOver && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-lg text-center animate-slide-up">
          <div className="text-2xl mb-2">
            {gameState.inCheckmate ? '👑' : gameState.inStalemate ? '🤝' : '🏁'}
          </div>
          <p className="font-semibold text-lg text-secondary-900 font-playfair">
            {gameState.inCheckmate 
              ? `Échec et mat ! ${gameState.turn === 'w' ? 'Les noirs' : 'Les blancs'} gagnent !`
              : gameState.inStalemate
              ? 'Pat ! Match nul.'
              : gameState.inDraw
              ? 'Match nul !'
              : 'Partie terminée'
            }
          </p>
        </div>
      )}
    </div>
  );
};