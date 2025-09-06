"use client";

import React from 'react';
import { Character, CharacterManager } from '../../utils/characterManager';

interface CharacterSelectionProps {
  onCharacterSelected: (character: Character) => void;
  characterManager: CharacterManager;
  totalCoins: number;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  onCharacterSelected, 
  characterManager, 
  totalCoins 
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<'unlocked' | 'locked'>('unlocked');
  
  const unlockedCharacters = characterManager.getUnlockedCharacters();
  const lockedCharacters = characterManager.getLockedCharacters();

  const handleUnlockCharacter = (character: Character) => {
    if (characterManager.canUnlockCharacter(character.id)) {
      characterManager.unlockCharacter(character.id);
      // Force re-render by updating category
      setSelectedCategory('unlocked');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400 p-4">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border-4 border-green-200">
        
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            🌴 Choose Your Safari Explorer! 🌴
          </h1>
          <p className="text-xl text-green-700 mb-2">Pick your explorer for the Jungle Adventure Game!</p>
          <p className="text-lg text-green-600 mb-4">Learn To Code, Explore the Jungle!</p>
          <div className="bg-amber-100 rounded-full px-6 py-2 inline-block">
            <span className="text-2xl font-bold text-amber-800">💰 {totalCoins} Coins</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-2 flex gap-2">
            <button
              onClick={() => setSelectedCategory('unlocked')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedCategory === 'unlocked'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-200'
              }`}
            >
              🔓 Available ({unlockedCharacters.length})
            </button>
            <button
              onClick={() => setSelectedCategory('locked')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedCategory === 'locked'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-200'
              }`}
            >
              🔒 Unlock More ({lockedCharacters.length})
            </button>
          </div>
        </div>
        
        {/* Characters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {(selectedCategory === 'unlocked' ? unlockedCharacters : lockedCharacters).map((character: Character) => (
            <div 
              key={character.id}
              className={`group bg-gradient-to-br rounded-2xl shadow-lg p-4 transition-all duration-300 transform hover:scale-105 border-2 ${
                selectedCategory === 'unlocked'
                  ? 'from-green-50 to-emerald-50 border-green-300 hover:border-green-500 cursor-pointer'
                  : character.cost <= totalCoins
                  ? 'from-amber-50 to-yellow-50 border-amber-300 hover:border-amber-500 cursor-pointer'
                  : 'from-gray-50 to-gray-100 border-gray-300 cursor-not-allowed opacity-50'
              }`}
              onClick={() => {
                if (selectedCategory === 'unlocked') {
                  onCharacterSelected(character);
                } else if (character.cost <= totalCoins) {
                  handleUnlockCharacter(character);
                }
              }}
            >
              {/* Character Avatar */}
              <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center text-4xl bg-white rounded-full shadow-md">
                {character.emoji}
              </div>
              
              <h3 className="text-lg font-bold text-green-800 mb-2">{character.name}</h3>
              <p className="text-sm text-green-600 mb-3 leading-tight">{character.description}</p>
              
              {selectedCategory === 'unlocked' ? (
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm w-full">
                  Select
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-amber-700 font-bold">💰 {character.cost} coins</div>
                  {character.cost <= totalCoins ? (
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full text-sm w-full">
                      Unlock
                    </button>
                  ) : (
                    <div className="text-gray-500 text-sm">Need more coins</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedCategory === 'unlocked' && unlockedCharacters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xl text-green-700 mb-4">No characters unlocked yet!</p>
            <button
              onClick={() => setSelectedCategory('locked')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full"
            >
              View Characters to Unlock
            </button>
          </div>
        )}
        
        {/* Footer message */}
        <div className="mt-6 text-center">
          <p className="text-lg text-green-700">
            🎮 Earn coins by completing levels to unlock more animal friends! 🏆
          </p>
          <div className="mt-4 text-sm text-gray-600">
            Made with 💙 by surthiga
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
