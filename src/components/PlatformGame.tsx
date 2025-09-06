'use client';

import { useEffect, useRef, useState } from 'react';
import { SoundManager } from '@/utils/soundManager';
import { Character } from '@/utils/characterManager';

interface PlatformGameProps {
  commands?: any[];
  character: Character;
  onCommandComplete?: () => void;
  onLevelComplete?: () => void;
  onGameStateChange?: (state: GameState) => void;
}

interface GameState {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
    onGround: boolean;
    facing: 'left' | 'right';
  };
  coins: { x: number; y: number; collected: boolean }[];
  keys: { x: number; y: number; collected: boolean }[];
  platforms: { x: number; y: number; width: number; height: number }[];
  exit: { x: number; y: number; width: number; height: number };
  score: number;
  keysCollected: number;
  levelComplete: boolean;
}

export default function PlatformGame({ 
  commands = [], 
  character, 
  onCommandComplete, 
  onLevelComplete,
  onGameStateChange 
}: PlatformGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundManager] = useState(() => new SoundManager());
  const [isExecuting, setIsExecuting] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => ({
    player: {
      x: 50,
      y: 400,
      width: 30,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      facing: 'right'
    },
    coins: [
      { x: 200, y: 300, collected: false },
      { x: 400, y: 200, collected: false },
      { x: 600, y: 350, collected: false }
    ],
    keys: [
      { x: 350, y: 150, collected: false }
    ],
    platforms: [
      { x: 0, y: 450, width: 800, height: 20 }, // Ground
      { x: 150, y: 350, width: 100, height: 20 },
      { x: 320, y: 250, width: 120, height: 20 },
      { x: 500, y: 400, width: 80, height: 20 },
      { x: 650, y: 300, width: 100, height: 20 }
    ],
    exit: { x: 700, y: 200, width: 50, height: 80 },
    score: 0,
    keysCollected: 0,
    levelComplete: false
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx);
    
    // Draw platforms
    gameState.platforms.forEach(platform => {
      drawPlatform(ctx, platform);
    });

    // Draw coins
    gameState.coins.forEach(coin => {
      if (!coin.collected) {
        drawCoin(ctx, coin.x, coin.y);
      }
    });

    // Draw keys
    gameState.keys.forEach(key => {
      if (!key.collected) {
        drawKey(ctx, key.x, key.y);
      }
    });

    // Draw exit
    drawExit(ctx, gameState.exit);

    // Draw player
    drawPlayer(ctx, gameState.player, character);

    // Apply gravity and physics
    applyPhysics();

  }, [gameState, character]);

  // Separate effect for notifying parent of state changes
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState.score, gameState.keysCollected, gameState.levelComplete, onGameStateChange]);

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 500);

    // Clouds
    drawCloud(ctx, 100, 80);
    drawCloud(ctx, 300, 60);
    drawCloud(ctx, 600, 90);

    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 80, 30, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.arc(x + 15, y, 25, 0, 2 * Math.PI);
    ctx.arc(x + 30, y, 20, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawPlatform = (ctx: CanvasRenderingContext2D, platform: any) => {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add grass on top for ground platform
    if (platform.y >= 440) {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, char: Character) => {
    const { x, y, width, height, facing } = player;
    
    // Draw character emoji as the player
    ctx.font = `${Math.min(width, height) - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the character emoji
    ctx.fillText(
      char.emoji,
      x + width / 2,
      y + height / 2
    );

    // Direction indicator (smaller arrow)
    ctx.font = '12px Arial';
    if (facing === 'left') {
      ctx.fillStyle = '#FF0000';
      ctx.fillText('←', x - 10, y + height / 2);
    } else {
      ctx.fillStyle = '#FF0000';
      ctx.fillText('→', x + width + 5, y + height / 2);
    }
  };
  

  const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.fillText('💰', x + 2, y + 15);
  };

  const drawKey = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 5, y + 8, 10, 4);
    ctx.fillRect(x + 15, y + 5, 3, 10);
    ctx.fillRect(x + 15, y + 5, 6, 3);
    ctx.fillRect(x + 15, y + 12, 4, 3);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '16px Arial';
    ctx.fillText('🗝️', x, y + 15);
  };

  const drawExit = (ctx: CanvasRenderingContext2D, exit: any) => {
    // Door frame
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    
    // Door
    ctx.fillStyle = '#654321';
    ctx.fillRect(exit.x + 5, exit.y + 5, exit.width - 10, exit.height - 10);
    
    // Door handle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(exit.x + exit.width - 15, exit.y + exit.height / 2, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Exit sign
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px Arial';
    ctx.fillText('EXIT', exit.x + 10, exit.y - 5);
  };

  const applyPhysics = () => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const player = { ...newState.player };

      // Apply gravity
      if (!player.onGround) {
        player.velocityY += 0.8; // Gravity
      }

      // Update position
      player.x += player.velocityX;
      player.y += player.velocityY;

      // Check platform collisions
      player.onGround = false;
      newState.platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10) {
          
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        }
      });

      // Boundary checks
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > 800) player.x = 800 - player.width;
      if (player.y > 500) {
        // Reset position if falling off
        player.x = 50;
        player.y = 400;
        player.velocityY = 0;
      }

      // Apply friction
      player.velocityX *= 0.8;

      newState.player = player;

      // Check collectible collisions
      checkCollisions(newState);

      return newState;
    });
  };

  const checkCollisions = (state: GameState) => {
    const player = state.player;

    // Check coin collisions
    state.coins.forEach(coin => {
      if (!coin.collected &&
          player.x < coin.x + 20 &&
          player.x + player.width > coin.x &&
          player.y < coin.y + 20 &&
          player.y + player.height > coin.y) {
        coin.collected = true;
        state.score += 10;
        soundManager.playSuccessSound();
      }
    });

    // Check key collisions
    state.keys.forEach(key => {
      if (!key.collected &&
          player.x < key.x + 20 &&
          player.x + player.width > key.x &&
          player.y < key.y + 20 &&
          player.y + player.height > key.y) {
        key.collected = true;
        state.keysCollected += 1;
        soundManager.playSuccessSound();
      }
    });

    // Check exit collision
    if (state.keysCollected > 0 &&
        player.x < state.exit.x + state.exit.width &&
        player.x + player.width > state.exit.x &&
        player.y < state.exit.y + state.exit.height &&
        player.y + player.height > state.exit.y) {
      
      if (!state.levelComplete) {
        state.levelComplete = true;
        soundManager.playLevelComplete();
        onLevelComplete?.();
      }
    }
  };

  const executeCommands = async (commandList: any[]) => {
    if (isExecuting || commandList.length === 0) return;
    
    setIsExecuting(true);
    
    for (const command of commandList) {
      await executeCommand(command);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between commands
    }
    
    setIsExecuting(false);
    onCommandComplete?.();
  };

  const executeCommand = async (command: any): Promise<void> => {
    return new Promise((resolve) => {
      setGameState(prev => {
        const newState = { ...prev };
        const player = { ...newState.player };
        
        switch (command.action) {
          case 'move_left':
            player.velocityX = -5;
            player.facing = 'left';
            break;
          case 'move_right':
            player.velocityX = 5;
            player.facing = 'right';
            break;
          case 'jump':
            if (player.onGround) {
              player.velocityY = -15;
              player.onGround = false;
            }
            break;
          case 'collect':
            // Auto-collect nearby items
            newState.coins.forEach(coin => {
              if (!coin.collected &&
                  Math.abs(player.x - coin.x) < 40 &&
                  Math.abs(player.y - coin.y) < 40) {
                coin.collected = true;
                newState.score += 10;
              }
            });
            newState.keys.forEach(key => {
              if (!key.collected &&
                  Math.abs(player.x - key.x) < 40 &&
                  Math.abs(player.y - key.y) < 40) {
                key.collected = true;
                newState.keysCollected += 1;
              }
            });
            break;
          case 'wait':
            // Wait is handled by the delay in executeCommands
            break;
          case 'repeat':
            // Handle repeat logic - this would need to be expanded
            break;
        }
        
        newState.player = player;
        return newState;
      });
      
      setTimeout(resolve, 500);
    });
  };

  const resetGame = () => {
    setGameState({
      player: {
        x: 50,
        y: 400,
        width: 30,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        facing: 'right'
      },
      coins: [
        { x: 200, y: 300, collected: false },
        { x: 400, y: 200, collected: false },
        { x: 600, y: 350, collected: false }
      ],
      keys: [
        { x: 350, y: 150, collected: false }
      ],
      platforms: [
        { x: 0, y: 450, width: 800, height: 20 }, // Ground
        { x: 150, y: 350, width: 100, height: 20 },
        { x: 320, y: 250, width: 120, height: 20 },
        { x: 500, y: 400, width: 80, height: 20 },
        { x: 650, y: 300, width: 100, height: 20 }
      ],
      exit: { x: 700, y: 200, width: 50, height: 80 },
      score: 0,
      keysCollected: 0,
      levelComplete: false
    });
  };

  // Execute commands when they change
  useEffect(() => {
    if (commands.length > 0) {
      executeCommands(commands);
    }
  }, [commands]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="mb-2 flex gap-4 text-sm font-semibold">
        <span className="text-yellow-600">💰 Score: {gameState.score}</span>
        <span className="text-blue-600">🗝️ Keys: {gameState.keysCollected}</span>
        <span className="text-green-600">
          {gameState.levelComplete ? '✅ Level Complete!' : '🎯 Collect key & reach exit'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="border-2 border-blue-300 rounded-lg bg-blue-50 max-w-full max-h-full"
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          disabled={isExecuting}
        >
          Reset Level
        </button>
        <span className="text-sm text-gray-600 py-2">
          {isExecuting ? 'Executing...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
