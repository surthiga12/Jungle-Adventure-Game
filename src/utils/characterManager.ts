export interface Character {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  isUnlocked: boolean;
  category: 'default' | 'jungle' | 'water' | 'sky';
}

export const CHARACTERS: Character[] = [
  // Default characters (free)
  {
  id: 'boy',
  name: 'Adventurer Boy',
  emoji: '👦',
  description: 'A brave young explorer ready for the jungle!',
    cost: 0,
    isUnlocked: true,
    category: 'default'
  },
  {
  id: 'girl',
  name: 'Adventurer Girl',
  emoji: '👧',
  description: 'A smart explorer who plans her path carefully!',
    cost: 0,
    isUnlocked: true,
    category: 'default'
  },
  
  // Jungle animals (unlock with coins)
  {
    id: 'tiger',
    name: 'Taj the Tiger',
    emoji: '🐅',
    description: 'A brave tiger explorer with sharp instincts!',
    cost: 100,
    isUnlocked: false,
    category: 'jungle'
  },
  {
    id: 'lion',
    name: 'Leo the Lion',
    emoji: '🦁',
    description: 'The king of the jungle with royal courage!',
    cost: 150,
    isUnlocked: false,
    category: 'jungle'
  },
  {
    id: 'panda',
    name: 'Po the Panda',
    emoji: '🐼',
    description: 'A gentle panda who brings good luck!',
    cost: 120,
    isUnlocked: false,
    category: 'jungle'
  },
  {
    id: 'gorilla',
    name: 'Kong the Gorilla',
    emoji: '🦍',
    description: 'A strong gorilla who can overcome any obstacle!',
    cost: 200,
    isUnlocked: false,
    category: 'jungle'
  },
  
  // Water animals
  {
    id: 'frog',
    name: 'Freddy the Frog',
    emoji: '🐸',
    description: 'A smart frog who hops through challenges!',
    cost: 80,
    isUnlocked: false,
    category: 'water'
  },
  {
    id: 'turtle',
    name: 'Turbo the Turtle',
    emoji: '🐢',
    description: 'A patient turtle who thinks before moving!',
    cost: 90,
    isUnlocked: false,
    category: 'water'
  },
  
  // Sky animals
  {
    id: 'parrot',
    name: 'Polly the Parrot',
    emoji: '🦜',
    description: 'A colorful parrot with keen eyesight!',
    cost: 110,
    isUnlocked: false,
    category: 'sky'
  },
  {
    id: 'eagle',
    name: 'Eddie the Eagle',
    emoji: '🦅',
    description: 'A majestic eagle who soars above challenges!',
    cost: 180,
    isUnlocked: false,
    category: 'sky'
  }
];

export class CharacterManager {
  private characters: Character[] = [];
  private selectedCharacter: string = 'boy';
  private totalCoins: number = 0;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jungleCharacters');
      const savedCoins = localStorage.getItem('totalCoins');
      const savedSelected = localStorage.getItem('selectedCharacter');
      
      if (saved) {
        this.characters = JSON.parse(saved);
        // Migration: ensure boy/girl defaults exist and are unlocked
        const ensureDefault = (id: string, fallback: Character) => {
          const idx = this.characters.findIndex(c => c.id === id);
          if (idx === -1) {
            // Insert fresh default
            this.characters.unshift({ ...fallback, isUnlocked: true });
          } else {
            // Merge to refresh emoji/name/description and ensure unlocked
            const current = this.characters[idx];
            this.characters[idx] = {
              ...current,
              name: fallback.name,
              emoji: fallback.emoji,
              description: fallback.description,
              category: fallback.category,
              cost: 0,
              isUnlocked: true,
            };
          }
        };
        const boy = CHARACTERS.find(c => c.id === 'boy')!;
        const girl = CHARACTERS.find(c => c.id === 'girl')!;
        ensureDefault('boy', boy);
        ensureDefault('girl', girl);
        this.saveToStorage(); // Save the migration
      } else {
        this.characters = [...CHARACTERS];
      }

      this.totalCoins = savedCoins ? parseInt(savedCoins) : 0;
      const sel = savedSelected || 'boy';
      // Map legacy defaults
      this.selectedCharacter = sel === 'monkey' || sel === 'elephant' ? 'boy' : sel;
      // Ensure selected character exists and is unlocked
      if (!this.characters.find(c => c.id === this.selectedCharacter && c.isUnlocked)) {
        this.selectedCharacter = 'boy';
      }
    } else {
      this.characters = [...CHARACTERS];
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jungleCharacters', JSON.stringify(this.characters));
      localStorage.setItem('totalCoins', this.totalCoins.toString());
      localStorage.setItem('selectedCharacter', this.selectedCharacter);
    }
  }

  getCharacters(): Character[] {
    return this.characters;
  }

  getSelectedCharacter(): Character {
    return this.characters.find(c => c.id === this.selectedCharacter) || this.characters[0];
  }

  setSelectedCharacter(characterId: string) {
    const character = this.characters.find(c => c.id === characterId);
    if (character && character.isUnlocked) {
      this.selectedCharacter = characterId;
      this.saveToStorage();
    }
  }

  addCoins(amount: number) {
    this.totalCoins += amount;
    this.saveToStorage();
  }

  getTotalCoins(): number {
    return this.totalCoins;
  }

  unlockCharacter(characterId: string): boolean {
    const character = this.characters.find(c => c.id === characterId);
    if (character && !character.isUnlocked && this.totalCoins >= character.cost) {
      this.totalCoins -= character.cost;
      character.isUnlocked = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getUnlockedCharacters(): Character[] {
    return this.characters.filter(c => c.isUnlocked);
  }

  getLockedCharacters(): Character[] {
    return this.characters.filter(c => !c.isUnlocked);
  }

  canUnlockCharacter(characterId: string): boolean {
    const character = this.characters.find(c => c.id === characterId);
    return character ? !character.isUnlocked && this.totalCoins >= character.cost : false;
  }

  canUnlock(characterId: string): boolean {
    const character = this.characters.find(c => c.id === characterId);
    return character ? !character.isUnlocked && this.totalCoins >= character.cost : false;
  }

  resetToDefaults(): void {
    // Reset all characters to default state
    this.characters = CHARACTERS.map(char => ({ ...char }));
    this.totalCoins = 0;
    this.selectedCharacter = 'boy'; // Default character
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('totalCoins');
      localStorage.removeItem('unlockedCharacters');
      localStorage.removeItem('selectedCharacter');
    }
  }
}
