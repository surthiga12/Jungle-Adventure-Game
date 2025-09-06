'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameLevel } from './LevelConfig';
import { SoundManager } from '../utils/soundManager';
import { Character } from '../utils/characterManager';

interface JungleMapProps {
  commands?: any[];
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
  vines?: { x: number; y: number; width: number; height: number }[];
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

// NOTE: This legacy component is no longer used. The new grid game lives in GridGameCanvas.
export default function JungleMap({ 
  commands = [], 
  onCommandComplete, 
  onGameStateChange,
  onLevelComplete,
  selectedCharacter,
  currentLevel
}: JungleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundManager] = useState(() => new SoundManager());
  
  // Initialize game state with current level data
  const initializeGameState = useCallback((): JungleGameState => {
    return {
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
      vines: currentLevel.vines?.map(vine => ({ ...vine })) || [],
      fruits: currentLevel.fruits?.map(fruit => ({ ...fruit })) || [],
      keys: currentLevel.keys?.map(key => ({ ...key })) || [],
      doors: currentLevel.doors?.map(door => ({ ...door })) || [],
      animals: currentLevel.animals?.map(animal => ({ ...animal })) || [],
      keysCollected: 0,
      score: 0,
      levelComplete: false,
      timeRemaining: currentLevel.timeLimit,
      showError: false,
    };
  }, [currentLevel]);

