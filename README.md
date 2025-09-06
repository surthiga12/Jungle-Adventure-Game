# 🌟 Jungle Adventure Game

An exciting educational coding adventure for kids! Navigate through jungle levels using visual programming with **Blockly**, collect coins, unlock characters, and enjoy daily rewards in this immersive learning experience.

![Jungle Adventure Game](https://img.shields.io/badge/Age-6%2B-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## 🎮 Game Features

### 🧩 **Visual Programming with Blockly**
- **Drag & Drop Coding**: Use intuitive blocks to program your character
- **Movement Commands**: Move Forward, Move Right, Move Left, Move Down
- **Interactive Workspace**: Real-time code generation and execution
- **Educational Focus**: Learn programming concepts through play

### 🎯 **Adventure Gameplay**
- **Multiple Levels**: Progressive difficulty with unique challenges
- **Character Movement**: Guide your explorer through jungle mazes
- **Collectibles**: Gather coins and reach chocolate rewards
- **Goal-Based**: Complete objectives to advance to next levels

### 💰 **Economy & Rewards System**
- **Coin Collection**: Earn coins by completing levels
- **Character Shop**: Purchase and unlock new characters
- **Daily Login Rewards**: 7-day reward cycle with coins and characters
- **Progressive Unlocks**: More characters available as you play

### 🎭 **Character Collection**
- **Default Characters**: Adventurer Boy 👦 & Girl 👧 (Free)
- **Jungle Animals**: 
  - 🐵 Monkey Max (50 coins)
  - 🐘 Elephant Ellie (70 coins)
  - 🦁 Lion Leo (80 coins)
- **Water Creatures**:
  - 🐸 Froggy Fred (60 coins)
  - 🐢 Turbo the Turtle (90 coins)
- **Sky Animals**:
  - 🦜 Polly the Parrot (110 coins)
  - 🦅 Eagle Eddie (120 coins)

### 🎉 **Celebration & Effects**
- **Chocolate Burst**: Spectacular particle effects when reaching goals
- **Level Completion**: Congratulations screen with candy animations
- **Sound Effects**: Engaging audio feedback
- **Visual Polish**: Smooth animations and transitions

### 📅 **Daily Login System**
- **7-Day Cycle**: Progressive rewards for consecutive logins
- **Coin Rewards**: Daily coin bonuses
- **Character Unlocks**: Special characters on day 7
- **Streak Tracking**: Maintain your login streak

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/surthiga12/Jungle-Adventure-Game.git
cd Jungle-Adventure-Game
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to start playing!

## 🎯 How to Play

1. **Daily Login**: Claim your daily reward (first-time players)
2. **Character Selection**: Choose your favorite character
3. **Level Selection**: Pick an unlocked level to play
4. **Programming**: Drag Blockly blocks to create movement commands
5. **Execution**: Click "Run" to watch your character move
6. **Collect**: Gather coins and reach the chocolate to complete levels
7. **Progress**: Use coins to unlock new characters and levels

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main game orchestrator
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── components/
│       └── CharacterSelection.tsx   # Character selection UI
├── components/
│   ├── BlocklyWorkspace.tsx    # Visual programming interface
│   ├── GridGameCanvas.tsx      # Game rendering engine
│   ├── DailyLoginReward.tsx    # Daily reward system
│   ├── JungleMapNew.tsx        # Level selection map
│   └── CharacterSelection.tsx   # Character management
└── utils/
    ├── characterManager.ts      # Character data & purchasing
    ├── gameData.ts             # Level definitions & configuration
    ├── gameManager.ts          # Game state management
    ├── streakManager.ts        # Daily streak tracking
    └── soundManager.ts         # Audio system
```

## 🎓 Educational Benefits

### 💻 **Programming Concepts**
- **Sequential Thinking**: Ordering commands logically
- **Problem Solving**: Breaking down movement into steps
- **Debugging**: Testing and refining code
- **Logic Flow**: Understanding cause and effect

### 🧠 **Cognitive Skills**
- **Spatial Reasoning**: Navigation and direction
- **Planning**: Strategy for efficient movement
- **Pattern Recognition**: Level structure understanding
- **Persistence**: Overcoming challenges

### 🎯 **Game Design Learning**
- **Goal Setting**: Clear objectives and rewards
- **Progression Systems**: Unlockable content
- **User Experience**: Intuitive interface design
- **Motivation**: Achievement and collection mechanics

## 🛠️ Technologies

### **Frontend**
- ![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)
- ![React](https://img.shields.io/badge/React-19-blue?logo=react)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?logo=tailwindcss)

### **Game Engine**
- ![Canvas API](https://img.shields.io/badge/Canvas-API-orange)
- ![Blockly](https://img.shields.io/badge/Blockly-Google-red)
- ![Web Audio](https://img.shields.io/badge/Web%20Audio-API-green)

### **Storage & State**
- ![LocalStorage](https://img.shields.io/badge/LocalStorage-Browser-yellow)
- ![React Hooks](https://img.shields.io/badge/React-Hooks-blue)

## 🎮 Game Reset

For testing or fresh starts, use the built-in reset functionality:
- **In-Game**: Red "🔄 Reset Game" button in character selection
- **External**: Open `reset-game.html` for complete data wipe

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- **Blockly** by Google for visual programming capabilities
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for utility-first styling
- **Educational gaming** community for inspiration

---

**🎯 Perfect for young coders, educators, and anyone who loves adventure games!**

*Made by Surthiga 💙 to inspire the next generation of programmers* 🚀

### 📊 Stats
![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-2000%2B-brightgreen)
![Components](https://img.shields.io/badge/Components-8%2B-blue)
![Characters](https://img.shields.io/badge/Characters-7%2B-purple)
![Levels](https://img.shields.io/badge/Levels-Progressive-orange)

## Project Information
This is an Intern Project Made For NIPIX TECHNOLOGIES
