import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, TrendingUp, Lightbulb, Volume2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AIAnalysis, GameState } from '../../types/chess';

interface AICoachProps {
  analysis: AIAnalysis | null;
  gameState: GameState;
  playerName: string;
  isEnabled: boolean;
}

export const AICoach: React.FC<AICoachProps> = ({
  analysis,
  gameState,
  playerName,
  isEnabled,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    type: 'analysis' | 'encouragement' | 'warning';
    timestamp: number;
  }>>([]);

  useEffect(() => {
    if (analysis && isEnabled) {
      const newMessage = {
        id: Date.now().toString(),
        text: analysis.commentary,
        type: 'analysis' as const,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [newMessage, ...prev.slice(0, 4)]); // Keep last 5 messages
    }
  }, [analysis, isEnabled]);

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 1) return 'text-green-600';
    if (evaluation > 0.5) return 'text-green-500';
    if (evaluation > -0.5) return 'text-yellow-500';
    if (evaluation > -1) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatEvaluation = (evaluation: number) => {
    if (Math.abs(evaluation) < 0.1) return '=';
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  };

  const getMoveQualityIcon = (quality: AIAnalysis['moveQuality']) => {
    switch (quality) {
      case 'excellent': return '🎯';
      case 'good': return '✅';
      case 'inaccurate': return '⚠️';
      case 'mistake': return '❌';
      case 'blunder': return '💥';
      default: return '🤔';
    }
  };

  if (!isEnabled) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <Bot className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Coach IA désactivé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-6 w-6 text-primary-600" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Coach IA</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className={`h-4 w-4 ${isExpanded ? 'text-primary-600' : 'text-gray-400'}`} />
        </Button>
      </div>

      {isExpanded && (
        <>
          {/* Current Analysis */}
          {analysis && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-900">Évaluation actuelle</span>
                <span className={`text-lg font-bold ${getEvaluationColor(analysis.evaluation)}`}>
                  {formatEvaluation(analysis.evaluation)}
                </span>
              </div>
              
              {analysis.moveQuality && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getMoveQualityIcon(analysis.moveQuality)}</span>
                  <span className="text-sm text-gray-700 capitalize">{analysis.moveQuality}</span>
                </div>
              )}
              
              {analysis.bestMove && (
                <div className="text-sm text-gray-600">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  Meilleur coup: <span className="font-mono font-medium">{analysis.bestMove}</span>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Salut {playerName} ! Je vais t'accompagner pendant cette partie.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 bg-gray-50 rounded-lg animate-slide-in"
                >
                  <div className="flex items-start gap-2">
                    <Bot className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{message.text}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Game Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Statut:</span>
                <p className="font-medium">
                  {gameState.inCheck ? 'Échec!' : gameState.gameOver ? 'Terminé' : 'En cours'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Coups:</span>
                <p className="font-medium">{gameState.moveHistory.length}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};