  const [gameState, setGameState] = useState<JungleGameState>(initializeGameState);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);

  // Reset game state when level changes
  useEffect(() => {
    setGameState(initializeGameState());
    setIsExecuting(false);
    setCurrentCommandIndex(0);
  }, [currentLevel.id, initializeGameState]);

  // Draw functions
  const drawExplorer = (ctx: CanvasRenderingContext2D, explorer: any, character: string) => {
    const { x, y, width, height } = explorer;
    
    // Simple character - just use emoji
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw character emoji based on selection
    const emoji = character === 'boy' ? '👦' : '👧';
    ctx.fillText(emoji, x + width/2, y + height/2);
    ctx.restore();
  };

  const drawTree = (ctx: CanvasRenderingContext2D, tree: any) => {
    const { x, y, width, height } = tree;
    
    // Simple tree block - just use emoji
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌳', x + width/2, y + height/2);
    ctx.restore();
  };

  const drawGem = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Simple coin - just use emoji
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💎', x + 20, y + 20);
    ctx.restore();
  };

  const drawTreasureChest = (ctx: CanvasRenderingContext2D, chest: any) => {
    const { x, y, width, height, opened } = chest;
    
    // Simple treasure chest - just use emoji
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = opened ? '📦' : '🎁';
    ctx.fillText(emoji, x + width/2, y + height/2);
    ctx.restore();
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: any) => {
    const { x, y, width, height } = enemy;
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👹', x + width/2, y + height/2);
    ctx.restore();
  };

  const drawKey = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗝️', x + 20, y + 20);
    ctx.restore();
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, door: any) => {
    const { x, y, width, height, isOpen } = door;
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = isOpen ? '🚪' : '🔒';
    ctx.fillText(emoji, x + width/2, y + height/2);
    ctx.restore();
  };

  const drawMovingObstacle = (ctx: CanvasRenderingContext2D, obstacle: any) => {
    const { x, y, width, height } = obstacle;
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧱', x + width/2, y + height/2);
    ctx.restore();
  };

  const drawPowerUp = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let emoji = '⭐';
    switch (type) {
      case 'speed': emoji = '💨'; break;
      case 'shield': emoji = '🛡️'; break;
      case 'teleport': emoji = '🌀'; break;
    }
    ctx.fillText(emoji, x + 20, y + 20);
    ctx.restore();
  };

  const drawCrystal = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let emoji = '💎';
    switch (color) {
      case 'red': emoji = '♦️'; break;
      case 'blue': emoji = '💠'; break;
      case 'green': emoji = '🟢'; break;
    }
    ctx.fillText(emoji, x + 20, y + 20);
    ctx.restore();
  };

  const drawSwitch = (ctx: CanvasRenderingContext2D, x: number, y: number, activated: boolean) => {
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = activated ? '🟢' : '🔴';
    ctx.fillText(emoji, x + 20, y + 20);
    ctx.restore();
  };

  const drawBridge = (ctx: CanvasRenderingContext2D, bridge: any) => {
    const { x, y, width, height, isActive } = bridge;
    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = isActive ? '🌉' : '❌';
    ctx.fillText(emoji, x + width/2, y + height/2);
    ctx.restore();
  };

  const drawJungleBackground = (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    // Theme-based background colors
    let backgroundColor = '#E8F5E8';
    let gridColor = '#B0C4B0';
    
  // Widen accepted themes locally; default remains 'jungle'
  const theme: 'jungle' | 'crystal' | 'underwater' | 'cave' | 'forest' = (currentLevel as any).theme || 'jungle';
  switch (theme) {
      case 'crystal':
        backgroundColor = '#E8E8FF';
        gridColor = '#C0C0FF';
        break;
      case 'underwater':
        backgroundColor = '#E0F6FF';
        gridColor = '#A0D6EF';
        break;
      case 'cave':
        backgroundColor = '#F0E8D0';
        gridColor = '#D0C0A0';
        break;
      case 'forest':
      default:
        backgroundColor = '#E8F5E8';
        gridColor = '#B0C4B0';
        break;
    }
    
    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Simple grid lines
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Vertical lines every 40px
    for (let x = 0; x <= canvasWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Horizontal lines every 40px
    for (let y = 0; y <= canvasHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Game logic
  const checkCollisions = useCallback(() => {
    const explorer = gameState.explorer;
    let levelCompleted = false;
    
    // Check gem collection - aligned to grid
    gameState.gems.forEach((gem, index) => {
      if (!gem.collected) {
        // Check if explorer is in same grid cell as gem
        if (explorer.x === gem.x && explorer.y === gem.y) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.gems[index].collected = true;
            newState.score += 10;
            newState.crystalsCollected += 1;
            soundManager.playSuccessSound();
            return newState;
          });
        }
      }
    });

    // Check crystal collection
    gameState.crystals?.forEach((crystal, index) => {
      if (!crystal.collected) {
        if (explorer.x === crystal.x && explorer.y === crystal.y) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.crystals![index].collected = true;
            newState.score += 15;
            newState.crystalsCollected += 1;
            soundManager.playCrystalSound();
            return newState;
          });
        }
      }
    });

    // Check power-up collection
    gameState.powerUps?.forEach((powerUp, index) => {
      if (!powerUp.collected) {
        if (explorer.x === powerUp.x && explorer.y === powerUp.y) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.powerUps![index].collected = true;
            newState.playerPowerUps[powerUp.type] = true;
            newState.score += 20;
            soundManager.playPowerUpSound();
            return newState;
          });
        }
      }
    });

    // Check switch activation
    gameState.switches?.forEach((switchItem, index) => {
      if (explorer.x === switchItem.x && explorer.y === switchItem.y) {
        setGameState(prev => {
          const newState = { ...prev };
          newState.switches![index].activated = true;
          // Activate corresponding bridges
          newState.bridges?.forEach((bridge, bridgeIndex) => {
            newState.bridges![bridgeIndex].isActive = true;
          });
          soundManager.playSwitchSound();
          return newState;
        });
      }
    });

    // Check key collection
    gameState.keys?.forEach((key, index) => {
      if (!key.collected) {
        if (explorer.x === key.x && explorer.y === key.y) {
          setGameState(prev => {
            const newState = { ...prev };
            newState.keys![index].collected = true;
            newState.keysCollected += 1;
            newState.score += 15;
            return newState;
          });
        }
      }
    });

    // Check door interactions
    gameState.doors?.forEach((door, index) => {
      if (!door.isOpen) {
        if (explorer.x === door.x && explorer.y === door.y) {
          if (gameState.keysCollected > 0) {
            setGameState(prev => {
              const newState = { ...prev };
              newState.doors![index].isOpen = true;
              newState.keysCollected -= 1;
              return newState;
            });
          }
        }
      }
    });

    // Check enemy collisions (unless player has shield)
    if (!gameState.playerPowerUps.shield) {
      gameState.enemies?.forEach(enemy => {
        if (explorer.x === enemy.x && explorer.y === enemy.y) {
          setGameState(prev => ({
            ...prev,
            showError: true,
            explorer: { ...currentLevel.explorer } // Reset to start position
          }));
          setTimeout(() => {
            setGameState(prev => ({ ...prev, showError: false }));
          }, 2000);
        }
      });
    }

    // Check moving obstacle collisions (unless player has shield)
    if (!gameState.playerPowerUps.shield) {
      gameState.movingObstacles?.forEach(obstacle => {
        if (explorer.x === obstacle.x && explorer.y === obstacle.y) {
          setGameState(prev => ({
            ...prev,
            showError: true,
            explorer: { ...currentLevel.explorer } // Reset to start position
          }));
          setTimeout(() => {
            setGameState(prev => ({ ...prev, showError: false }));
          }, 2000);
        }
      });
    }
    
    // Check treasure chest - aligned to grid
    const chest = gameState.treasureChest;
    if (!chest.opened) {
      // Check if explorer is in same grid cell as chest
      if (explorer.x === chest.x && explorer.y === chest.y) {
        const allItemsCollected = gameState.crystalsCollected >= gameState.totalCrystalsNeeded;
        if (allItemsCollected) {
          setGameState(prev => ({
            ...prev,
            treasureChest: { ...prev.treasureChest, opened: true },
            levelComplete: true,
            score: prev.score + 50
          }));
          levelCompleted = true;
        }
      }
    }

    if (levelCompleted) {
      setTimeout(() => {
        onLevelComplete?.();
      }, 1000);
    }
  }, [gameState, currentLevel.explorer, onLevelComplete]);

  const checkObstacleCollisions = (newX: number, newY: number): boolean => {
    // Check tree collisions
    for (const tree of gameState.trees) {
      if (newX === tree.x && newY === tree.y) {
        return true;
      }
    }

    // Check closed door collisions
    if (gameState.doors) {
      for (const door of gameState.doors) {
        if (!door.isOpen && newX === door.x && newY === door.y) {
          return true;
        }
      }
    }

    // Check moving obstacle collisions
    if (gameState.movingObstacles) {
      for (const obstacle of gameState.movingObstacles) {
        if (newX === obstacle.x && newY === obstacle.y) {
          return true;
        }
      }
    }

    // Check inactive bridge collisions
    if (gameState.bridges) {
      for (const bridge of gameState.bridges) {
        if (!bridge.isActive && newX === bridge.x && newY === bridge.y) {
          return true;
        }
      }
    }

    return false;
  };

  const moveExplorer = useCallback((direction: string) => {
    setGameState(prev => {
      const baseStep = 40; // Grid size
      const step = prev.playerPowerUps.speed ? baseStep * 2 : baseStep; // Speed boost
      let newX = prev.explorer.x;
      let newY = prev.explorer.y;
      
      // Calculate canvas bounds dynamically
      const maxX = Math.max(
        currentLevel.treasureChest.x + currentLevel.treasureChest.width,
        ...currentLevel.trees.map(t => t.x + t.width),
        ...currentLevel.gems.map(g => g.x + 40),
        ...(currentLevel.keys?.map(k => k.x + 40) || []),
        ...(currentLevel.doors?.map(d => d.x + d.width) || []),
        ...(currentLevel.enemies?.map(e => e.x + e.width) || []),
        ...(currentLevel.movingObstacles?.map(o => o.x + o.width + o.moveRange) || []),
        ...(currentLevel.powerUps?.map(p => p.x + 40) || []),
        ...(currentLevel.crystals?.map(c => c.x + 40) || []),
        ...(currentLevel.switches?.map(s => s.x + 40) || []),
        ...(currentLevel.bridges?.map(b => b.x + b.width) || [])
      );
      
      const maxY = Math.max(
        currentLevel.treasureChest.y + currentLevel.treasureChest.height,
        ...currentLevel.trees.map(t => t.y + t.height),
        ...currentLevel.gems.map(g => g.y + 40),
        ...(currentLevel.keys?.map(k => k.y + 40) || []),
        ...(currentLevel.doors?.map(d => d.y + d.height) || []),
        ...(currentLevel.enemies?.map(e => e.y + e.height) || []),
        ...(currentLevel.movingObstacles?.map(o => o.y + o.height + o.moveRange) || []),
        ...(currentLevel.powerUps?.map(p => p.y + 40) || []),
        ...(currentLevel.crystals?.map(c => c.y + 40) || []),
        ...(currentLevel.switches?.map(s => s.y + 40) || []),
        ...(currentLevel.bridges?.map(b => b.y + b.height) || [])
      );

      const canvasWidth = Math.max(800, maxX + 40);
      const canvasHeight = Math.max(400, maxY + 40);
      
      // Special teleport logic
      if (prev.playerPowerUps.teleport && direction === 'teleport') {
        // Find a safe teleport location (treasure chest area for simplicity)
        newX = currentLevel.treasureChest.x;
        newY = currentLevel.treasureChest.y;
        
        // Disable teleport after use
        return {
          ...prev,
          explorer: { ...prev.explorer, x: newX, y: newY },
          playerPowerUps: { ...prev.playerPowerUps, teleport: false }
        };
      }
      
      switch (direction) {
        case 'up':
          newY = Math.max(0, newY - step);
          break;
        case 'down':
          newY = Math.min(canvasHeight - 40, newY + step);
          break;
        case 'left':
          newX = Math.max(0, newX - step);
          break;
        case 'right':
          newX = Math.min(canvasWidth - 40, newX + step);
          break;
      }
      
      // Check for obstacle collisions
      if (checkObstacleCollisions(newX, newY)) {
        return prev; // Don't move if collision
      }
      
      return {
        ...prev,
        explorer: { ...prev.explorer, x: newX, y: newY }
      };
    });
  }, [gameState.trees, gameState.doors, gameState.movingObstacles, gameState.bridges, currentLevel]);

  // Timer system for time-limited levels
  useEffect(() => {
    if (gameState.timeRemaining && gameState.timeRemaining > 0 && !gameState.levelComplete) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          const newTime = (prev.timeRemaining || 0) - 1;
          if (newTime <= 0) {
            return {
              ...prev,
              timeRemaining: 0,
              showError: true,
              explorer: { ...currentLevel.explorer } // Reset to start
            };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.timeRemaining, gameState.levelComplete, currentLevel.explorer]);

  // Moving obstacles animation
  useEffect(() => {
    if (gameState.movingObstacles && gameState.movingObstacles.length > 0) {
      const interval = setInterval(() => {
        setGameState(prev => {
          const newState = { ...prev };
          newState.movingObstacles = newState.movingObstacles?.map(obstacle => {
            const step = 40;
            let newX = obstacle.x;
            let newY = obstacle.y;
            
            if (obstacle.moveDirection === 'horizontal') {
              const minX = obstacle.initialX!;
              const maxX = obstacle.initialX! + obstacle.moveRange;
              if (obstacle.x >= maxX) {
                newX = obstacle.x - step;
              } else if (obstacle.x <= minX) {
                newX = obstacle.x + step;
              } else {
                // Continue in current direction (simplified)
                newX = obstacle.x + (obstacle.x === minX ? step : -step);
              }
            } else if (obstacle.moveDirection === 'vertical') {
              const minY = obstacle.initialY!;
              const maxY = obstacle.initialY! + obstacle.moveRange;
              if (obstacle.y >= maxY) {
                newY = obstacle.y - step;
              } else if (obstacle.y <= minY) {
                newY = obstacle.y + step;
              } else {
                // Continue in current direction (simplified)
                newY = obstacle.y + (obstacle.y === minY ? step : -step);
              }
            }
            
            return { ...obstacle, x: newX, y: newY };
          });
          return newState;
        });
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [gameState.movingObstacles?.length]);
  useEffect(() => {
    if (commands.length > 0 && !isExecuting) {
      setIsExecuting(true);
      setCurrentCommandIndex(0);
    } else if (commands.length === 0) {
      // Reset execution state when commands are cleared
      setIsExecuting(false);
      setCurrentCommandIndex(0);
    }
  }, [commands.length]); // Only depend on length, not the actual commands array

  useEffect(() => {
    if (isExecuting && currentCommandIndex < commands.length) {
      const command = commands[currentCommandIndex];
      const timer = setTimeout(() => {
        switch (command.type) {
          case 'move_up':
            moveExplorer('up');
            break;
          case 'move_down':
            moveExplorer('down');
            break;
          case 'move_left':
            moveExplorer('left');
            break;
          case 'move_right':
            moveExplorer('right');
            break;
          case 'teleport':
            if (gameState.playerPowerUps.teleport) {
              moveExplorer('teleport');
              soundManager.playTeleportSound();
            }
            break;
          case 'wait':
            // Just wait, no action needed
            break;
        }
        setCurrentCommandIndex(prev => prev + 1);
      }, 800);
      
      return () => clearTimeout(timer);
    } else if (isExecuting && currentCommandIndex >= commands.length) {
      setIsExecuting(false);
      setCurrentCommandIndex(0);
      onCommandComplete?.();
    }
  }, [isExecuting, currentCommandIndex, commands, moveExplorer, onCommandComplete]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

      // Calculate canvas size based on level content
      const maxX = Math.max(
        currentLevel.treasureChest.x + currentLevel.treasureChest.width,
        ...currentLevel.trees.map(t => t.x + t.width),
        ...currentLevel.gems.map(g => g.x + 40),
        ...(currentLevel.keys?.map(k => k.x + 40) || []),
        ...(currentLevel.doors?.map(d => d.x + d.width) || []),
        ...(currentLevel.enemies?.map(e => e.x + e.width) || []),
        ...(currentLevel.movingObstacles?.map(o => o.x + o.width + o.moveRange) || []),
        ...(currentLevel.powerUps?.map(p => p.x + 40) || []),
        ...(currentLevel.crystals?.map(c => c.x + 40) || []),
        ...(currentLevel.switches?.map(s => s.x + 40) || []),
        ...(currentLevel.bridges?.map(b => b.x + b.width) || [])
      );
      
      const maxY = Math.max(
        currentLevel.treasureChest.y + currentLevel.treasureChest.height,
        ...currentLevel.trees.map(t => t.y + t.height),
        ...currentLevel.gems.map(g => g.y + 40),
        ...(currentLevel.keys?.map(k => k.y + 40) || []),
        ...(currentLevel.doors?.map(d => d.y + d.height) || []),
        ...(currentLevel.enemies?.map(e => e.y + e.height) || []),
        ...(currentLevel.movingObstacles?.map(o => o.y + o.height + o.moveRange) || []),
        ...(currentLevel.powerUps?.map(p => p.y + 40) || []),
        ...(currentLevel.crystals?.map(c => c.y + 40) || []),
        ...(currentLevel.switches?.map(s => s.y + 40) || []),
        ...(currentLevel.bridges?.map(b => b.y + b.height) || [])
      );    // Set minimum canvas size but expand for larger levels
    const canvasWidth = Math.max(800, maxX + 40);
    const canvasHeight = Math.max(400, maxY + 40);

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw jungle background
    drawJungleBackground(ctx);
    
    // Draw trees
    gameState.trees.forEach(tree => {
      drawTree(ctx, tree);
    });

    // Draw bridges
    gameState.bridges?.forEach(bridge => {
      drawBridge(ctx, bridge);
    });

    // Draw doors
    gameState.doors?.forEach(door => {
      drawDoor(ctx, door);
    });

    // Draw switches
    gameState.switches?.forEach(switchItem => {
      drawSwitch(ctx, switchItem.x, switchItem.y, switchItem.activated);
    });

    // Draw moving obstacles
    gameState.movingObstacles?.forEach(obstacle => {
      drawMovingObstacle(ctx, obstacle);
    });

    // Draw enemies
    gameState.enemies?.forEach(enemy => {
      drawEnemy(ctx, enemy);
    });
    
    // Draw gems
    gameState.gems.forEach(gem => {
      if (!gem.collected) {
        drawGem(ctx, gem.x, gem.y);
      }
    });

    // Draw crystals
    gameState.crystals?.forEach(crystal => {
      if (!crystal.collected) {
        drawCrystal(ctx, crystal.x, crystal.y, crystal.color);
      }
    });

    // Draw power-ups
    gameState.powerUps?.forEach(powerUp => {
      if (!powerUp.collected) {
        drawPowerUp(ctx, powerUp.x, powerUp.y, powerUp.type);
      }
    });

    // Draw keys
    gameState.keys?.forEach(key => {
      if (!key.collected) {
        drawKey(ctx, key.x, key.y);
      }
    });
    
    // Draw treasure chest
    drawTreasureChest(ctx, gameState.treasureChest);
    
    // Draw explorer
    drawExplorer(ctx, gameState.explorer, selectedCharacter);

  }, [gameState, selectedCharacter, currentLevel]);

  // Check collisions after each render
  useEffect(() => {
    checkCollisions();
  }, [gameState.explorer.x, gameState.explorer.y]);

  // Notify parent of state changes
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState.score, gameState.levelComplete, onGameStateChange]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="border-4 border-green-500 rounded-lg shadow-lg bg-green-50"
        style={{ 
          width: '600px', 
          height: '300px', 
          maxWidth: '100%'
        }}
      />
      
      {/* Game instructions and status */}
      <div className="mt-4 text-center space-y-2">
        <div className={`${currentLevel.theme === 'crystal' ? 'bg-purple-100 border-purple-300' : 
          currentLevel.theme === 'underwater' ? 'bg-blue-100 border-blue-300' :
          currentLevel.theme === 'cave' ? 'bg-yellow-100 border-yellow-300' :
          'bg-green-100 border-green-300'} rounded-lg p-3 border-2`}>
          <p className={`${currentLevel.theme === 'crystal' ? 'text-purple-800' : 
            currentLevel.theme === 'underwater' ? 'text-blue-800' :
            currentLevel.theme === 'cave' ? 'text-yellow-800' :
            'text-green-800'} font-bold text-base flex items-center justify-center space-x-2`}>
            <span className="text-xl">🎯</span>
            <span>{currentLevel.description}</span>
          </p>
          <div className="flex justify-center space-x-4 mt-2 text-sm flex-wrap">
            <span className="flex items-center space-x-1">
              <span>💎</span>
              <span>{gameState.gems.filter(g => g.collected).length}/{gameState.gems.length} gems</span>
            </span>
            {gameState.crystals && gameState.crystals.length > 0 && (
              <span className="flex items-center space-x-1">
                <span>♦️</span>
                <span>{gameState.crystals.filter(c => c.collected).length}/{gameState.crystals.length} crystals</span>
              </span>
            )}
            {gameState.keys && gameState.keys.length > 0 && (
              <span className="flex items-center space-x-1">
                <span>🗝️</span>
                <span>{gameState.keysCollected} keys</span>
              </span>
            )}
            {gameState.timeRemaining && (
              <span className="flex items-center space-x-1">
                <span>⏰</span>
                <span>{gameState.timeRemaining}s</span>
              </span>
            )}
          </div>
          
          {/* Power-up status */}
          {(gameState.playerPowerUps.shield || gameState.playerPowerUps.speed || gameState.playerPowerUps.teleport) && (
            <div className="flex justify-center space-x-2 mt-2">
              {gameState.playerPowerUps.shield && (
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">🛡️ Shield</span>
              )}
              {gameState.playerPowerUps.speed && (
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">💨 Speed</span>
              )}
              {gameState.playerPowerUps.teleport && (
                <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs">🌀 Teleport</span>
              )}
            </div>
          )}
        </div>
        
        {gameState.levelComplete && (
          <div className="bg-yellow-100 rounded-lg p-3 border-2 border-yellow-400">
            <p className="text-yellow-800 font-bold text-lg flex items-center justify-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span>Fantastic! Level {currentLevel.id} completed!</span>
              <span className="text-2xl">🎉</span>
            </p>
          </div>
        )}

        {gameState.showError && (
          <div className="bg-red-100 rounded-lg p-3 border-2 border-red-400">
            <p className="text-red-800 font-bold text-lg flex items-center justify-center space-x-2">
              <span className="text-2xl">💥</span>
              <span>Oops! Try again from the start!</span>
              <span className="text-2xl">🔄</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Error message for incomplete objectives */}
      {gameState.treasureChest.opened === false && 
       gameState.explorer.x === gameState.treasureChest.x && 
       gameState.explorer.y === gameState.treasureChest.y &&
       gameState.crystalsCollected < gameState.totalCrystalsNeeded && (
        <div className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded-lg text-base border-2 border-red-300">
          <span className="flex items-center justify-center space-x-2">
            <span className="text-xl">🔒</span>
            <span>Collect all gems and crystals first to unlock the treasure!</span>
            <span className="text-xl">💎</span>
          </span>
        </div>
      )}
    </div>
  );
}
