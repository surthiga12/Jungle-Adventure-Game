'use client';

import { useEffect, useRef, useState } from 'react';
import { GameLevel } from './LevelConfig';
import { SoundManager } from '../utils/soundManager';
import { Character } from '../utils/characterManager';

type Command =
  | { type: 'move'; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'move_up' | 'up' }
  | { type: 'move_down' | 'down' }
  | { type: 'move_left' | 'left' }
  | { type: 'move_right' | 'right' }
  | { type: 'jump' }
  | { type: 'wait' };

interface GridGameProps {
  commands?: Command[];
  onCommandComplete?: () => void;
  onGameStateChange?: (state: GridGameState) => void;
  onLevelComplete?: () => void;
  selectedCharacter: Character;
  currentLevel: GameLevel;
}

interface GridGameState {
  playerPosition: { x: number; y: number };
  coins: { x: number; y: number; collected: boolean }[];
  exitPosition: { x: number; y: number };
  platforms: { x: number; y: number }[];
  fruits?: { x: number; y: number; type: 'banana' | 'coconut' | 'mango'; collected: boolean }[];
  keys?: { x: number; y: number; collected: boolean }[];
  doors?: { x: number; y: number; isOpen: boolean }[];
  animals?: { x: number; y: number; type: string; friendly: boolean }[];
  keysCollected: number;
  score: number;
  levelComplete: boolean;
  timeRemaining?: number;
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
}

