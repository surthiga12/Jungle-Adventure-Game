# 🌱 Kids Coding Garden

A fun, educational coding website for kids in classes 5th–8th built with Next.js and Tailwind CSS. Features a visual programming interface using Blockly, an interactive garden canvas, pet characters, progressive levels, and reward systems designed to motivate young learners.

## ✨ Features

### 🎯 Core Functionality
- **Two-Panel Layout**: Blockly visual coding workspace on the left, interactive garden canvas on the right
- **Visual Programming**: Drag-and-drop coding blocks including Plant Seed, Water, Grow, Play Note, and Repeat loops
- **Interactive Garden**: Canvas-based garden where pet characters perform actions step by step
- **Progressive Levels**: 5 carefully designed levels from basic planting to complex loops and melodies

### 🎮 Game Elements
- **Streak System**: Track consecutive successful levels with 🔥 streak counter
- **Rewards**: Earn ⭐ stars, unlock 🏆 badges, and collect new pet characters
- **Pet Characters**: Cute animated pets (cat, bird, panda) that dance and celebrate with you
- **Sound Effects**: Success sounds, error feedback, musical notes, and celebration fanfares
- **Visual Effects**: Sparkling flowers, pet animations, and level completion celebrations

### 📚 Educational Design
- **Level Progression**: 
  - Level 1: Plant your first seed
  - Level 2: Complete plant lifecycle (plant → water → grow)
  - Level 3: Use loops to create multiple flowers efficiently
  - Level 4: Combine gardening with music creation
  - Level 5: Master challenge with complex sequences
- **Hints System**: Contextual tips for each level
- **Progress Tracking**: LocalStorage persistence for streaks, stars, and unlocked content

### 🎨 Kid-Friendly Design
- **Bright & Playful**: Gradient backgrounds, colorful blocks, emoji-rich interface
- **Responsive**: Works perfectly on tablets, laptops, and desktops
- **Motivational**: Positive feedback, celebrations, and achievement unlocks
- **Professional Quality**: Clean code, smooth animations, polished interactions

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── BlocklyWorkspace.tsx   # Visual coding interface
│   └── GardenCanvas.tsx       # Interactive garden canvas
└── utils/
    ├── gameData.ts       # Level definitions, badges, pets
    ├── gameManager.ts    # Progress tracking, localStorage
    └── soundManager.ts   # Audio effects and music
```

## 🎓 Educational Value

### Programming Concepts Taught
- **Sequence**: Ordering commands in the right steps
- **Loops**: Using repeat blocks for efficiency
- **Cause and Effect**: Seeing immediate visual results from code
- **Problem Solving**: Completing increasingly complex challenges
- **Logical Thinking**: Breaking down tasks into smaller steps

### Skills Developed
- Computational thinking
- Pattern recognition
- Sequential reasoning
- Creative problem solving
- Persistence and debugging mindset

## 🛠️ Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Blockly**: Google's visual programming library
- **Canvas API**: Custom garden rendering and animations
- **Web Audio API**: Real-time sound effects and music
- **LocalStorage**: Progress persistence

---

**Made with ❤️ for the next generation of programmers** 🚀

*Empowering kids to code, create, and grow through playful learning experiences.*
