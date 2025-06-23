import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, TrendingUp, Lightbulb, Volume2, Eye, Brain } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AIAnalysis, GameState, ProfessorHakilIA as ProfessorState } from '../../types/chess';

interface ProfessorHakilIAProps {
  analysis: AIAnalysis | null;
  gameState: GameState;
  playerName: string;
  isEnabled: boolean;
  professorState: ProfessorState;
  onStateUpdate: (state: Partial<ProfessorState>) => void;
}

export const ProfessorHakilIA: React.FC<ProfessorHakilIAProps> = ({
  analysis,
  gameState,
  playerName,
  isEnabled,
  professorState,
  onStateUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (analysis && isEnabled) {
      setIsAnimating(true);
      
      const newComment = {
        move: gameState.moveHistory[gameState.moveHistory.length - 1]?.san || '',
        comment: analysis.commentary,
        mood: determineMood(analysis.moveQuality, analysis.evaluation),
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newComment, ...professorState.commentHistory.slice(0, 9)];
      
      onStateUpdate({
        mood: newComment.mood as any,
        lastComment: analysis.commentary,
        commentHistory: updatedHistory,
      });

      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [analysis, isEnabled, gameState.moveHistory, onStateUpdate, professorState.commentHistory]);

  const determineMood = (quality: string, evaluation: number): string => {
    if (quality === 'brilliant' || quality === 'excellent') return 'impressed';
    if (quality === 'blunder' || quality === 'mistake') return 'concerned';
    if (Math.abs(evaluation) > 2) return 'analytical';
    return 'encouraging';
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'impressed': return '🤩';
      case 'concerned': return '😟';
      case 'analytical': return '🤔';
      case 'encouraging': return '😊';
      default: return '🎓';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'impressed': return 'text-purple-600 bg-purple-50';
      case 'concerned': return 'text-red-600 bg-red-50';
      case 'analytical': return 'text-blue-600 bg-blue-50';
      case 'encouraging': return 'text-green-600 bg-green-50';
      default: return 'text-primary-600 bg-primary-50';
    }
  };

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 2) return 'text-green-600';
    if (evaluation > 1) return 'text-green-500';
    if (evaluation > 0.5) return 'text-green-400';
    if (evaluation > -0.5) return 'text-yellow-500';
    if (evaluation > -1) return 'text-orange-500';
    if (evaluation > -2) return 'text-red-500';
    return 'text-red-600';
  };

  const formatEvaluation = (evaluation: number) => {
    if (Math.abs(evaluation) < 0.1) return '=';
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  };

  const getMoveQualityIcon = (quality: string) => {
    switch (quality) {
      case 'brilliant': return '💎';
      case 'excellent': return '✨';
      case 'good': return '✅';
      case 'inaccurate': return '⚠️';
      case 'mistake': return '❌';
      case 'blunder': return '💥';
      default: return '🤔';
    }
  };

  if (!isEnabled) {
    return (
      <div className="bg-secondary-100 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-secondary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Bot className="h-8 w-8 text-secondary-400" />
        </div>
        <p className="text-secondary-600 font-medium">Pr.HakilIA en pause</p>
        <p className="text-sm text-secondary-500 mt-1">Coach désactivé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      {/* Professor Avatar & Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${getMoodColor(professorState.mood)} ${isAnimating ? 'animate-bounce-gentle' : ''}`}>
            {getMoodEmoji(professorState.mood)}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse-soft"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 font-playfair">Pr.HakilIA</h3>
            <p className="text-xs text-secondary-600">Coach Personnel</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-secondary-600"
        >
          <Eye className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </Button>
      </div>

      {isExpanded && (
        <>
          {/* Current Analysis */}
          {analysis && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">Analyse actuelle</span>
                </div>
                <span className={`text-lg font-bold ${getEvaluationColor(analysis.evaluation)}`}>
                  {formatEvaluation(analysis.evaluation)}
                </span>
              </div>
              
              {analysis.moveQuality && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getMoveQualityIcon(analysis.moveQuality)}</span>
                  <span className="text-sm text-secondary-700 capitalize font-medium">
                    {analysis.moveQuality === 'brilliant' ? 'Brillant' :
                     analysis.moveQuality === 'excellent' ? 'Excellent' :
                     analysis.moveQuality === 'good' ? 'Bon' :
                     analysis.moveQuality === 'inaccurate' ? 'Imprécis' :
                     analysis.moveQuality === 'mistake' ? 'Erreur' :
                     analysis.moveQuality === 'blunder' ? 'Gaffe' : analysis.moveQuality}
                  </span>
                </div>
              )}
              
              {analysis.bestMove && (
                <div className="text-sm text-secondary-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Meilleur coup: <span className="font-mono font-medium text-primary-700">{analysis.bestMove}</span></span>
                </div>
              )}
            </div>
          )}

          {/* Professor's Commentary */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {professorState.commentHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-accent-600" />
                </div>
                <p className="text-secondary-700 font-medium mb-2">
                  Salut {playerName} ! 👋
                </p>
                <p className="text-sm text-secondary-600 italic">
                  "La stratégie, c'est l'art de ne pas paniquer."
                </p>
                <p className="text-xs text-secondary-500 mt-2">
                  Je vais t'accompagner pendant cette partie !
                </p>
              </div>
            ) : (
              professorState.commentHistory.map((comment, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl animate-slide-in ${index === 0 ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100' : 'bg-secondary-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getMoodColor(comment.mood)}`}>
                      {getMoodEmoji(comment.mood)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.move && (
                          <span className="text-xs bg-secondary-200 text-secondary-700 px-2 py-1 rounded font-mono">
                            {comment.move}
                          </span>
                        )}
                        <span className="text-xs text-secondary-500">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-800 leading-relaxed">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Game Status */}
          <div className="mt-6 pt-4 border-t border-secondary-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-secondary-50 rounded-lg p-3 text-center">
                <span className="text-secondary-600 block text-xs uppercase tracking-wide">Statut</span>
                <p className="font-medium text-secondary-900">
                  {gameState.inCheck ? '⚠️ Échec' : gameState.gameOver ? '🏁 Terminé' : '⚡ En cours'}
                </p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-3 text-center">
                <span className="text-secondary-600 block text-xs uppercase tracking-wide">Coups</span>
                <p className="font-medium text-secondary-900">{gameState.moveHistory.length}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};