'use client';

import { useEffect, useRef, useState } from 'react';
import { SoundManager } from '@/utils/soundManager';

interface GardenCanvasProps {
  commands?: any[];
  onCommandComplete?: () => void;
  onGardenStateChange?: (state: GardenState) => void;
}

interface GardenState {
  seeds: { x: number; y: number; stage: 'seed' | 'sprout' | 'flower'; sparkles?: number }[];
  pet: { x: number; y: number; action: string };
}

export default function GardenCanvas({ commands = [], onCommandComplete, onGardenStateChange }: GardenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gardenState, setGardenState] = useState<GardenState>({
    seeds: [],
    pet: { x: 400, y: 300, action: 'idle' }
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [soundManager] = useState(() => new SoundManager());
  const [sparkleEffect, setSparkleEffect] = useState<{x: number, y: number, time: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw garden background
    drawGarden(ctx);
    
    // Draw seeds/plants
    gardenState.seeds.forEach(seed => {
      drawPlant(ctx, seed.x, seed.y, seed.stage);
    });

    // Draw pet
    drawPet(ctx, gardenState.pet.x, gardenState.pet.y, gardenState.pet.action);

    // Draw sparkle effects
    drawSparkles(ctx);

    // Notify parent of state changes
    onGardenStateChange?.(gardenState);

  }, [gardenState, onGardenStateChange]);

  const drawGarden = (ctx: CanvasRenderingContext2D) => {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 400, 800, 200);

    // Grass
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 800; i += 5) {
      ctx.fillRect(i, 390 + Math.random() * 20, 2, 15);
    }

    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 100, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Clouds
    drawCloud(ctx, 150, 80);
    drawCloud(ctx, 500, 120);
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.arc(x + 20, y, 30, 0, 2 * Math.PI);
    ctx.arc(x + 40, y, 25, 0, 2 * Math.PI);
    ctx.fill();
  };

  const addSparkleEffect = (x: number, y: number) => {
    setSparkleEffect(prev => [
      ...prev,
      { x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 20, time: Date.now() }
    ]);
  };

  const drawSparkles = (ctx: CanvasRenderingContext2D) => {
    const now = Date.now();
    const validSparkles = sparkleEffect.filter(sparkle => now - sparkle.time < 2000);
    
    validSparkles.forEach(sparkle => {
      const age = now - sparkle.time;
      const opacity = Math.max(0, 1 - age / 2000);
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px Arial';
      ctx.fillText('✨', sparkle.x, sparkle.y);
      ctx.restore();
    });
    
    setSparkleEffect(validSparkles);
  };

  const drawPlant = (ctx: CanvasRenderingContext2D, x: number, y: number, stage: string) => {
    switch (stage) {
      case 'seed':
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'sprout':
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 20);
        ctx.stroke();
        // Small leaves
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(x - 5, y - 15, 3, 6, -Math.PI/4, 0, 2 * Math.PI);
        ctx.ellipse(x + 5, y - 15, 3, 6, Math.PI/4, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'flower':
        // Stem
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 40);
        ctx.stroke();
        // Flower petals
        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          const petalX = x + Math.cos(angle) * 8;
          const petalY = y - 40 + Math.sin(angle) * 8;
          ctx.beginPath();
          ctx.arc(petalX, petalY, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
        // Flower center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y - 40, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add sparkles around blooming flowers
        addSparkleEffect(x, y - 40);
        break;
    }
  };

  const drawPet = (ctx: CanvasRenderingContext2D, x: number, y: number, action: string) => {
    // Pet body (cat)
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 15, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Pet head
    ctx.beginPath();
    ctx.arc(x, y - 20, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 25);
    ctx.lineTo(x - 15, y - 35);
    ctx.lineTo(x - 5, y - 30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 25);
    ctx.lineTo(x + 15, y - 35);
    ctx.lineTo(x + 5, y - 30);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 5, y - 22, 2, 0, 2 * Math.PI);
    ctx.arc(x + 5, y - 22, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(x, y - 18, 1, 0, 2 * Math.PI);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (action === 'dancing') {
      // Wavy tail when dancing
      ctx.moveTo(x + 20, y);
      ctx.quadraticCurveTo(x + 30, y - 15, x + 25, y - 25);
    } else {
      // Normal tail
      ctx.moveTo(x + 20, y);
      ctx.quadraticCurveTo(x + 35, y - 10, x + 30, y - 20);
    }
    ctx.stroke();

    // Action-specific animations
    if (action === 'dancing') {
      // Add sparkles around pet
      for (let i = 0; i < 5; i++) {
        const sparkleX = x + (Math.random() - 0.5) * 60;
        const sparkleY = y + (Math.random() - 0.5) * 60;
        drawSparkle(ctx, sparkleX, sparkleY);
      }
    }
  };

  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.fillText('✨', x, y);
  };

  const executeCommands = async (commandList: any[]) => {
    if (isExecuting || commandList.length === 0) return;
    
    setIsExecuting(true);
    
    for (const command of commandList) {
      await executeCommand(command);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between commands
    }
    
    setIsExecuting(false);
    onCommandComplete?.();
  };

  const executeCommand = async (command: any): Promise<void> => {
    return new Promise((resolve) => {
      setGardenState(prev => {
        const newState = { ...prev };
        
        switch (command.action) {
          case 'plant_seed':
            const x = 100 + prev.seeds.length * 80;
            const y = 450;
            newState.seeds.push({ x, y, stage: 'seed' });
            newState.pet = { ...prev.pet, action: 'planting' };
            soundManager.playPlantSound();
            break;
          case 'water':
            newState.seeds = prev.seeds.map(seed => 
              seed.stage === 'seed' ? { ...seed, stage: 'sprout' } : seed
            );
            newState.pet = { ...prev.pet, action: 'watering' };
            soundManager.playWaterSound();
            break;
          case 'grow':
            newState.seeds = prev.seeds.map(seed => 
              seed.stage === 'sprout' ? { ...seed, stage: 'flower' } : seed
            );
            newState.pet = { ...prev.pet, action: 'growing' };
            soundManager.playGrowSound();
            break;
          case 'play_note':
            soundManager.playNote(command.note);
            newState.pet = { ...prev.pet, action: 'singing' };
            break;
          case 'repeat':
            // Handle repeat logic - this would need to be expanded
            break;
        }
        
        // Reset pet action after a delay
        setTimeout(() => {
          setGardenState(currentState => ({
            ...currentState,
            pet: { ...currentState.pet, action: 'idle' }
          }));
        }, 800);
        
        return newState;
      });
      
      setTimeout(resolve, 1000);
    });
  };

  const resetGarden = () => {
    setGardenState({
      seeds: [],
      pet: { x: 400, y: 300, action: 'idle' }
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
      <canvas
        ref={canvasRef}
        className="border-2 border-blue-300 rounded-lg bg-blue-50 max-w-full max-h-full"
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={resetGarden}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          disabled={isExecuting}
        >
          Reset Garden
        </button>
        <span className="text-sm text-gray-600 py-2">
          {isExecuting ? 'Executing...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
