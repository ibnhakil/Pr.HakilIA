import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/game/WelcomeScreen';
import { GameSetup } from './components/game/GameSetup';
import { GameInterface } from './components/game/GameInterface';
import { storage } from './utils/storage';
import type { GameMode } from './types/chess';

function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'setup' | 'game'>('welcome');
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [playerName, setPlayerName] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Load player name from storage
    const storedName = storage.getPlayerName();
    if (storedName) {
      setPlayerName(storedName);
      setShowWelcome(false);
      setCurrentView('setup');
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setCurrentView('setup');
  };

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    storage.setPlayerName(name);
  };

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentView('game');
  };

  const handleBackToMenu = () => {
    setCurrentView('setup');
  };

  return (
    <div className="font-inter min-h-screen">
      {showWelcome && currentView === 'welcome' && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      
      {currentView === 'setup' && (
        <GameSetup
          playerName={playerName}
          onPlayerNameChange={handlePlayerNameChange}
          onStartGame={handleStartGame}
          isVisible={!showWelcome}
        />
      )}
      
      {currentView === 'game' && (
        <GameInterface
          gameMode={gameMode}
          playerName={playerName}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;