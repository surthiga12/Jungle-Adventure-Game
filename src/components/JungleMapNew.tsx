'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameLevel } from './LevelConfig';
import { SoundManager } from '../utils/soundManager';
import { Character } from '../utils/characterManager';

interface JungleMapProps {
  commands?: any[];
  commandKey?: number;
  onCommandComplete?: () => void;
  onGameStateChange?: (state: JungleGameState) => void;
  onLevelComplete?: () => void;
  selectedCharacter: Character;
  currentLevel: GameLevel;
}

interface JungleGameState {
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
  exit: { x: number; y: number; width: number; height: number };
  platforms: { x: number; y: number; width: number; height: number }[];
  fruits?: { x: number; y: number; type: 'banana' | 'coconut' | 'mango'; collected: boolean }[];
  keys?: { x: number; y: number; collected: boolean }[];
  doors?: { x: number; y: number; width: number; height: number; isOpen: boolean }[];
  animals?: { x: number; y: number; width: number; height: number; type: string; friendly: boolean }[];
  keysCollected: number;
  score: number;
  levelComplete: boolean;
  timeRemaining?: number;
  showError?: boolean;
}

export default function JungleMapNew({ 
  commands = [], 
  commandKey = 0,
  onCommandComplete, 
  onGameStateChange,
  onLevelComplete,
  selectedCharacter,
  currentLevel
}: JungleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundManager] = useState(() => new SoundManager());
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Initialize game state with current level data
  const [gameState, setGameState] = useState<JungleGameState>(() => ({
    player: { 
      x: currentLevel.player.x, 
      y: currentLevel.player.y, 
      width: currentLevel.player.width, 
      height: currentLevel.player.height,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      facing: 'right'
    },
    coins: currentLevel.coins.map(coin => ({ ...coin })),
    exit: { ...currentLevel.exit },
    platforms: currentLevel.platforms.map(platform => ({ ...platform })),
    fruits: currentLevel.fruits?.map(fruit => ({ ...fruit })) || [],
    keys: currentLevel.keys?.map(key => ({ ...key })) || [],
    doors: currentLevel.doors?.map(door => ({ ...door })) || [],
    animals: currentLevel.animals?.map(animal => ({ ...animal })) || [],
    keysCollected: 0,
    score: 0,
    levelComplete: false,
    timeRemaining: currentLevel.timeLimit,
    showError: false,
  }));

  // Reset game state when level changes
  useEffect(() => {
    setGameState({
      player: { 
        x: currentLevel.player.x, 
        y: currentLevel.player.y, 
        width: currentLevel.player.width, 
        height: currentLevel.player.height,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        facing: 'right'
      },
      coins: currentLevel.coins.map(coin => ({ ...coin })),
      exit: { ...currentLevel.exit },
      platforms: currentLevel.platforms.map(platform => ({ ...platform })),
      fruits: currentLevel.fruits?.map(fruit => ({ ...fruit })) || [],
      keys: currentLevel.keys?.map(key => ({ ...key })) || [],
      doors: currentLevel.doors?.map(door => ({ ...door })) || [],
      animals: currentLevel.animals?.map(animal => ({ ...animal })) || [],
      keysCollected: 0,
      score: 0,
      levelComplete: false,
      timeRemaining: currentLevel.timeLimit,
      showError: false,
    });
  }, [currentLevel]);

  // Drawing functions
  const drawJungleBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Jungle gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.3, '#90EE90'); // Light green
    gradient.addColorStop(1, '#228B22'); // Forest green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some decorative elements
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < width; i += 40) {
      ctx.fillText('🌿', i, height - 10);
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: any) => {
    const { x, y, width, height } = player;
    
    // Draw character emoji
    ctx.font = `${Math.min(width, height) - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(
      selectedCharacter.emoji,
      x + width / 2,
      y + height / 2
    );
  };

  const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💰', x + 10, y + 15);
  };

  const drawExit = (ctx: CanvasRenderingContext2D, exit: any) => {
    const { x, y, width, height } = exit;
    
    // Jungle hut exit
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, width, height);
    
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏠', x + width / 2, y + height / 2);
  };

  const drawPlatform = (ctx: CanvasRenderingContext2D, platform: any) => {
    const { x, y, width, height } = platform;
    
    // Jungle platforms look like logs or leaves
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, width, height);
    
    // Add leaf texture
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < width; i += 20) {
      ctx.fillText('🍃', x + i, y - 5);
    }
  };

  const drawFruit = (ctx: CanvasRenderingContext2D, fruit: any) => {
    if (fruit.collected) return;
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    const emoji = fruit.type === 'banana' ? '🍌' : 
                  fruit.type === 'coconut' ? '🥥' : '🥭';
    
    ctx.fillText(emoji, fruit.x + 10, fruit.y + 15);
  };

  const drawKey = (ctx: CanvasRenderingContext2D, key: any) => {
    if (key.collected) return;
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🗝️', key.x + 10, key.y + 15);
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, door: any) => {
    const { x, y, width, height, isOpen } = door;
    
    if (isOpen) {
      ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    } else {
      ctx.fillStyle = '#8B4513';
    }
    
    ctx.fillRect(x, y, width, height);
    ctx.font = '20px Arial';
    ctx.fillText(isOpen ? '🚪' : '🚫', x + width / 2, y + height / 2);
  };

  const drawAnimal = (ctx: CanvasRenderingContext2D, animal: any) => {
    const { x, y, type } = animal;
    
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    
    const emoji = type === 'monkey' ? '🐵' : 
                  type === 'parrot' ? '🦜' : '🦋';
    
    ctx.fillText(emoji, x + 10, y + 15);
  };

  // Physics and collision detection
  const checkCollision = (rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
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
        if (checkCollision(player, platform)) {
          // Landing on top of platform
          if (player.velocityY > 0 && player.y < platform.y) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
          }
          // Hitting platform from below
          else if (player.velocityY < 0 && player.y > platform.y) {
            player.y = platform.y + platform.height;
            player.velocityY = 0;
          }
          // Hitting platform from sides
          else if (player.velocityX !== 0) {
            if (player.x < platform.x) {
              player.x = platform.x - player.width;
            } else {
              player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
          }
        }
      });

      // Collect coins
      newState.coins.forEach((coin, index) => {
        if (!coin.collected && checkCollision(player, { x: coin.x, y: coin.y, width: 20, height: 20 })) {
          newState.coins[index].collected = true;
          newState.score += 10;
          soundManager.playSuccessSound();
        }
      });

      // Collect fruits
      newState.fruits?.forEach((fruit, index) => {
        if (!fruit.collected && checkCollision(player, { x: fruit.x, y: fruit.y, width: 20, height: 20 })) {
          newState.fruits![index].collected = true;
          newState.score += 5;
          soundManager.playSuccessSound();
        }
      });

      // Collect keys
      newState.keys?.forEach((key, index) => {
        if (!key.collected && checkCollision(player, { x: key.x, y: key.y, width: 20, height: 20 })) {
          newState.keys![index].collected = true;
          newState.keysCollected += 1;
          soundManager.playSuccessSound();
          
          // Open doors when key is collected
          newState.doors?.forEach((door, doorIndex) => {
            newState.doors![doorIndex].isOpen = true;
          });
        }
      });

      // Check exit collision
      if (checkCollision(player, newState.exit)) {
        const allCoinsCollected = newState.coins.every(coin => coin.collected);
        const allFruitsCollected = newState.fruits?.every(fruit => fruit.collected) ?? true;
        
        if (allCoinsCollected && allFruitsCollected) {
          newState.levelComplete = true;
          soundManager.playLevelComplete();
          onLevelComplete?.();
        }
      }

      // Boundaries
      const canvasWidth = canvasRef.current?.width || 500;
      const canvasHeight = canvasRef.current?.height || 300;
      
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvasWidth) player.x = canvasWidth - player.width;
      if (player.y > canvasHeight) {
        player.y = currentLevel.player.y;
        player.x = currentLevel.player.x;
        player.velocityX = 0;
        player.velocityY = 0;
      }

      // Apply friction
      player.velocityX *= 0.8;

      newState.player = player;
      return newState;
    });
  };

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      applyPhysics();
      draw();
    };

    const interval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, [gameState]);

  // Drawing
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw jungle background
    drawJungleBackground(ctx, canvas.width, canvas.height);

    // Draw platforms
    gameState.platforms.forEach(platform => drawPlatform(ctx, platform));

    // Draw collectibles
    gameState.coins.forEach(coin => {
      if (!coin.collected) drawCoin(ctx, coin.x, coin.y);
    });

    gameState.fruits?.forEach(fruit => drawFruit(ctx, fruit));
    gameState.keys?.forEach(key => drawKey(ctx, key));
    gameState.doors?.forEach(door => drawDoor(ctx, door));
    gameState.animals?.forEach(animal => drawAnimal(ctx, animal));

    // Draw exit
    drawExit(ctx, gameState.exit);

    // Draw player
    drawPlayer(ctx, gameState.player);

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
    ctx.fillText(`Keys: ${gameState.keysCollected}`, 10, 45);
    
    if (gameState.timeRemaining) {
      ctx.fillText(`Time: ${gameState.timeRemaining}s`, 10, 65);
    }
  };

  // Command execution
  const executeCommands = (commandList: any[]) => {
    if (isExecuting || commandList.length === 0) return;

    setIsExecuting(true);
    let commandIndex = 0;

    const executeNextCommand = () => {
      if (commandIndex >= commandList.length) {
        setIsExecuting(false);
        onCommandComplete?.();
        return;
      }

      const command = commandList[commandIndex];
      commandIndex++;

      setGameState(prev => {
        const newState = { ...prev };
        const player = { ...newState.player };

        switch (command.type) {
          case 'move':
            if (command.direction === 'right') {
              player.velocityX = 5;
              player.facing = 'right';
            } else if (command.direction === 'left') {
              player.velocityX = -5;
              player.facing = 'left';
            }
            break;
          case 'jump':
            if (player.onGround) {
              player.velocityY = -12;
            }
            break;
        }

        newState.player = player;
        return newState;
      });

      setTimeout(executeNextCommand, 500);
    };

    executeNextCommand();
  };

  // Execute commands when they change
  useEffect(() => {
    if (commands.length > 0) {
      executeCommands(commands);
    }
  }, [commands, commandKey]);

  // Update parent component with game state
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  const resetGame = () => {
    setGameState({
      player: { 
        x: currentLevel.player.x, 
        y: currentLevel.player.y, 
        width: currentLevel.player.width, 
        height: currentLevel.player.height,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        facing: 'right'
      },
      coins: currentLevel.coins.map(coin => ({ ...coin })),
      exit: { ...currentLevel.exit },
      platforms: currentLevel.platforms.map(platform => ({ ...platform })),
      fruits: currentLevel.fruits?.map(fruit => ({ ...fruit })) || [],
      keys: currentLevel.keys?.map(key => ({ ...key })) || [],
      doors: currentLevel.doors?.map(door => ({ ...door })) || [],
      animals: currentLevel.animals?.map(animal => ({ ...animal })) || [],
      keysCollected: 0,
      score: 0,
      levelComplete: false,
      timeRemaining: currentLevel.timeLimit,
      showError: false,
    });
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-green-100 to-green-200 rounded-lg">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-green-800 mb-2">{currentLevel.name}</h3>
        <p className="text-green-700">{currentLevel.description}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="border-4 border-green-600 rounded-lg bg-green-50 shadow-lg"
      />
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={resetGame}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full"
          disabled={isExecuting}
        >
          🔄 Reset Level
        </button>
        <span className="text-sm text-green-700 py-2">
          {isExecuting ? '🏃‍♂️ Running...' : '✅ Ready'}
        </span>
      </div>
    </div>
  );
}
