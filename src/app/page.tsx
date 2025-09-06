'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CharacterSelection from './components/CharacterSelection';
import BlocklyWorkspace from '../components/BlocklyWorkspace';
import JungleMapNew from '../components/GridGameCanvas';
import DailyLoginReward from '../components/DailyLoginReward';
import { GameManager } from '../utils/gameManager';
import { SoundManager } from '../utils/soundManager';
import { GAME_LEVELS, GameLevel } from '../components/LevelConfig';
import { CharacterManager, Character } from '../utils/characterManager';
import { StreakManager, DailyStreak } from '../utils/streakManager';

export default function Home() {
  const [gameManager] = useState(() => new GameManager());
  const [soundManager] = useState(() => new SoundManager());
  const [characterManager] = useState(() => new CharacterManager());
  const [streakManager] = useState(() => new StreakManager());
  const [gameState, setGameState] = useState(gameManager.getState());
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characterManager.getSelectedCharacter());
  const [totalCoins, setTotalCoins] = useState(characterManager.getTotalCoins());
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>(streakManager.getStreak());
  const [generatedCode, setGeneratedCode] = useState<any[]>([]);
  const [executeCode, setExecuteCode] = useState<any[]>([]);
  const [commandKey, setCommandKey] = useState(0); // Force fresh command execution
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [completionCountdown, setCompletionCountdown] = useState(0);
  const [platformGameState, setPlatformGameState] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const savedLevel = localStorage.getItem('currentLevel');
    const savedUnlocked = localStorage.getItem('unlockedLevels');
    
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel));
    }
    if (savedUnlocked) {
      setUnlockedLevels(parseInt(savedUnlocked));
    }
    
    // Record daily play and update streak
    const newStreak = streakManager.recordPlay();
    setDailyStreak(newStreak);
    
    // Award streak bonus coins
    const bonus = streakManager.getStreakBonus(newStreak.currentStreak);
    if (bonus > 0) {
      characterManager.addCoins(bonus);
      setTotalCoins(characterManager.getTotalCoins());
    }
    
    // Check daily login reward
    const loginData = JSON.parse(localStorage.getItem('dailyLogin') || '{}');
    const today = new Date().toDateString();
    if (loginData.lastLogin !== today) {
      setShowDailyLogin(true);
    } else {
      // Only show character selection if daily login is not needed
      setShowCharacterSelect(true);
    }
  }, []);

  const handleDailyReward = (reward: any) => {
    if (reward.type === 'coins') {
      characterManager.addCoins(reward.coins);
      setTotalCoins(characterManager.getTotalCoins());
    } else if (reward.type === 'character' && reward.character) {
      characterManager.unlockCharacter(reward.character.id);
    }
    setShowDailyLogin(false);
  };

  const handleCloseDailyLogin = () => {
    setShowDailyLogin(false);
  };

  const handleCharacterSelected = (character: Character) => {
    setSelectedCharacter(character);
    characterManager.setSelectedCharacter(character.id);
    setShowCharacterSelect(false);
    setShowLevelSelect(true); // Show level selection after character selection
  };

  const handleStartGame = () => {
    setShowLevelSelect(false);
    setGameStarted(true);
  };

  const handleCodeGenerated = useCallback((code: any[]) => {
    setGeneratedCode(code);
  }, []);

  const handleRunCode = () => {
    // Execute the current generated code
    setExecuteCode([...generatedCode]);
    setCommandKey(prev => prev + 1); // Force fresh command execution
  };

  const handleReset = () => {
    setExecuteCode([]);
    setGeneratedCode([]);
    setCommandKey(prev => prev + 1); // Force fresh command execution
  };

  const resetCompleteGame = () => {
    if (confirm('⚠️ This will reset ALL game progress including coins, characters, levels, and daily login data. Are you sure?')) {
      // Clear all localStorage data
      const keysToRemove = [
        'currentLevel',
        'unlockedLevels', 
        'totalCoins',
        'unlockedCharacters',
        'selectedCharacter',
        'gameStreak',
        'dailyLogin', // This is the correct key used by DailyLoginReward
        'lastLoginDate',
        'gameData'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Reset all state to initial values
      setCurrentLevel(1);
      setUnlockedLevels(1);
      setTotalCoins(0);
      setSelectedCharacter(characterManager.getSelectedCharacter());
      setShowCharacterSelect(false);
      setShowLevelSelect(false);
      setGameStarted(false);
      setShowLevelComplete(false);
      setShowDailyLogin(true); // Show daily login first after reset
      setExecuteCode([]);
      setGeneratedCode([]);
      
      // Reset character manager
      characterManager.resetToDefaults();
      
      alert('🎮 Game has been completely reset!');
      
      // Reload the page to ensure clean state and proper flow
      window.location.reload();
    }
  };

  const handleLevelComplete = useCallback(() => {
    // First show celebration for current level
    soundManager.playLevelComplete();
    setShowLevelComplete(true);
    setCompletionCountdown(5); // 5 second countdown to match game component
    
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setCompletionCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // After celebration, advance to next level
    setTimeout(() => {
      setShowLevelComplete(false);
      setCompletionCountdown(0);
      
      // Advance to next level
      const nextLevel = currentLevel + 1;
      if (nextLevel <= GAME_LEVELS.length) {
        const newUnlocked = Math.max(unlockedLevels, nextLevel);
        setUnlockedLevels(newUnlocked);
        setCurrentLevel(nextLevel);
        setCommandKey(prev => prev + 1); // Reset commands for new level
        localStorage.setItem('currentLevel', nextLevel.toString());
        localStorage.setItem('unlockedLevels', newUnlocked.toString());
        
        // Clear any existing commands
        setExecuteCode([]);
        setGeneratedCode([]);
      } else {
        // All levels completed - could show a "Game Complete" screen
        alert('🎉 Congratulations! You completed all levels! 🎉');
      }
    }, 5000); // Show celebration for 5 seconds to match game component
  }, [currentLevel, unlockedLevels, soundManager, setCommandKey, setExecuteCode, setGeneratedCode]);

  const handleLevelSelect = (levelId: number) => {
    if (levelId <= unlockedLevels) {
      setCurrentLevel(levelId);
      localStorage.setItem('currentLevel', levelId.toString());
      setExecuteCode([]);
      setGeneratedCode([]);
      setCommandKey(prev => prev + 1); // Force fresh command execution
      handleStartGame(); // Start the game after level selection
    }
  };

  const handleGameStateChange = useCallback((newGameState: any) => {
    setPlatformGameState(prevState => {
      // Add coins to character manager when score increases
      if (newGameState.score && newGameState.score > (prevState as any)?.score) {
        const coinsEarned = newGameState.score - ((prevState as any)?.score || 0);
        characterManager.addCoins(coinsEarned);
        setTotalCoins(characterManager.getTotalCoins());
      }
      return newGameState;
    });
  }, [characterManager]);

  // Show daily login first if needed
  if (showDailyLogin) {
    return (
      <DailyLoginReward 
        onClose={handleCloseDailyLogin}
        onClaimReward={handleDailyReward}
        availableCharacters={characterManager.getCharacters()}
      />
    );
  }

  // Show character selection first
  if (showCharacterSelect) {
    return (
      <div>
        <CharacterSelection 
          onCharacterSelected={handleCharacterSelected}
          characterManager={characterManager}
          totalCoins={totalCoins}
        />
        {/* Reset button */}
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={resetCompleteGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Reset all game data"
          >
            🔄 Reset Game
          </button>
        </div>
      </div>
    );
  }

  // Show level selection after character selection
  if (showLevelSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-4">🌴 Choose Your Jungle Adventure! 🌴</h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-2xl">Playing as:</span>
              <div className="bg-green-100 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-3xl">{selectedCharacter.emoji}</span>
                <span className="font-bold text-green-800">{selectedCharacter.name}</span>
              </div>
              <button
                onClick={() => setShowCharacterSelect(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold"
              >
                Change Character
              </button>
              <button
                onClick={() => setShowDailyLogin(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-bold"
              >
                🎁 Daily Rewards
              </button>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-lg text-green-700">💰 Total Coins: {totalCoins}</div>
              <div className="text-lg text-blue-700 flex items-center gap-2">
                <span>{streakManager.getStreakEmoji(dailyStreak.currentStreak)}</span>
                <span>Streak: {dailyStreak.currentStreak} days</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {streakManager.getStreakMessage(dailyStreak)}
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            {GAME_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                disabled={level.id > unlockedLevels}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 min-h-[120px] flex flex-col justify-center items-center ${
                  level.id === currentLevel
                    ? 'bg-gradient-to-br from-green-400 to-emerald-400 border-green-600 text-white shadow-lg'
                    : level.id <= unlockedLevels
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 text-green-800 hover:from-green-200 hover:to-emerald-200'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-2xl font-bold mb-1">
                  {level.id <= unlockedLevels ? (level.id === currentLevel ? '▶️' : '✅') : '🔒'}
                </div>
                <div className="text-sm font-semibold text-center">{level.name}</div>
                <div className="text-xs mt-1 opacity-75 text-center leading-tight">{level.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 via-green-200 to-teal-200 flex flex-col font-sans relative overflow-hidden">

      {/* Subtle background leaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-emerald-600"></div>
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full opacity-10 bg-green-600"></div>
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 rounded-full opacity-10 bg-teal-600"></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <span className="mr-3 text-4xl">🌴</span>
            <span className="bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">
              Nipix Code Safari
            </span>
            <span className="ml-3 text-3xl">🧭</span>
          </h1>
          <p className="text-green-100 text-sm mt-1 text-center">Learn To Code, Explore the Jungle!</p>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setShowLevelSelect(!showLevelSelect)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-6 py-2 shadow-lg hover:brightness-110 transition-colors font-bold"
            >
              Level {currentLevel}
            </button>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full px-6 py-2 shadow-lg">
              <span className="font-bold text-lg">Coins: {(platformGameState as any)?.score || 0}</span>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-full px-6 py-2 shadow-lg">
              <span className="font-bold text-lg">Progress: {unlockedLevels}/{GAME_LEVELS.length}</span>
            </div>
          </div>
        </div>

        {/* Level Selection Panel */}
        {showLevelSelect && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[90]"
              onClick={() => setShowLevelSelect(false)}
            ></div>
            
            {/* Panel */}
            <div className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t-4 border-emerald-600 z-[100] max-h-96 overflow-y-auto">
              <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-green-800 text-center flex-1">🗺️ Choose Your Jungle Adventure Level</h3>
                  <button 
                    onClick={() => setShowLevelSelect(false)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3 max-w-4xl mx-auto">
                {GAME_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleLevelSelect(level.id)}
                    disabled={level.id > unlockedLevels}
                    className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 min-h-[120px] flex flex-col justify-center items-center ${
                      level.id === currentLevel
                        ? 'bg-gradient-to-br from-emerald-400 to-green-400 border-emerald-600 text-white shadow-lg'
                        : level.id <= unlockedLevels
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 text-green-800 hover:from-green-200 hover:to-emerald-200'
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1">
                      {level.id <= unlockedLevels ? (level.id === currentLevel ? '▶️' : '✓') : '🔒'}
                    </div>
                    <div className="text-sm font-semibold text-center">{level.name}</div>
                    <div className="text-xs mt-1 opacity-75 text-center leading-tight">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
      </header>

      {/* Main Game Area */}
  <div className={`flex-1 flex p-6 gap-6 relative ${showLevelSelect ? 'z-10' : 'z-20'}`}>
        
        {/* Left Panel - Coding Blocks */}
        <div className="w-1/2 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-4 border-blue-300 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-center border-b-4 border-blue-600">
            <h2 className="text-xl font-bold text-white flex items-center justify-center">
              <span className="mr-3 text-2xl">🧩</span>
            </h2>
            <p className="text-blue-100 text-sm mt-1">Drag blocks to create your path.</p>
          </div>
          <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <BlocklyWorkspace 
              onCodeGenerated={handleCodeGenerated}
              onRunCode={handleRunCode}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Right Panel - Jungle Adventure Map */}
        <div className="w-1/2 bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl border-4 border-green-300 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-center border-b-4 border-green-600">
            <h2 className="text-xl font-bold text-white flex items-center justify-center">
              <span className="mr-3 text-2xl">🌴</span>
              Jungle Adventure Map
              <span className="ml-3 text-2xl">🏠</span>
            </h2>
            <p className="text-green-100 text-sm mt-1">Collect all coins & fruits and reach the hut.</p>
            
            {/* Error message bar */}
            {(platformGameState as any)?.showError && (
              <div className="mt-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm shadow-lg">
                <span role="img" aria-label="warning" className="mr-2">⚠️</span>
                Oops! Jungle magic spell failed. Try a different combination!
                <span role="img" aria-label="retry" className="ml-2">↻</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-4 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
            <div className="relative">
              <JungleMapNew 
                commands={executeCode}
                commandKey={commandKey}
                onCommandComplete={() => setExecuteCode([])}
                onGameStateChange={handleGameStateChange}
                onLevelComplete={handleLevelComplete}
                selectedCharacter={selectedCharacter!}
                currentLevel={GAME_LEVELS[currentLevel - 1]}
              />
            </div>
          </div>
        </div>
        
      </div>

      {/* Level Complete Banner */}
      {showLevelComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          {/* Candy/Chocolate burst animation - OUTSIDE the box */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 25 }, (_, i) => (
              <div
                key={i}
                className="absolute text-6xl animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${0.8 + Math.random() * 0.8}s`
                }}
              >
                {['🍭', '🍫', '🍬', '🧁', '🍰', '🎉', '✨', '⭐', '🎊', '🍩', '🧿', '💎'][Math.floor(Math.random() * 12)]}
              </div>
            ))}
          </div>

          {/* Victory Box */}
          <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-8 border-yellow-400 rounded-3xl shadow-2xl px-12 py-8 text-center relative max-w-lg z-10">
            <div className="text-6xl font-bold text-purple-800 mb-4">
              🎉 Level {currentLevel} Complete! 🎉
            </div>
            <div className="text-2xl text-purple-700 mb-2">
              Fantastic work, Safari Explorer! 🌿
            </div>
            <div className="text-xl text-purple-600 mb-3">
              🍭 Candy Celebration! 🍫
            </div>
            
            {currentLevel < GAME_LEVELS.length ? (
              <div className="text-lg text-purple-700 bg-white/20 rounded-full px-4 py-2 mt-4">
                🚀 Moving to Level {currentLevel + 1} in {completionCountdown}s... 
              </div>
            ) : (
              <div className="text-lg text-purple-700 bg-white/20 rounded-full px-4 py-2 mt-4">
                🏆 All Levels Complete! Amazing! 🏆
              </div>
            )}
            
            <div className="text-sm text-purple-600 mt-3 opacity-75">
              {completionCountdown > 0 ? `Auto-advancing in ${completionCountdown} seconds...` : 'Get ready for the next adventure!'}
            </div>
            
            {completionCountdown > 0 && (
              <button 
                onClick={() => {
                  setCompletionCountdown(0);
                  setShowLevelComplete(false);
                  // Advance immediately
                  const nextLevel = currentLevel + 1;
                  if (nextLevel <= GAME_LEVELS.length) {
                    const newUnlocked = Math.max(unlockedLevels, nextLevel);
                    setUnlockedLevels(newUnlocked);
                    setCurrentLevel(nextLevel);
                    setCommandKey(prev => prev + 1);
                    localStorage.setItem('currentLevel', nextLevel.toString());
                    localStorage.setItem('unlockedLevels', newUnlocked.toString());
                    setExecuteCode([]);
                    setGeneratedCode([]);
                  }
                }}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
              >
                ⏭️ Continue Now
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
