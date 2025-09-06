
/* eslint-disable */
'use client';

import { useState, useEffect, useCallback } from 'react';
import CharacterSelection from '@/components/CharacterSelection';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';
import { GameManager } from '@/utils/gameManager';
import { SoundManager } from '@/utils/soundManager';

export default function Home() {
  const [gameManager] = useState(() => new GameManager());
  const [soundManager] = useState(() => new SoundManager());
  const [gameState, setGameState] = useState(gameManager.getState());
  const [currentLevel, setCurrentLevel] = useState(gameManager.getCurrentLevel());
  const [selectedCharacter, setSelectedCharacter] = useState<'boy' | 'girl' | null>(null);
  const [generatedCode, setGeneratedCode] = useState<any[]>([]);
  const [executeCode, setExecuteCode] = useState<any[]>([]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [platformGameState, setPlatformGameState] = useState(null);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const savedCharacter = gameManager.getState().selectedCharacter;
    if (savedCharacter) {
      setSelectedCharacter(savedCharacter);
      // Do NOT start the game automatically. Wait for user selection.
    }
    setGameState(gameManager.getState());
    setCurrentLevel(gameManager.getCurrentLevel());
  }, [gameManager]);

  const handleCharacterSelected = (character: 'boy' | 'girl') => {
    setSelectedCharacter(character);
    gameManager.selectCharacter(character);
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
      
      const { newBadges } = gameManager.completeLevel(currentLevel.id, coinsCollected, keysCollected);
      
      soundManager.playLevelComplete();
      setShowLevelComplete(true);
      setGameState(gameManager.getState());
      setCurrentLevel(gameManager.getCurrentLevel());
      
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
  return <div />; // legacy disabled
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-300 to-blue-400 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-3">
          <h1 className="text-2xl font-bold text-green-800 flex items-center">
            <span role="img" aria-label="leaf" className="mr-2 text-3xl">🌿</span>
            Jungle Explorer - Learn to Code!
          </h1>
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 text-white rounded-full px-4 py-1 shadow-md">
              <span className="font-bold">Coins: {(platformGameState as any)?.score || 0}</span>
            </div>
            <div className="bg-blue-500 text-white rounded-full px-4 py-1 shadow-md">
              <span className="font-bold">Level: {gameState.currentLevel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex p-4 gap-4">
        
        {/* Left Panel - Coding Blocks */}
        <div className="w-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-green-600 p-3 text-center border-b-4 border-green-700">
            <h2 className="text-lg font-bold text-white flex items-center justify-center">
              <span role="img" aria-label="puzzle" className="mr-2 text-xl">🧩</span>
              Coding Blocks
            </h2>
          </div>
          <div className="flex-1 p-3">
            <BlocklyWorkspace 
              onCodeGenerated={setGeneratedCode}
              onRunCode={handleRunCode}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Right Panel - Jungle Adventure Map */}
        <div className="w-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 text-center border-b-4 border-teal-700">
            <h2 className="text-lg font-bold text-white flex items-center justify-center">
              <span role="img" aria-label="map" className="mr-2 text-xl">🗺️</span>
              Jungle Adventure Map
            </h2>
            <p className="text-white/90 text-xs mt-1">Find the key 🔑 and open the treasure chest! 💎</p>
            
            {/* Error message bar */}
            {(platformGameState as any)?.showError && (
              <div className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm shadow-md">
                <span role="img" aria-label="warning" className="mr-1">⚠️</span>
                Oops! There's an error in your code. Try again!
              </div>
            )}
          </div>
          <div className="flex-1 p-3 flex items-center justify-center bg-green-50" />
        </div>
        
      </div>

      {/* Level Complete Banner */}
      {showLevelComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-yellow-200 border-4 border-yellow-400 rounded-xl shadow-lg px-8 py-6 text-3xl font-bold text-center text-yellow-900 animate-bounce">
            🎉 Level Complete! 🎉
            <div className="text-lg mt-2">Adventure Continues!</div>
          </div>
        </div>
      )}

    </div>
  );
}
