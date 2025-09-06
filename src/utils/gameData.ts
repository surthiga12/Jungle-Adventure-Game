export interface Level {
  id: number;
  title: string;
  description: string;
  goal: string;
  platforms: { x: number; y: number; width: number; height: number }[];
  coins: { x: number; y: number }[];
  keys: { x: number; y: number }[];
  exit: { x: number; y: number; width: number; height: number };
  playerStart: { x: number; y: number };
  hints: string[];
  starReward: number;
  requiredKeys: number;
  requiredCoins: number;
}

export const levels: Level[] = [
  {
    id: 1,
    title: "First Steps",
    description: "Learn to move your character and collect your first coin!",
    goal: "Move right and collect the coin",
    platforms: [
      { x: 0, y: 450, width: 800, height: 20 }, // Ground
      { x: 200, y: 350, width: 100, height: 20 }
    ],
    coins: [{ x: 220, y: 320 }],
    keys: [],
    exit: { x: 350, y: 370, width: 50, height: 80 },
    playerStart: { x: 50, y: 400 },
    requiredKeys: 0,
    requiredCoins: 1,
    hints: [
      "Use the Move Right block to move your character",
      "Use the Jump block to reach higher platforms",
      "Collect the coin before going to the exit"
    ],
    starReward: 10
  },
  {
    id: 2,
    title: "Key Collector",
    description: "Collect the key to unlock the exit door!",
    goal: "Collect the key and reach the exit",
    platforms: [
      { x: 0, y: 450, width: 800, height: 20 }, // Ground
      { x: 150, y: 350, width: 100, height: 20 },
      { x: 300, y: 250, width: 120, height: 20 },
      { x: 500, y: 350, width: 100, height: 20 }
    ],
    coins: [
      { x: 170, y: 320 },
      { x: 520, y: 320 }
    ],
    keys: [{ x: 340, y: 220 }],
    exit: { x: 700, y: 370, width: 50, height: 80 },
    playerStart: { x: 50, y: 400 },
    requiredKeys: 1,
    requiredCoins: 0,
    hints: [
      "Jump between platforms to reach the key",
      "You need the key to unlock the exit",
      "Try using Move Right, Jump, and Collect blocks"
    ],
    starReward: 15
  },
  {
    id: 3,
    title: "Loop Master",
    description: "Use loops to efficiently collect multiple coins!",
    goal: "Collect all 3 coins using repeat blocks",
    platforms: [
      { x: 0, y: 450, width: 800, height: 20 }, // Ground
      { x: 100, y: 350, width: 80, height: 20 },
      { x: 250, y: 350, width: 80, height: 20 },
      { x: 400, y: 350, width: 80, height: 20 }
    ],
    coins: [
      { x: 120, y: 320 },
      { x: 270, y: 320 },
      { x: 420, y: 320 }
    ],
    keys: [{ x: 600, y: 420 }],
    exit: { x: 700, y: 370, width: 50, height: 80 },
    playerStart: { x: 50, y: 400 },
    requiredKeys: 1,
    requiredCoins: 3,
    hints: [
      "Use a Repeat block to avoid copying the same code",
      "Put Move Right, Jump, Collect inside the repeat",
      "You can repeat the same pattern 3 times"
    ],
    starReward: 20
  },
  {
    id: 4,
    title: "Precision Jumper",
    description: "Navigate tricky platforms to reach your goal!",
    goal: "Collect key and coins, then reach the exit",
    platforms: [
      { x: 0, y: 450, width: 100, height: 20 }, // Ground
      { x: 150, y: 400, width: 60, height: 20 },
      { x: 250, y: 320, width: 60, height: 20 },
      { x: 350, y: 250, width: 80, height: 20 },
      { x: 480, y: 320, width: 60, height: 20 },
      { x: 600, y: 400, width: 100, height: 20 },
      { x: 750, y: 450, width: 50, height: 20 }
    ],
    coins: [
      { x: 270, y: 290 },
      { x: 500, y: 290 }
    ],
    keys: [{ x: 370, y: 220 }],
    exit: { x: 760, y: 370, width: 30, height: 80 },
    playerStart: { x: 20, y: 400 },
    requiredKeys: 1,
    requiredCoins: 2,
    hints: [
      "Time your jumps carefully between platforms",
      "Use Wait blocks if you need to pause",
      "Collect everything before going to the exit"
    ],
    starReward: 25
  },
  {
    id: 5,
    title: "Grand Adventure",
    description: "Master all your skills in this ultimate challenge!",
    goal: "Collect all items and escape through the exit",
    platforms: [
      { x: 0, y: 450, width: 150, height: 20 }, // Ground
      { x: 200, y: 400, width: 100, height: 20 },
      { x: 350, y: 350, width: 80, height: 20 },
      { x: 480, y: 280, width: 100, height: 20 },
      { x: 300, y: 200, width: 120, height: 20 },
      { x: 150, y: 150, width: 100, height: 20 },
      { x: 500, y: 150, width: 150, height: 20 },
      { x: 700, y: 250, width: 100, height: 20 }
    ],
    coins: [
      { x: 220, y: 370 },
      { x: 370, y: 320 },
      { x: 520, y: 250 },
      { x: 170, y: 120 },
      { x: 720, y: 220 }
    ],
    keys: [
      { x: 340, y: 170 },
      { x: 550, y: 120 }
    ],
    exit: { x: 750, y: 170, width: 50, height: 80 },
    playerStart: { x: 50, y: 400 },
    requiredKeys: 2,
    requiredCoins: 5,
    hints: [
      "This level requires all your skills!",
      "Use loops and careful planning",
      "Take your time and think about the sequence"
    ],
    starReward: 50
  }
];

export const badges = [
  { id: 1, name: "First Move", description: "Complete your first level", emoji: "🚶", requirement: 1 },
  { id: 2, name: "Key Master", description: "Collect your first key", emoji: "🗝️", requirement: "collectKey" },
  { id: 3, name: "Coin Collector", description: "Collect 10 coins total", emoji: "💰", requirement: "collect10Coins" },
  { id: 4, name: "Loop Expert", description: "Complete level 3", emoji: "🔄", requirement: 3 },
  { id: 5, name: "Platform Master", description: "Complete all levels", emoji: "🏆", requirement: 5 }
];

export const characters = [
  { id: 1, name: "Boy Hero", type: "boy", emoji: "👦", unlockLevel: 1 },
  { id: 2, name: "Girl Hero", type: "girl", emoji: "👧", unlockLevel: 1 }
];