export default function GridGameCanvas({ 
  commands = [], 
  onCommandComplete, 
  onGameStateChange,
  onLevelComplete,
  selectedCharacter,
  currentLevel
}: GridGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundManager] = useState(() => new SoundManager());
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Animation and effects refs
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timeRef = useRef<number>(0);
  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  // Smooth tween refs (disabled for snap movement)
  const isMovingRef = useRef<boolean>(false);
  const moveStartRef = useRef<{ x: number; y: number } | null>(null);
  const moveTargetRef = useRef<{ x: number; y: number } | null>(null);
  const moveProgressRef = useRef<number>(0);
  const moveDurationRef = useRef<number>(320); // ms per tile move (unused in snap mode)
  const displayPosRef = useRef<{ x: number; y: number } | null>(null); // pixel-space
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; emoji?: string }>>([]);
  const screenShakeRef = useRef<{ t: number; mag: number }>({ t: 0, mag: 0 });
  const celebrationRef = useRef<{ active: boolean; timer: number }>({ active: false, timer: 0 });
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(currentLevel.timeLimit);
  
  const TILE_SIZE = 60;
  const GRID_WIDTH = 8;
  const GRID_HEIGHT = 6;
  
  // Convert level coordinates to grid positions
  const toGridPosition = (x: number, y: number) => ({
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE)
  });
  
  // Initialize game state with current level data
  const [gameState, setGameState] = useState<GridGameState>(() => ({
    playerPosition: toGridPosition(currentLevel.player.x, currentLevel.player.y),
    coins: currentLevel.coins.map(coin => ({ 
      ...toGridPosition(coin.x, coin.y), 
      collected: coin.collected 
    })),
    exitPosition: toGridPosition(currentLevel.exit.x, currentLevel.exit.y),
    platforms: currentLevel.platforms.map(platform => toGridPosition(platform.x, platform.y)),
    fruits: currentLevel.fruits?.map(fruit => ({ 
      ...toGridPosition(fruit.x, fruit.y), 
      type: fruit.type, 
      collected: fruit.collected 
    })) || [],
    keys: currentLevel.keys?.map(key => ({ 
      ...toGridPosition(key.x, key.y), 
      collected: key.collected 
    })) || [],
    doors: currentLevel.doors?.map(door => ({ 
      ...toGridPosition(door.x, door.y), 
      isOpen: door.isOpen 
    })) || [],
    animals: currentLevel.animals?.map(animal => ({ 
      ...toGridPosition(animal.x, animal.y), 
      type: animal.type, 
      friendly: animal.friendly 
    })) || [],
    keysCollected: 0,
    score: 0,
    levelComplete: false,
    timeRemaining: currentLevel.timeLimit,
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    tileSize: TILE_SIZE
  }));

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0 && !gameState.levelComplete) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Time's up! Reset level
            setTimeout(() => resetGame(), 1000);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining, gameState.levelComplete]);

  // Celebration particle effects
  const triggerCelebration = () => {
    celebrationRef.current = { active: true, timer: 0 };
    
    // Create candy/chocolate burst particles
    const centerX = GRID_WIDTH * TILE_SIZE / 2;
    const centerY = GRID_HEIGHT * TILE_SIZE / 2;
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 100 + Math.random() * 100;
      const candyEmojis = ['🍭', '🍫', '🍬', '🧁', '🍰', '🎉', '✨', '⭐'];
      
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0,
        maxLife: 3000,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: 20 + Math.random() * 10,
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)]
      });
    }
    
    // Screen shake for celebration
    screenShakeRef.current = { t: 500, mag: 8 };
  };

  // Reset game function
  const resetGame = () => {
    setGameState({
      playerPosition: toGridPosition(currentLevel.player.x, currentLevel.player.y),
      coins: currentLevel.coins.map(coin => ({ 
        ...toGridPosition(coin.x, coin.y), 
        collected: coin.collected 
      })),
      exitPosition: toGridPosition(currentLevel.exit.x, currentLevel.exit.y),
      platforms: currentLevel.platforms.map(platform => toGridPosition(platform.x, platform.y)),
      fruits: currentLevel.fruits?.map(fruit => ({ 
        ...toGridPosition(fruit.x, fruit.y), 
        type: fruit.type, 
        collected: fruit.collected 
      })) || [],
      keys: currentLevel.keys?.map(key => ({ 
        ...toGridPosition(key.x, key.y), 
        collected: key.collected 
      })) || [],
      doors: currentLevel.doors?.map(door => ({ 
        ...toGridPosition(door.x, door.y), 
        isOpen: door.isOpen 
      })) || [],
      animals: currentLevel.animals?.map(animal => ({ 
        ...toGridPosition(animal.x, animal.y), 
        type: animal.type, 
        friendly: animal.friendly 
      })) || [],
      keysCollected: 0,
      score: 0,
      levelComplete: false,
      timeRemaining: currentLevel.timeLimit,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT,
      tileSize: TILE_SIZE
    });
    setTimeRemaining(currentLevel.timeLimit);
    displayPosRef.current = {
      x: Math.floor(currentLevel.player.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2,
      y: Math.floor(currentLevel.player.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2,
    };
    isMovingRef.current = false;
    moveStartRef.current = null;
    moveTargetRef.current = null;
    moveProgressRef.current = 0;
    particlesRef.current = [];
    screenShakeRef.current = { t: 0, mag: 0 };
    celebrationRef.current = { active: false, timer: 0 };
  };

  // Reset game state when level changes
  useEffect(() => {
    resetGame();
  }, [currentLevel]);

  // Setup canvas for high-DPI crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const logicalW = GRID_WIDTH * TILE_SIZE;
      const logicalH = GRID_HEIGHT * TILE_SIZE;
      const dpr = (window.devicePixelRatio || 1);
      dprRef.current = dpr;
      canvas.style.width = `${logicalW}px`;
      canvas.style.height = `${logicalH}px`;
      canvas.width = Math.floor(logicalW * dpr);
      canvas.height = Math.floor(logicalH * dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Drawing helper functions
  const withShake = (x: number, y: number) => {
    const { t, mag } = screenShakeRef.current;
    if (mag <= 0) return { x, y };
    const dx = (Math.random() - 0.5) * 2 * mag;
    const dy = (Math.random() - 0.5) * 2 * mag;
    return { x: x + dx, y: y + dy };
  };

  const getTileCenter = (gx: number, gy: number) => ({
    x: gx * TILE_SIZE + TILE_SIZE / 2,
    y: gy * TILE_SIZE + TILE_SIZE / 2,
  });

  // Simple draw functions for a working demo
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { x: shakeX, y: shakeY } = withShake(0, 0);
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

    // Draw grid
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }

    // Draw platforms (trees)
    gameState.platforms.forEach(platform => {
      const center = getTileCenter(platform.x, platform.y);
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🌳', center.x, center.y);
    });

    // Draw coins (gems)
    gameState.coins.forEach(coin => {
      if (!coin.collected) {
        const center = getTileCenter(coin.x, coin.y);
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💎', center.x, center.y);
      }
    });

    // Draw exit (chest)
    const exitCenter = getTileCenter(gameState.exitPosition.x, gameState.exitPosition.y);
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📦', exitCenter.x, exitCenter.y);

    // Draw player
    const playerCenter = displayPosRef.current ?? getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    const emoji = selectedCharacter.id === 'boy' ? '👦' : '👧';
    ctx.fillText(emoji, playerCenter.x, playerCenter.y);

    // Draw particles (celebration effects)
    particlesRef.current.forEach(particle => {
      ctx.font = `${particle.size}px Arial`;
      ctx.textAlign = 'center';
      const alpha = 1 - (particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;
      if (particle.emoji) {
        ctx.fillText(particle.emoji, particle.x, particle.y);
      } else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    ctx.restore();

    // UI overlay
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, 10, 200, 80);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Keys: ${gameState.keysCollected}`, 20, 50);
    if (timeRemaining !== undefined) {
      const timeColor = timeRemaining < 30 ? 'red' : 'white';
      ctx.fillStyle = timeColor;
      ctx.fillText(`Time: ${timeRemaining}s`, 20, 70);
    }
  };

  // Game logic
  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    setGameState(prev => {
      const { x: currentX, y: currentY } = prev.playerPosition;
      let newX = currentX;
      let newY = currentY;

      switch (direction) {
        case 'up':
          newY = Math.max(0, currentY - 1);
          break;
        case 'down':
          newY = Math.min(GRID_HEIGHT - 1, currentY + 1);
          break;
        case 'left':
          newX = Math.max(0, currentX - 1);
          break;
        case 'right':
          newX = Math.min(GRID_WIDTH - 1, currentX + 1);
          break;
      }

      // Check collision with platforms
      const wouldCollide = prev.platforms.some(p => p.x === newX && p.y === newY);
      if (wouldCollide) {
        return prev; // Don't move
      }

      const newState = { ...prev, playerPosition: { x: newX, y: newY } };

      // Check coin collection
      newState.coins = newState.coins.map(coin => {
        if (!coin.collected && coin.x === newX && coin.y === newY) {
          newState.score += 10;
          soundManager.playCrystalSound();
          return { ...coin, collected: true };
        }
        return coin;
      });

      // Check level completion
      if (newX === newState.exitPosition.x && newY === newState.exitPosition.y) {
        const allCoinsCollected = newState.coins.every(c => c.collected);
        if (allCoinsCollected) {
          newState.levelComplete = true;
          soundManager.playLevelComplete();
          triggerCelebration();
          onLevelComplete?.();
        }
      }

      return newState;
    });
  };

  // Command execution
  useEffect(() => {
    if (commands.length > 0 && !isExecuting && !gameState.levelComplete) {
      setIsExecuting(true);
      
      const executeCommands = async () => {
        for (const command of commands) {
          await new Promise(resolve => {
            setTimeout(() => {
              if (command.type === 'move' && command.direction) {
                movePlayer(command.direction);
              } else if (['move_up', 'up'].includes(command.type)) {
                movePlayer('up');
              } else if (['move_down', 'down'].includes(command.type)) {
                movePlayer('down');
              } else if (['move_left', 'left'].includes(command.type)) {
                movePlayer('left');
              } else if (['move_right', 'right'].includes(command.type)) {
                movePlayer('right');
              }
              resolve(null);
            }, 500);
          });
        }
        setIsExecuting(false);
        onCommandComplete?.();
      };

      executeCommands();
    }
  }, [commands]);

  // Animation loop
  useEffect(() => {
    const loop = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      timeRef.current += dt;

      // Update display position with smooth following
      if (!displayPosRef.current) {
        const c = getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
        displayPosRef.current = { x: c.x, y: c.y };
      } else {
        const c = getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
        const d = displayPosRef.current;
        const smoothing = 0.15;
        d.x += (c.x - d.x) * smoothing;
        d.y += (c.y - d.y) * smoothing;
      }

      // Update particles
      if (particlesRef.current.length) {
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life += dt;
          p.x += p.vx * (dt / 1000);
          p.y += p.vy * (dt / 1000);
          p.vy += 180 * (dt / 1000); // gravity
          if (p.life >= p.maxLife) particlesRef.current.splice(i, 1);
        }
      }

      // Screen shake decay
      if (screenShakeRef.current.t > 0) {
        screenShakeRef.current.t -= dt;
        screenShakeRef.current.mag = Math.max(0, screenShakeRef.current.mag - dt * 0.01);
      }

      // Update celebration timer
      if (celebrationRef.current.active) {
        celebrationRef.current.timer += dt;
        if (celebrationRef.current.timer > 5000) {
          celebrationRef.current.active = false;
        }
      }

      drawGame();
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [gameState]);

  // Notify parent of state changes
  useEffect(() => {
    onGameStateChange?.({ ...gameState, timeRemaining });
  }, [gameState, timeRemaining, onGameStateChange]);

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-green-100 to-emerald-200 rounded-2xl border-4 border-emerald-500 shadow-2xl">
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold text-green-800 mb-2 flex items-center justify-center">
          🌴 {currentLevel.name} 🌴
        </h3>
        <p className="text-green-700 text-lg">{currentLevel.description}</p>
        <div className="mt-2 text-sm text-green-600">
          🎮 Use arrow commands to move through the jungle grid!
        </div>
        {timeRemaining !== undefined && (
          <div className={`mt-2 text-lg font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-blue-600'}`}>
            ⏰ Time: {timeRemaining}s
          </div>
        )}
      </div>
      
      <div className="relative border-[6px] border-emerald-700 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.25)] bg-gradient-to-br from-emerald-50 to-green-100">
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * TILE_SIZE}
          height={GRID_HEIGHT * TILE_SIZE}
          className="bg-green-50 block"
        />
      </div>
      
      <div className="mt-6 flex gap-6 items-center flex-wrap justify-center">
        <button
          onClick={resetGame}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
          disabled={isExecuting}
        >
          🔄 Reset Level
        </button>
        
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
          <span className="text-2xl">{isExecuting ? '🏃‍♂️' : celebrationRef.current.active ? '🎉' : '✅'}</span>
          <span className="text-green-700 font-semibold">
            {isExecuting ? 'Moving...' : celebrationRef.current.active ? 'Celebrating!' : 'Ready to code!'}
          </span>
        </div>
        
        <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md">
          <span className="font-bold">Score: {gameState.score}</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-green-600">
        💡 Collect all 💎 gems and reach the 📦 chest within the time limit!
      </div>
    </div>
  );
}
