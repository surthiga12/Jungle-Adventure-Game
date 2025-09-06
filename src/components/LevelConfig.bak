export interface GameLevel {
  id: number;
  name: string;
  description: string;
  player: { x: number; y: number; width: number; height: number };
  coins: { x: number; y: number; collected: boolean }[];
  exit: { x: number; y: number; width: number; height: number };
  platforms: { x: number; y: number; width: number; height: number }[];
  vines?: { x: number; y: number; width: number; height: number }[];
  fruits?: { x: number; y: number; type: 'banana' | 'coconut' | 'mango'; collected: boolean }[];
  keys?: { x: number; y: number; collected: boolean }[];
  doors?: { x: number; y: number; width: number; height: number; isOpen: boolean }[];
  animals?: { x: number; y: number; width: number; height: number; type: string; friendly: boolean }[];
  timeLimit: number; // Time limit in seconds
  theme: 'jungle';
}

export const GAME_LEVELS: GameLevel[] = [
  // Level 1 - Simple start (8x6 grid)
  {
    id: 1,
    name: "🌴 Jungle Entry",
    description: "Welcome to the jungle! Collect the coin and reach the hut.",
    player: { x: 0, y: 300, width: 60, height: 60 }, // Grid position (0,5)
    coins: [{ x: 240, y: 180, collected: false }], // Grid position (4,3)
    exit: { x: 420, y: 60, width: 60, height: 60 }, // Grid position (7,1)
    platforms: [
      { x: 120, y: 240, width: 60, height: 60 }, // Grid position (2,4)
      { x: 180, y: 240, width: 60, height: 60 }, // Grid position (3,4)
      { x: 360, y: 180, width: 60, height: 60 }, // Grid position (6,3)
    ],
    timeLimit: 60, // 1 minute for beginners
    theme: 'jungle'
  },

  // Level 2 - Multiple coins
  {
    id: 2,
    name: "🐒 Coin Collector",
    description: "Collect all jungle coins and reach the hut!",
    player: { x: 0, y: 240, width: 60, height: 60 }, // Grid position (0,4)
    coins: [
      { x: 120, y: 120, collected: false }, // Grid position (2,2)
      { x: 240, y: 180, collected: false }, // Grid position (4,3)
      { x: 360, y: 60, collected: false }   // Grid position (6,1)
    ],
    exit: { x: 420, y: 240, width: 60, height: 60 }, // Grid position (7,4)
    platforms: [
      { x: 60, y: 180, width: 60, height: 60 },  // Grid position (1,3)
      { x: 180, y: 120, width: 60, height: 60 }, // Grid position (3,2)
      { x: 300, y: 180, width: 60, height: 60 }, // Grid position (5,3)
    ],
    timeLimit: 75, // 1 minute 15 seconds
    theme: 'jungle'
  },

  // Level 3 - With fruits
  {
    id: 3,
    name: "🍍 Fruit Hunter",
    description: "Collect coins and delicious fruits!",
    player: { x: 0, y: 180, width: 60, height: 60 }, // Grid position (0,3)
    coins: [
      { x: 180, y: 60, collected: false },  // Grid position (3,1)
      { x: 300, y: 240, collected: false }  // Grid position (5,4)
    ],
    exit: { x: 420, y: 120, width: 60, height: 60 }, // Grid position (7,2)
    platforms: [
      { x: 120, y: 120, width: 60, height: 60 }, // Grid position (2,2)
      { x: 240, y: 180, width: 60, height: 60 }, // Grid position (4,3)
      { x: 360, y: 180, width: 60, height: 60 }, // Grid position (6,3)
    ],
    fruits: [
      { x: 60, y: 60, type: 'banana', collected: false },   // Grid position (1,1)
      { x: 240, y: 120, type: 'coconut', collected: false } // Grid position (4,2)
    ],
    timeLimit: 90, // 1 minute 30 seconds
    theme: 'jungle'
  },

  // Level 4 - Key and door
  {
    id: 4,
    name: "🗝️ Key Master",
    description: "Find the key to unlock the door!",
    player: { x: 0, y: 240, width: 60, height: 60 }, // Grid position (0,4)
    coins: [
      { x: 120, y: 60, collected: false },  // Grid position (2,1)
      { x: 360, y: 240, collected: false }  // Grid position (6,4)
    ],
    exit: { x: 420, y: 180, width: 60, height: 60 }, // Grid position (7,3)
    platforms: [
      { x: 60, y: 120, width: 60, height: 60 },  // Grid position (1,2)
      { x: 180, y: 180, width: 60, height: 60 }, // Grid position (3,3)
      { x: 240, y: 120, width: 60, height: 60 }, // Grid position (4,2)
    ],
    keys: [
      { x: 60, y: 60, collected: false } // Grid position (1,1)
    ],
    doors: [
      { x: 300, y: 180, width: 60, height: 60, isOpen: false } // Grid position (5,3)
    ],
    timeLimit: 105, // 1 minute 45 seconds
    theme: 'jungle'
  },

  // Level 5 - Animal friends
  {
    id: 5,
    name: "🐵 Animal Friends",
    description: "Meet friendly jungle animals!",
    player: { x: 0, y: 300, width: 60, height: 60 }, // Grid position (0,5)
    coins: [
      { x: 180, y: 120, collected: false }, // Grid position (3,2)
      { x: 300, y: 180, collected: false }, // Grid position (5,3)
      { x: 420, y: 60, collected: false }   // Grid position (7,1)
    ],
    exit: { x: 420, y: 300, width: 60, height: 60 }, // Grid position (7,5)
    platforms: [
      { x: 60, y: 240, width: 60, height: 60 },  // Grid position (1,4)
      { x: 120, y: 180, width: 60, height: 60 }, // Grid position (2,3)
      { x: 240, y: 120, width: 60, height: 60 }, // Grid position (4,2)
      { x: 360, y: 180, width: 60, height: 60 }, // Grid position (6,3)
    ],
    animals: [
      { x: 240, y: 60, width: 60, height: 60, type: 'monkey', friendly: true }, // Grid position (4,1)
      { x: 120, y: 240, width: 60, height: 60, type: 'parrot', friendly: true } // Grid position (2,4)
    ],
    fruits: [
      { x: 60, y: 120, type: 'mango', collected: false } // Grid position (1,2)
    ],
    timeLimit: 120, // 2 minutes
    theme: 'jungle'
  },

  // Level 6 - Maze navigation
  {
    id: 6,
    name: "🌀 Jungle Maze",
    description: "Navigate through the jungle maze!",
    player: { x: 0, y: 180, width: 60, height: 60 }, // Grid position (0,3)
    coins: [
      { x: 120, y: 60, collected: false },  // Grid position (2,1)
      { x: 300, y: 120, collected: false }, // Grid position (5,2)
      { x: 360, y: 300, collected: false }, // Grid position (6,5)
      { x: 420, y: 180, collected: false }  // Grid position (7,3)
    ],
    exit: { x: 420, y: 60, width: 60, height: 60 }, // Grid position (7,1)
    platforms: [
      { x: 60, y: 60, width: 60, height: 60 },   // Grid position (1,1)
      { x: 60, y: 240, width: 60, height: 60 },  // Grid position (1,4)
      { x: 120, y: 180, width: 60, height: 60 }, // Grid position (2,3)
      { x: 180, y: 60, width: 60, height: 60 },  // Grid position (3,1)
      { x: 180, y: 240, width: 60, height: 60 }, // Grid position (3,4)
      { x: 240, y: 180, width: 60, height: 60 }, // Grid position (4,3)
      { x: 300, y: 240, width: 60, height: 60 }, // Grid position (5,4)
    ],
    fruits: [
      { x: 180, y: 120, type: 'banana', collected: false } // Grid position (3,2)
    ],
    timeLimit: 135, // 2 minutes 15 seconds
    theme: 'jungle'
  },

  // Level 7 - Multiple keys and doors
  {
    id: 7,
    name: "🚪 Door Master",
    description: "Collect keys to unlock multiple doors!",
    player: { x: 0, y: 240, width: 60, height: 60 }, // Grid position (0,4)
    coins: [
      { x: 240, y: 60, collected: false },  // Grid position (4,1)
      { x: 420, y: 240, collected: false }  // Grid position (7,4)
    ],
    exit: { x: 420, y: 120, width: 60, height: 60 }, // Grid position (7,2)
    platforms: [
      { x: 120, y: 120, width: 60, height: 60 }, // Grid position (2,2)
      { x: 180, y: 180, width: 60, height: 60 }, // Grid position (3,3)
      { x: 300, y: 60, width: 60, height: 60 },  // Grid position (5,1)
    ],
    keys: [
      { x: 60, y: 120, collected: false } // Grid position (1,2)
    ],
    doors: [
      { x: 180, y: 120, width: 60, height: 60, isOpen: false }, // Grid position (3,2)
      { x: 360, y: 180, width: 60, height: 60, isOpen: false }  // Grid position (6,3)
    ],
    fruits: [
      { x: 240, y: 180, type: 'coconut', collected: false } // Grid position (4,3)
    ],
    timeLimit: 150, // 2 minutes 30 seconds
    theme: 'jungle'
  },

  // Level 8 - Complex layout
  {
    id: 8,
    name: "🦜 Treetop Challenge",
    description: "Navigate the complex treetop maze!",
    player: { x: 0, y: 300, width: 60, height: 60 }, // Grid position (0,5)
    coins: [
      { x: 120, y: 120, collected: false }, // Grid position (2,2)
      { x: 240, y: 60, collected: false },  // Grid position (4,1)
      { x: 300, y: 240, collected: false }, // Grid position (5,4)
      { x: 420, y: 180, collected: false }  // Grid position (7,3)
    ],
    exit: { x: 420, y: 60, width: 60, height: 60 }, // Grid position (7,1)
    platforms: [
      { x: 60, y: 240, width: 60, height: 60 },  // Grid position (1,4)
      { x: 120, y: 180, width: 60, height: 60 }, // Grid position (2,3)
      { x: 180, y: 120, width: 60, height: 60 }, // Grid position (3,2)
      { x: 180, y: 240, width: 60, height: 60 }, // Grid position (3,4)
      { x: 240, y: 180, width: 60, height: 60 }, // Grid position (4,3)
      { x: 300, y: 120, width: 60, height: 60 }, // Grid position (5,2)
      { x: 360, y: 240, width: 60, height: 60 }, // Grid position (6,4)
    ],
    animals: [
      { x: 60, y: 120, width: 60, height: 60, type: 'parrot', friendly: true }, // Grid position (1,2)
      { x: 360, y: 120, width: 60, height: 60, type: 'monkey', friendly: true } // Grid position (6,2)
    ],
    fruits: [
      { x: 180, y: 60, type: 'mango', collected: false },   // Grid position (3,1)
      { x: 240, y: 240, type: 'banana', collected: false }  // Grid position (4,4)
    ],
    timeLimit: 165, // 2 minutes 45 seconds
    theme: 'jungle'
  },

  // Level 9 - Temple adventure
  {
    id: 9,
    name: "🏛️ Ancient Temple",
    description: "Explore the mysterious jungle temple!",
    player: { x: 0, y: 240, width: 60, height: 60 }, // Grid position (0,4)
    coins: [
      { x: 120, y: 60, collected: false },  // Grid position (2,1)
      { x: 240, y: 120, collected: false }, // Grid position (4,2)
      { x: 360, y: 180, collected: false }, // Grid position (6,3)
      { x: 420, y: 300, collected: false }  // Grid position (7,5)
    ],
    exit: { x: 420, y: 60, width: 60, height: 60 }, // Grid position (7,1)
    platforms: [
      { x: 60, y: 180, width: 60, height: 60 },  // Grid position (1,3)
      { x: 120, y: 120, width: 60, height: 60 }, // Grid position (2,2)
      { x: 180, y: 60, width: 60, height: 60 },  // Grid position (3,1)
      { x: 180, y: 180, width: 60, height: 60 }, // Grid position (3,3)
      { x: 240, y: 240, width: 60, height: 60 }, // Grid position (4,4)
      { x: 300, y: 120, width: 60, height: 60 }, // Grid position (5,2)
      { x: 360, y: 240, width: 60, height: 60 }, // Grid position (6,4)
    ],
    keys: [
      { x: 60, y: 60, collected: false } // Grid position (1,1)
    ],
    doors: [
      { x: 300, y: 180, width: 60, height: 60, isOpen: false } // Grid position (5,3)
    ],
    fruits: [
      { x: 180, y: 240, type: 'coconut', collected: false }, // Grid position (3,4)
      { x: 300, y: 60, type: 'mango', collected: false }     // Grid position (5,1)
    ],
    timeLimit: 180, // 3 minutes
    theme: 'jungle'
  },

  // Level 10 - Final challenge
  {
    id: 10,
    name: "👑 Jungle King",
    description: "Master the ultimate jungle challenge!",
    player: { x: 0, y: 300, width: 60, height: 60 }, // Grid position (0,5)
    coins: [
      { x: 120, y: 180, collected: false }, // Grid position (2,3)
      { x: 240, y: 60, collected: false },  // Grid position (4,1)
      { x: 300, y: 240, collected: false }, // Grid position (5,4)
      { x: 360, y: 120, collected: false }, // Grid position (6,2)
      { x: 420, y: 240, collected: false }  // Grid position (7,4)
    ],
    exit: { x: 420, y: 60, width: 60, height: 60 }, // Grid position (7,1)
    platforms: [
      { x: 60, y: 240, width: 60, height: 60 },  // Grid position (1,4)
      { x: 60, y: 120, width: 60, height: 60 },  // Grid position (1,2)
      { x: 120, y: 60, width: 60, height: 60 },  // Grid position (2,1)
      { x: 180, y: 120, width: 60, height: 60 }, // Grid position (3,2)
      { x: 180, y: 240, width: 60, height: 60 }, // Grid position (3,4)
      { x: 240, y: 180, width: 60, height: 60 }, // Grid position (4,3)
      { x: 300, y: 120, width: 60, height: 60 }, // Grid position (5,2)
      { x: 360, y: 240, width: 60, height: 60 }, // Grid position (6,4)
    ],
    keys: [
      { x: 60, y: 60, collected: false } // Grid position (1,1)
    ],
    doors: [
      { x: 240, y: 120, width: 60, height: 60, isOpen: false }, // Grid position (4,2)
      { x: 360, y: 180, width: 60, height: 60, isOpen: false }  // Grid position (6,3)
    ],
    animals: [
      { x: 120, y: 240, width: 60, height: 60, type: 'monkey', friendly: true }, // Grid position (2,4)
      { x: 300, y: 60, width: 60, height: 60, type: 'parrot', friendly: true }   // Grid position (5,1)
    ],
    fruits: [
      { x: 180, y: 60, type: 'banana', collected: false },  // Grid position (3,1)
      { x: 240, y: 240, type: 'mango', collected: false },  // Grid position (4,4)
      { x: 420, y: 180, type: 'coconut', collected: false } // Grid position (7,3)
    ],
    timeLimit: 200, // 3 minutes 20 seconds for final challenge
    theme: 'jungle'
  }
];
