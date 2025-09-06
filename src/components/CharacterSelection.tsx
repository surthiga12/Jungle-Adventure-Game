'use client';

import { useState } from 'react';

interface CharacterSelectionProps {
  onCharacterSelected: (character: 'boy' | 'girl') => void;
}

export default function CharacterSelection({ onCharacterSelected }: CharacterSelectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<'boy' | 'girl' | null>(null);

  const handleCharacterSelect = (character: 'boy' | 'girl') => {
    setSelectedCharacter(character);
  };

  const handleStartGame = () => {
    if (selectedCharacter) {
      onCharacterSelected(selectedCharacter);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">� Nipix Code Safari</h1>
          <p className="text-lg text-gray-600">Learn To Code, Explore the Jungle!</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Pick Your Safari Explorer
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Boy Character */}
            <button
              onClick={() => handleCharacterSelect('boy')}
              className={`p-6 rounded-xl border-4 transition-all duration-300 ${
                selectedCharacter === 'boy'
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-25'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-3">👦</div>
                <h3 className="text-xl font-bold text-blue-600">Safari Boy</h3>
                <p className="text-sm text-gray-600 mt-1">Brave & Quick</p>
              </div>
            </button>

            {/* Girl Character */}
            <button
              onClick={() => handleCharacterSelect('girl')}
              className={`p-6 rounded-xl border-4 transition-all duration-300 ${
                selectedCharacter === 'girl'
                  ? 'border-pink-500 bg-pink-50 scale-105'
                  : 'border-gray-300 bg-gray-50 hover:border-pink-300 hover:bg-pink-25'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-3">👧</div>
                <h3 className="text-xl font-bold text-pink-600">Safari Girl</h3>
                <p className="text-sm text-gray-600 mt-1">Smart & Agile</p>
              </div>
            </button>
          </div>

          {/* Character Abilities */}
          {selectedCharacter && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Explorer Abilities:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Navigate through the jungle</li>
                <li>• Collect precious gems</li>
                <li>• Avoid jungle obstacles</li>
                <li>• Use coding blocks to explore safely</li>
              </ul>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            disabled={!selectedCharacter}
            className={`w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-300 ${
              selectedCharacter
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedCharacter ? '🌴 Start Safari Adventure!' : '👆 Choose Your Explorer First'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Use code blocks to move your character through exciting levels!
        </div>
      </div>
    </div>
  );
}
