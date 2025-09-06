'use client';

import { useState, useEffect, useCallback } from 'react';
import CharacterSelection from './components/CharacterSelection';
import BlocklyWorkspace from '../components/BlocklyWorkspace';
import GridGameCanvas from '../components/GridGameCanvas';
import { GameManager } from '../utils/gameManager';
import { SoundManager } from '../utils/soundManager';
import { GAME_LEVELS } from '../components/LevelConfig';
import { CharacterManager, Character } from '../utils/characterManager';
import { StreakManager, DailyStreak } from '../utils/streakManager';

export default function Home() {
  const [gameManager] = useState(() => new GameManager());
  const [soundManager] = useState(() => new SoundManager());
  const [characterManager] = useState(() => new CharacterManager());
  const [streakManager] = useState(() => new StreakManager());
  const [gameState, setGameState] = useState(gameManager.getState());
  const [currentLevel, setCurrentLevel] = useState(gameManager.getState().currentLevel);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [generatedCode, setGeneratedCode] = useState<any[]>([]);
  const [executeCode, setExecuteCode] = useState<any[]>([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [platformGameState, setPlatformGameState] = useState(null);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const savedCharacterId = gameManager.getState().selectedCharacter;
    if (savedCharacterId) {
      const ch = characterManager.getCharacters().find(c => c.id === savedCharacterId) || characterManager.getSelectedCharacter();
      setSelectedCharacter(ch);
      // Do NOT start the game automatically. Wait for user selection.
    }
    setGameState(gameManager.getState());
    setCurrentLevel(gameManager.getState().currentLevel);
  }, [gameManager, characterManager]);

  const handleCharacterSelected = (character: Character) => {
    setSelectedCharacter(character);
    // Persist selection in GameManager by id (boy|girl supported there)
    if (character.id === 'boy' || character.id === 'girl') {
      gameManager.selectCharacter(character.id);
    }
    setGameStarted(true); // Start the game after selection
  };

  const handleRunCode = () => {
    setExecuteCode([...generatedCode]);
  };

  const handleReset = () => {
    setExecuteCode([]);
    setGeneratedCode([]);
  };

  const handleLevelComplete = useCallback(() => {
    if (currentLevel && platformGameState) {
      const coinsCollected = (platformGameState as any).score / 10; // 10 points per coin
      const keysCollected = (platformGameState as any).keysCollected;
      
      const { newBadges } = gameManager.completeLevel(currentLevel, coinsCollected, keysCollected);
      
      soundManager.playLevelComplete();
      setShowLevelComplete(true);
      setGameState(gameManager.getState());
      setCurrentLevel(gameManager.getState().currentLevel);
      
      // Show celebration for 3 seconds, then move to next level
      setTimeout(() => {
        setShowLevelComplete(false);
      }, 3000);
    }
  }, [currentLevel, platformGameState, gameManager, soundManager]);

  const handleGameStateChange = useCallback((newGameState: any) => {
    setPlatformGameState(newGameState);
  }, []);

  // Show character selection if game has not started
  if (!gameStarted) {
    return (
      <CharacterSelection 
        onCharacterSelected={handleCharacterSelected}
        characterManager={characterManager}
        totalCoins={characterManager.getTotalCoins()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 flex flex-col font-sans relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-green-300 rounded-full opacity-30 animate-bounce delay-75"></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-3xl font-bold text-white flex items-center animate-pulse">
            <span role="img" aria-label="jungle" className="mr-3 text-4xl animate-bounce">🌴</span>
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Jungle Adventure Game
            </span>
            <span role="img" aria-label="sparkles" className="ml-3 text-4xl animate-spin">✨</span>
          </h1>
          <p className="text-purple-100 text-sm mt-1 text-center">Learn To Code, Explore the Jungle!</p>
          <div className="text-xs text-purple-200 mt-1 text-center opacity-75">
            Made with 💙 by surthiga
          </div>
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full px-6 py-2 shadow-lg transform hover:scale-105 transition-transform">
              <span className="font-bold text-lg">💰 Coins: {(platformGameState as any)?.score || 0}</span>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full px-6 py-2 shadow-lg transform hover:scale-105 transition-transform">
              <span className="font-bold text-lg">🏆 Level: {gameState.currentLevel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex p-6 gap-6 relative z-10">
        
        {/* Left Panel - Coding Blocks */}
        <div className="w-1/2 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-4 border-blue-300 flex flex-col overflow-hidden transform hover:scale-[1.02] transition-transform">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-center border-b-4 border-blue-600">
            <h2 className="text-xl font-bold text-white flex items-center justify-center animate-pulse">
              <span role="img" aria-label="magic" className="mr-3 text-2xl animate-bounce">🪄</span>
              Magic Coding Blocks
              <span role="img" aria-label="blocks" className="ml-3 text-2xl animate-bounce delay-75">🧩</span>
            </h2>
            <p className="text-blue-100 text-sm mt-1">Drag blocks to create magical commands!</p>
          </div>
          <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <BlocklyWorkspace 
              onCodeGenerated={setGeneratedCode}
              onRunCode={handleRunCode}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Right Panel - Magical Adventure Map */}
        <div className="w-1/2 bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl border-4 border-green-300 flex flex-col overflow-hidden transform hover:scale-[1.02] transition-transform">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-center border-b-4 border-green-600">
            <h2 className="text-xl font-bold text-white flex items-center justify-center animate-pulse">
              <span role="img" aria-label="map" className="mr-3 text-2xl animate-bounce">🗺️</span>
              Enchanted Adventure Map
              <span role="img" aria-label="treasure" className="ml-3 text-2xl animate-bounce delay-75">💎</span>
            </h2>
            <p className="text-green-100 text-sm mt-1">Collect all gems 💎 and find the treasure chest! 🏴‍☠️</p>
            
            {/* Error message bar */}
            {(platformGameState as any)?.showError && (
              <div className="mt-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
                <span role="img" aria-label="warning" className="mr-2">⚠️</span>
                Oops! Magic spell failed. Try a different combination!
                <span role="img" aria-label="retry" className="ml-2">🔄</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-4 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
            <div className="relative">
              <GridGameCanvas 
                commands={executeCode}
                onCommandComplete={() => setExecuteCode([])}
                onGameStateChange={handleGameStateChange}
                onLevelComplete={handleLevelComplete}
                selectedCharacter={selectedCharacter!}
                currentLevel={GAME_LEVELS[currentLevel - 1] || GAME_LEVELS[0]}
              />
            </div>
          </div>
        </div>
        
      </div>

      {/* Footer Credits */}
      <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-center py-2 relative z-10">
        <div className="text-xs text-purple-200 opacity-75">
          Made with 💙 by surthiga
        </div>
      </footer>

      {/* Level Complete Banner */}
      {showLevelComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-8 border-yellow-400 rounded-3xl shadow-2xl px-12 py-8 text-center transform animate-bounce">
            <div className="text-6xl font-bold text-purple-800 mb-4">
              🎉 AMAZING! 🎉
            </div>
            <div className="text-2xl font-bold text-orange-800 mb-2">
              Level Complete!
            </div>
            <div className="text-lg text-purple-700">
              You&apos;re a true magical adventurer! ✨
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <span className="text-4xl animate-spin">🌟</span>
              <span className="text-4xl animate-bounce">🏆</span>
              <span className="text-4xl animate-pulse">💎</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
