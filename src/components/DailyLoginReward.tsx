'use client';

import React, { useState, useEffect } from 'react';
import { Character } from '../utils/characterManager';

interface DailyReward {
  day: number;
  type: 'coins' | 'character';
  coins?: number;
  character?: Character;
  claimed: boolean;
}

interface DailyLoginRewardProps {
  onClose: () => void;
  onClaimReward: (reward: DailyReward) => void;
  availableCharacters: Character[];
}

const DailyLoginReward: React.FC<DailyLoginRewardProps> = ({ 
  onClose, 
  onClaimReward,
  availableCharacters 
}) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    // Get daily login data from localStorage
    const loginData = JSON.parse(localStorage.getItem('dailyLogin') || '{}');
    const today = new Date().toDateString();
    const lastLogin = loginData.lastLogin;
    const consecutiveDays = loginData.consecutiveDays || 0;

    if (lastLogin === today) {
      // Already logged in today
      setCurrentDay(consecutiveDays);
      setCanClaim(false);
    } else {
      // New day or first time
      const isConsecutive = lastLogin === new Date(Date.now() - 86400000).toDateString();
      const newDay = isConsecutive ? Math.min(consecutiveDays + 1, 7) : 1;
      setCurrentDay(newDay);
      setCanClaim(true);
    }
  }, []);

  const generateDailyRewards = (): DailyReward[] => {
    const specialCharacters = availableCharacters.filter(char => char.cost >= 100);
    
    return [
      { day: 1, type: 'coins', coins: 50, claimed: false },
      { day: 2, type: 'coins', coins: 75, claimed: false },
      { day: 3, type: 'coins', coins: 100, claimed: false },
      { day: 4, type: 'coins', coins: 150, claimed: false },
      { day: 5, type: 'coins', coins: 200, claimed: false },
      { day: 6, type: 'coins', coins: 300, claimed: false },
      { 
        day: 7, 
        type: 'character', 
        character: specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
        claimed: false 
      }
    ];
  };

  const rewards = generateDailyRewards();

  const handleClaim = () => {
    if (!canClaim) return;

    const todayReward = rewards[currentDay - 1];
    onClaimReward(todayReward);

    // Update localStorage
    const loginData = {
      lastLogin: new Date().toDateString(),
      consecutiveDays: currentDay
    };
    localStorage.setItem('dailyLogin', JSON.stringify(loginData));

    setCanClaim(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-200 to-yellow-300 rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-8 border-amber-400 relative">
        {/* Floating reward icons around the modal */}
        <div className="absolute -top-4 -left-4 text-6xl animate-bounce">🎁</div>
        <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{animationDelay: '0.5s'}}>💰</div>
        <div className="absolute -bottom-4 -left-4 text-6xl animate-bounce" style={{animationDelay: '1s'}}>🏆</div>
        <div className="absolute -bottom-4 -right-4 text-6xl animate-bounce" style={{animationDelay: '1.5s'}}>⭐</div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            🌅 Daily Safari Rewards! 🌅
          </h1>
          <p className="text-xl text-amber-800">
            Day {currentDay} of your jungle adventure streak!
          </p>
          {canClaim && (
            <p className="text-lg text-green-700 font-bold mt-2">
              ✨ New reward available! ✨
            </p>
          )}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {rewards.map((reward, index) => {
            const isCurrentDay = index + 1 === currentDay;
            const isPast = index + 1 < currentDay;
            const isFuture = index + 1 > currentDay;

            return (
              <div
                key={reward.day}
                className={`relative p-4 rounded-2xl border-4 text-center transition-all ${
                  isCurrentDay && canClaim
                    ? 'bg-green-200 border-green-500 scale-110 animate-pulse'
                    : isCurrentDay
                    ? 'bg-yellow-200 border-yellow-500'
                    : isPast
                    ? 'bg-gray-200 border-gray-400 opacity-60'
                    : 'bg-white border-amber-300'
                }`}
              >
                <div className="text-sm font-bold text-amber-900 mb-2">
                  Day {reward.day}
                </div>
                
                {reward.type === 'coins' ? (
                  <>
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-lg font-bold text-amber-800">
                      {reward.coins} coins
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-2">
                      {reward.character?.emoji || '🦁'}
                    </div>
                    <div className="text-sm font-bold text-purple-800">
                      Special Character!
                    </div>
                  </>
                )}

                {isPast && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl">✅</div>
                  </div>
                )}

                {isCurrentDay && canClaim && (
                  <div className="absolute -top-2 -right-2 text-2xl animate-spin">
                    ✨
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {canClaim ? (
            <button
              onClick={handleClaim}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all animate-pulse"
            >
              🎁 Claim Day {currentDay} Reward!
            </button>
          ) : (
            <div className="text-center">
              <div className="text-lg text-amber-800 mb-4">
                {currentDay < 7 ? 'Come back tomorrow for your next reward!' : 'Streak complete! Start a new 7-day cycle tomorrow!'}
              </div>
              <button
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
              >
                Continue Adventure
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-amber-800 hover:text-amber-900 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
        >
          ✕
        </button>

        {/* Progress info */}
        <div className="mt-6 text-center text-sm text-amber-700">
          💡 Log in every day to keep your streak going! Miss a day and restart from Day 1.
        </div>
      </div>
    </div>
  );
};

export default DailyLoginReward;
