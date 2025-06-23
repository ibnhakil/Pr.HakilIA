import React, { useState } from 'react';
import { User, Bot, Users, Settings, Play, Crown, Zap, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { GameMode } from '../../types/chess';

interface GameSetupProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onStartGame: (mode: GameMode) => void;
  isVisible: boolean;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  playerName,
  onPlayerNameChange,
  onStartGame,
  isVisible,
}) => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onPlayerNameChange(tempName.trim());
      setShowNameModal(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-6 animate-float">
            <Crown className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-secondary-900 mb-2 font-playfair">MathisChess</h1>
          <p className="text-secondary-600 text-lg">Échecs Intelligents</p>
          <div className="mt-2 text-sm text-secondary-500 italic">
            "La stratégie, c'est l'art de ne pas paniquer."
          </div>
        </div>

        {/* Player Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-200">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-secondary-600 font-medium">Joueur</p>
              <p className="font-semibold text-secondary-900 text-lg">{playerName || 'Anonyme'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              onClick={() => setShowNameModal(true)}
              className="text-secondary-600 hover:text-secondary-800"
            >
              Modifier
            </Button>
          </div>
        </div>

        {/* Game Modes */}
        <div className="space-y-4">
          <Button
            onClick={() => onStartGame('ai')}
            className="w-full justify-start bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Jouer contre Pr.HakilIA</div>
                <div className="text-sm opacity-90">Coach intelligent • Analyse en temps réel</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onStartGame('online')}
            variant="secondary"
            className="w-full justify-start bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Multijoueur en ligne</div>
                <div className="text-sm opacity-90">Affronter d'autres joueurs • Temps réel</div>
              </div>
            </div>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onStartGame('training')}
              variant="outline"
              className="justify-start border-2 border-accent-300 text-accent-700 hover:bg-accent-50 hover:border-accent-400 transform hover:scale-105 transition-all duration-200"
              size="md"
            >
              <div className="text-center w-full">
                <Zap className="w-6 h-6 mx-auto mb-1" />
                <div className="font-medium">Entraînement</div>
                <div className="text-xs opacity-80">Défis tactiques</div>
              </div>
            </Button>

            <Button
              onClick={() => onStartGame('analysis')}
              variant="outline"
              className="justify-start border-2 border-success-300 text-success-700 hover:bg-success-50 hover:border-success-400 transform hover:scale-105 transition-all duration-200"
              size="md"
            >
              <div className="text-center w-full">
                <BarChart3 className="w-6 h-6 mx-auto mb-1" />
                <div className="font-medium">Analyse</div>
                <div className="text-xs opacity-80">Étudier des parties</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-secondary-500">
          Développé avec ❤️ pour les passionnés d'échecs
        </div>

        {/* Name Modal */}
        <Modal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          title="Personnaliser votre profil"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Comment souhaitez-vous être appelé ?
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="Votre prénom ou pseudo"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-secondary-500 mt-2">
                Pr.HakilIA utilisera ce nom pour vous parler personnellement
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNameModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleNameSubmit}
                className="flex-1"
                disabled={!tempName.trim()}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};