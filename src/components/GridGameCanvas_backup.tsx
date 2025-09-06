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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Reset game state when level changes
  useEffect(() => {
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
    // Reset animation/display position
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
  }, [currentLevel]);

  // Start countdown timer when level loads
  useEffect(() => {
    if (currentLevel.timeLimit && !gameState.levelComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining && prev.timeRemaining > 1) {
            return { ...prev, timeRemaining: prev.timeRemaining - 1 };
          } else if (prev.timeRemaining === 1) {
            // Time's up! Reset level
            setTimeout(() => resetGame(), 1000);
            return { ...prev, timeRemaining: 0 };
          }
          return prev;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentLevel, gameState.levelComplete]);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const logicalW = GRID_WIDTH * TILE_SIZE;
      const logicalH = GRID_HEIGHT * TILE_SIZE;
      const dpr = (window.devicePixelRatio || 1);
      dprRef.current = dpr;
      canvas.style.width = `${logicalW}px`;
      canvas.width = Math.floor(logicalW * dpr);
      canvas.height = Math.floor(logicalH * dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // --- Drawing helpers ---
  const withShake = (x: number, y: number) => {
    const { t, mag } = screenShakeRef.current;
    if (mag <= 0) return { x, y };
    const dx = (Math.random() - 0.5) * 2 * mag;
    const dy = (Math.random() - 0.5) * 2 * mag;
    return { x: x + dx, y: y + dy };
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

    const drawShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, 'rgba(0,0,0,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0.0)');
      ctx.fillStyle = grad;
      drawRoundedRect(ctx, x, y + h * 0.6, w, h * 0.4, 8);
      ctx.fill();
    };

    const drawGlow = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number = 0.35
    ) => {
      const g = ctx.createRadialGradient(x, y, 2, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
  

  // --- Scene drawing ---
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = GRID_WIDTH * TILE_SIZE;
    const canvasHeight = GRID_HEIGHT * TILE_SIZE;
    
    // Sky to canopy gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#b4e2ff');
    gradient.addColorStop(0.35, '#b6f3c2');
    gradient.addColorStop(1, '#2e7d32');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Ambient light rays
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 5; i++) {
      const x = (i * 120 + (timeRef.current * 0.02 + i * 30)) % (canvasWidth + 200) - 200;
      const gradRay = ctx.createLinearGradient(x, 0, x + 200, canvasHeight);
      gradRay.addColorStop(0, 'rgba(255,255,255,0)');
      gradRay.addColorStop(0.5, 'rgba(255,255,255,0.6)');
      gradRay.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradRay;
      ctx.fillRect(x, 0, 200, canvasHeight);
    }
    ctx.globalAlpha = 1;

    // Subtle grid cells with grass texture
    for (let gy = 0; gy < GRID_HEIGHT; gy++) {
      for (let gx = 0; gx < GRID_WIDTH; gx++) {
        const x = gx * TILE_SIZE;
        const y = gy * TILE_SIZE;
        // grass tile
        const g2 = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
        g2.addColorStop(0, gy % 2 === 0 ? '#8bd48f' : '#82ce86');
        g2.addColorStop(1, gy % 2 === 0 ? '#70c07b' : '#67b973');
        drawRoundedRect(ctx, x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 10);
        ctx.fillStyle = g2;
        ctx.fill();

        // texture dots
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let n = 0; n < 6; n++) {
          const dx = x + 8 + ((n * 11 + gx * 13 + gy * 7) % (TILE_SIZE - 16));
          const dy = y + 8 + ((n * 7 + gx * 5 + gy * 11) % (TILE_SIZE - 16));
          ctx.fillRect(dx, dy, 2, 2);
        }
      }
    }

    // Cell dividers (subtle)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let x = 1; x < GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, canvasHeight);
      ctx.stroke();
    }
    for (let y = 1; y < GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(canvasWidth, y * TILE_SIZE);
      ctx.stroke();
    }
  };

  const getTileCenter = (x: number, y: number) => ({
    x: x * TILE_SIZE + TILE_SIZE / 2,
    y: y * TILE_SIZE + TILE_SIZE / 2,
  });

  const drawRockTile = (ctx: CanvasRenderingContext2D, gx: number, gy: number) => {
    const { x, y } = getTileCenter(gx, gy);
    drawShadow(ctx, x - TILE_SIZE / 2 + 6, y - TILE_SIZE / 2 + 8, TILE_SIZE - 12, TILE_SIZE - 12);
    const grad = ctx.createRadialGradient(x, y, 6, x, y, TILE_SIZE / 2);
    grad.addColorStop(0, '#6b5848');
    grad.addColorStop(1, '#4e3f34');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, x - TILE_SIZE / 2 + 6, y - TILE_SIZE / 2 + 6, TILE_SIZE - 12, TILE_SIZE - 12, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawGem = (ctx: CanvasRenderingContext2D, gx: number, gy: number) => {
    const { x, y } = getTileCenter(gx, gy);
    const bob = Math.sin((timeRef.current + gx * 20 + gy * 13) * 0.01) * 3;
    drawGlow(ctx, x, y + bob, 20, 'rgba(125, 211, 252, 0.9)', 0.35); // cyan glow
    // diamond shape
    ctx.save();
    ctx.translate(x, y + bob);
    const g = ctx.createLinearGradient(0, -16, 0, 16);
    g.addColorStop(0, '#b3e5fc');
    g.addColorStop(1, '#03a9f4');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#0277bd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // facets
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 16);
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();
    ctx.restore();
  };

  const drawFruit = (ctx: CanvasRenderingContext2D, gx: number, gy: number, type: 'banana' | 'coconut' | 'mango') => {
    const { x, y } = getTileCenter(gx, gy);
    const bob = Math.sin((timeRef.current + gx * 17 + gy * 11) * 0.012) * 3;
    if (type === 'banana') {
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(-0.2);
      ctx.fillStyle = '#ffd54a';
      ctx.strokeStyle = '#c28a00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(0, -18, 14, -4);
      ctx.quadraticCurveTo(4, 6, -10, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (type === 'coconut') {
      const grad = ctx.createRadialGradient(x - 4, y + bob - 4, 2, x, y + bob, 14);
      grad.addColorStop(0, '#a17248');
      grad.addColorStop(1, '#6b4a2f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y + bob, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8d5c4';
      ctx.beginPath();
      ctx.arc(x - 4, y + bob - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 0, y + bob - 3, 2, 0, Math.PI * 2);
      ctx.arc(x + 4, y + bob - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // mango
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(0.2);
      const grad = ctx.createLinearGradient(-12, -12, 12, 12);
      grad.addColorStop(0, '#ffa726');
      grad.addColorStop(1, '#fb8c00');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#c25200';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, gx: number, gy: number, open: boolean) => {
    const { x, y } = getTileCenter(gx, gy);
    const w = TILE_SIZE - 14;
    const h = TILE_SIZE - 10;
    const px = x - w / 2;
    const py = y - h / 2 + 4;
    drawShadow(ctx, px, py, w, h);
    const grad = ctx.createLinearGradient(px, py, px, py + h);
    grad.addColorStop(0, open ? '#7ecb7e' : '#8d6e63');
    grad.addColorStop(1, open ? '#43a047' : '#5d4037');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, px, py, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // knob/lock
    ctx.fillStyle = open ? '#2e7d32' : '#ffd54a';
    ctx.beginPath();
    ctx.arc(px + w - 14, py + h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw treasure chest for exit
  const drawChest = (ctx: CanvasRenderingContext2D, gx: number, gy: number) => {
    const { x, y } = getTileCenter(gx, gy);
    drawShadow(ctx, x - TILE_SIZE / 2 + 6, y - TILE_SIZE / 2 + 10, TILE_SIZE - 12, TILE_SIZE - 16);
    // base
    const base = ctx.createLinearGradient(x - 20, y - 8, x - 20, y + 18);
    base.addColorStop(0, '#c57a1a');
    base.addColorStop(1, '#8a4f0f');
    ctx.fillStyle = base;
    drawRoundedRect(ctx, x - 22, y - 8, 44, 26, 6);
    ctx.fill();
    // lid
    const lid = ctx.createLinearGradient(x - 20, y - 26, x - 20, y - 6);
    lid.addColorStop(0, '#e6a04d');
    lid.addColorStop(1, '#b87426');
    ctx.fillStyle = lid;
    drawRoundedRect(ctx, x - 24, y - 26, 48, 18, 8);
    ctx.fill();
    // lock
    ctx.fillStyle = '#ffd54a';
    ctx.beginPath();
    ctx.arc(x, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const center = displayPosRef.current ?? getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
    const wobble = Math.sin(timeRef.current * 0.005) * 1.5;
    const px = center.x;
    const py = center.y + wobble;
    // glow
    drawGlow(ctx, px, py, 22, 'rgba(255,255,255,0.8)', 0.2);
    // badge
    const grad = ctx.createRadialGradient(px - 6, py - 6, 2, px, py, 24);
    grad.addColorStop(0, '#ffe2b8');
    grad.addColorStop(1, '#ffb74d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  // emoji character (use emoji-capable fonts; Windows: Segoe UI Emoji)
  ctx.font = `${Math.floor(TILE_SIZE * 0.6)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedCharacter.emoji, px, py + 1);
  };

  const drawCoins = (ctx: CanvasRenderingContext2D) => {
    gameState.coins.forEach(coin => {
      if (!coin.collected) {
        drawGem(ctx, coin.x, coin.y);
      }
    });
  };

  const drawExit = (ctx: CanvasRenderingContext2D) => {
    drawChest(ctx, gameState.exitPosition.x, gameState.exitPosition.y);
  };

  const drawPlatforms = (ctx: CanvasRenderingContext2D) => {
    // Render obstacles as trees
    gameState.platforms.forEach(platform => {
      const { x, y } = getTileCenter(platform.x, platform.y);
      // trunk
      ctx.fillStyle = '#6d4c41';
      drawRoundedRect(ctx, x - 6, y - 6, 12, 22, 3);
      ctx.fill();
      // foliage
      const g = ctx.createRadialGradient(x, y - 16, 4, x, y - 16, 20);
      g.addColorStop(0, '#a5d6a7');
      g.addColorStop(1, '#388e3c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y - 16, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 10, y - 10, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 10, y - 10, 14, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawFruits = (ctx: CanvasRenderingContext2D) => {
    gameState.fruits?.forEach(fruit => {
      if (!fruit.collected) {
        drawFruit(ctx, fruit.x, fruit.y, fruit.type);
      }
    });
  };

  const drawKeys = (ctx: CanvasRenderingContext2D) => {
    gameState.keys?.forEach(key => {
      if (!key.collected) {
        const { x, y } = getTileCenter(key.x, key.y);
        const bob = Math.sin((timeRef.current + key.x * 29 + key.y * 19) * 0.012) * 3;
        drawGlow(ctx, x, y + bob, 18, 'rgba(255,215,0,0.8)', 0.3);
        // key body
        ctx.strokeStyle = '#8a6b00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x - 6, y + bob - 2, 6, 0, Math.PI * 2);
        ctx.moveTo(x, y + bob - 2);
        ctx.lineTo(x + 10, y + bob - 2);
        ctx.moveTo(x + 10, y + bob - 2);
        ctx.lineTo(x + 10, y + bob + 4);
        ctx.moveTo(x + 6, y + bob + 4);
        ctx.lineTo(x + 14, y + bob + 4);
        ctx.stroke();
      }
    });
  };

  const drawDoors = (ctx: CanvasRenderingContext2D) => {
    gameState.doors?.forEach(door => {
      drawDoor(ctx, door.x, door.y, door.isOpen);
    });
  };

  const drawAnimals = (ctx: CanvasRenderingContext2D) => {
    gameState.animals?.forEach(animal => {
      const { x, y } = getTileCenter(animal.x, animal.y);
      const wob = Math.sin((timeRef.current + animal.x * 9 + animal.y * 7) * 0.01) * 2;
      ctx.font = `${TILE_SIZE * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emoji = animal.type === 'monkey' ? '🐵' : animal.type === 'parrot' ? '🦜' : '🦋';
      ctx.fillText(emoji, x, y + wob);
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      const a = 1 - p.life / p.maxLife;
      ctx.globalAlpha = 1 - a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.size * (1 - a)), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  // Game logic
  const isValidMove = (x: number, y: number): boolean => {
    // Check boundaries
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
    
    // Check for obstacles (platforms/trees)
    const isObstacle = gameState.platforms.some(platform => 
      platform.x === x && platform.y === y
    );
    
    // Check for closed doors
    const isBlockedDoor = gameState.doors?.some(door => 
      door.x === x && door.y === y && !door.isOpen
    ) || false;
    
    return !isObstacle && !isBlockedDoor;
  };

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Compute next tile from latest state inside setter to avoid stale closures during loops
    setGameState(prev => {
      let newX = prev.playerPosition.x;
      let newY = prev.playerPosition.y;
      switch (direction) {
        case 'up': newY -= 1; break;
        case 'down': newY += 1; break;
        case 'left': newX -= 1; break;
        case 'right': newX += 1; break;
      }
      if (!isValidMove(newX, newY)) return prev; // no change

  // Logical position updates immediately; display position lerps in the game loop
  isMovingRef.current = false; // ensure executor doesn't wait

      const ns = { ...prev, playerPosition: { x: newX, y: newY } };
      // Collectibles and interactions
      let collectedSomething = false;
      ns.coins.forEach((coin, idx) => {
        if (!coin.collected && coin.x === newX && coin.y === newY) {
          ns.coins[idx].collected = true;
          ns.score += 10;
          collectedSomething = true;
          soundManager.playSuccessSound();
          // particles
          const c = getTileCenter(newX, newY);
      for (let i = 0; i < 16; i++) {
            particlesRef.current.push({
              x: c.x, y: c.y,
              vx: (Math.random() - 0.5) * 140,
              vy: (Math.random() - 0.5) * 140,
              life: 0, maxLife: 450,
        color: '#7dd3fc', size: 4 + Math.random() * 3
            });
          }
        }
      });
      ns.fruits?.forEach((fruit, idx) => {
        if (!fruit.collected && fruit.x === newX && fruit.y === newY) {
          ns.fruits![idx].collected = true;
          ns.score += 5;
          collectedSomething = true;
          soundManager.playSuccessSound();
          const c = getTileCenter(newX, newY);
          for (let i = 0; i < 12; i++) {
            particlesRef.current.push({
              x: c.x, y: c.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              life: 0, maxLife: 400,
              color: '#a5d6a7', size: 3 + Math.random() * 3
            });
          }
        }
      });
      ns.keys?.forEach((key, idx) => {
        if (!key.collected && key.x === newX && key.y === newY) {
          ns.keys![idx].collected = true;
          ns.keysCollected += 1;
          collectedSomething = true;
          soundManager.playSuccessSound();
          ns.doors?.forEach((_, di) => {
            ns.doors![di].isOpen = true;
          });
        }
      });

      if (collectedSomething) {
        screenShakeRef.current = { t: 150, mag: 2 };
      }

      // Level completion check
      if (newX === ns.exitPosition.x && newY === ns.exitPosition.y) {
        const allCoins = ns.coins.every(c => c.collected);
        const allFruits = ns.fruits?.every(f => f.collected) ?? true;
        if (allCoins && allFruits) {
          ns.levelComplete = true;
          soundManager.playLevelComplete();
          onLevelComplete?.();
        }
      }
  return ns;
    });
  };

  // Drawing loop
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

  // Ensure device pixel ratio scaling stays applied
  const dpr = dprRef.current;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { x: shakeX, y: shakeY } = withShake(0, 0);
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Clear canvas
    ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

    // Draw scene
    drawGrid(ctx);
    drawPlatforms(ctx);
    drawCoins(ctx);
    drawFruits(ctx);
    drawKeys(ctx);
    drawDoors(ctx);
    drawAnimals(ctx);
    drawExit(ctx);
    drawPlayer(ctx);
    drawParticles(ctx);

    ctx.restore();

    // Vignette overlay
    const g = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.7
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // UI overlay
    ctx.save();
    const panelW = 220, panelH = 88;
    drawRoundedRect(ctx, 8, 8, panelW, panelH, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,139,34,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 18, 30);
    ctx.fillText(`Keys: ${gameState.keysCollected}`, 18, 52);
    if (gameState.timeRemaining) ctx.fillText(`Time: ${gameState.timeRemaining}s`, 18, 74);
    ctx.restore();
  };

  // Game loop (requestAnimationFrame)
  useEffect(() => {
    const loop = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      timeRef.current += dt;

  // Ensure display position exists and smoothly follows logical position
  if (!displayPosRef.current) {
        const c = getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
        displayPosRef.current = { x: c.x, y: c.y };
      }
      {
        const c = getTileCenter(gameState.playerPosition.x, gameState.playerPosition.y);
        const d = displayPosRef.current!;
        const smoothing = 0.25; // subtle, non-blocking
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

      // Countdown timer, if enabled
      if (gameState.timeRemaining !== undefined && gameState.timeRemaining > 0) {
        // reduce around each second
        const newTime = Math.max(0, (gameState.timeRemaining * 1000 - dt) / 1000);
        if (Math.floor(newTime) !== Math.floor(gameState.timeRemaining)) {
          setGameState(prev => ({ ...prev, timeRemaining: Math.floor(newTime) }));
        }
      }

      draw();
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.playerPosition.x, gameState.playerPosition.y, gameState.score, gameState.keysCollected, gameState.timeRemaining]);

  // Command execution
  const executeCommands = (commandList: Command[]) => {
    if (isExecuting || commandList.length === 0) return;

    setIsExecuting(true);
    let commandIndex = 0;

  // In snap mode we don't need to wait for animations; still keep a microtask delay
  const queueNext = (next: () => void) => Promise.resolve().then(next);

    const executeNextCommand = () => {
      if (commandIndex >= commandList.length) {
        setIsExecuting(false);
        onCommandComplete?.();
        return;
      }

  const command = commandList[commandIndex];
      commandIndex++;

      // Support both old and new formats
      const type: string = command.type;
      if (type === 'move') {
        movePlayer((command as Extract<Command, { type: 'move' }>).direction);
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'jump') {
        movePlayer('up');
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'move_up' || type === 'up') {
        movePlayer('up');
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'move_down' || type === 'down') {
        movePlayer('down');
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'move_left' || type === 'left') {
        movePlayer('left');
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'move_right' || type === 'right') {
        movePlayer('right');
        queueNext(executeNextCommand);
        return;
      }
      if (type === 'wait') {
        // Pause without moving
        setTimeout(executeNextCommand, 400);
        return;
      }
      // Unknown command: skip quickly
      setTimeout(executeNextCommand, 50);
    };

    executeNextCommand();
  };

  // Execute commands when they change
  useEffect(() => {
    if (commands.length > 0) {
      executeCommands(commands);
    }
  }, [commands]);

  // Update parent component with game state
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  // Optional keyboard controls (arrows / WASD)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isExecuting) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayer('up'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayer('down'); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayer('left'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayer('right'); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExecuting]);

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
  const c = getTileCenter(Math.floor(currentLevel.player.x / TILE_SIZE), Math.floor(currentLevel.player.y / TILE_SIZE));
  displayPosRef.current = { x: c.x, y: c.y };
  isMovingRef.current = false;
  moveStartRef.current = null;
  moveTargetRef.current = null;
  moveProgressRef.current = 0;
  particlesRef.current = [];
  screenShakeRef.current = { t: 0, mag: 0 };
  };

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
      </div>
      
      <div className="relative border-[6px] border-emerald-700 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.25)] bg-gradient-to-br from-emerald-50 to-green-100">
        {/* Ornamental inner frame */}
        <div className="pointer-events-none absolute inset-0 rounded-xl" style={{boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.25), inset 0 0 30px rgba(16, 122, 87, 0.25)'}} />
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
          <span className="text-2xl">{isExecuting ? '🏃‍♂️' : '✅'}</span>
          <span className="text-green-700 font-semibold">
            {isExecuting ? 'Moving...' : 'Ready to code!'}
          </span>
        </div>
        
        <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md">
          <span className="font-bold">Score: {gameState.score}</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-green-600">
        💡 Collect all 💎 gems and 🍌 fruits, then reach the � chest!
      </div>
    </div>
  );
}
