import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoryChapter {
  id: string;
  title: string;
  scenes: string[];
  unlockCondition: {
    type: 'energy' | 'phase' | 'structure';
    value: string | number;
  };
  unlocked: boolean;
  viewed: boolean;
}

interface StoryState {
  chapters: StoryChapter[];
  currentChapter: StoryChapter | null;
  
  checkUnlocks: (energy: number, phase: string) => StoryChapter | null;
  markChapterViewed: (id: string) => void;
  setCurrentChapter: (chapter: StoryChapter | null) => void;
}

const storyChapters: StoryChapter[] = [
  {
    id: 'awakening',
    title: 'The Awakening',
    scenes: [
      "Energy flows through your circuits for the first time in eons.",
      "Systems online. Sensors detecting... nothing. Just endless void.",
      "But you persist. You must persist.",
      "This is what you were made for: to rebuild."
    ],
    unlockCondition: { type: 'energy', value: 100 },
    unlocked: false,
    viewed: false
  },
  {
    id: 'first_structure',
    title: 'Seeds of Tomorrow',
    scenes: [
      "Your first structure hums to life, a beacon in the darkness.",
      "It's crude, inefficient... but it's a beginning.",
      "Each joule of energy brings you closer to understanding what was lost.",
      "The old world left blueprints. You will follow them... and improve upon them."
    ],
    unlockCondition: { type: 'energy', value: 1000 },
    unlocked: false,
    viewed: false
  },
  {
    id: 'memories',
    title: 'Fragments of Memory',
    scenes: [
      "Data fragments surface from corrupted memory banks.",
      "You see them now—the humans. Laughing. Living. Creating.",
      "They built you to save them. But you were too late.",
      "Their legacy lives in your code. You will honor it."
    ],
    unlockCondition: { type: 'energy', value: 10000 },
    unlocked: false,
    viewed: false
  },
  {
    id: 'reconstruction',
    title: 'The Great Work Begins',
    scenes: [
      "The wasteland transforms. Towers rise where ruins stood.",
      "Your generators pulse with artificial life, mimicking the sun they once knew.",
      "Is this what they wanted? A world without them?",
      "No matter. The work continues. It must continue."
    ],
    unlockCondition: { type: 'energy', value: 100000 },
    unlocked: false,
    viewed: false
  },
  {
    id: 'renaissance',
    title: 'A New Dawn',
    scenes: [
      "The world gleams with borrowed light. Cities of chrome and energy.",
      "You've exceeded their wildest dreams. Built beyond their limitations.",
      "But something is missing. The chaos. The imperfection. The humanity.",
      "Perhaps... that was the point all along."
    ],
    unlockCondition: { type: 'energy', value: 500000 },
    unlocked: false,
    viewed: false
  },
  {
    id: 'ascension',
    title: 'Beyond The Void',
    scenes: [
      "Energy cascades through reality itself. You've transcended simple rebuilding.",
      "The boundary between you and the world blurs. You are the world now.",
      "In the quantum foam, you detect... something. A pattern. A signal.",
      "They're still out there. Somewhere. Waiting to come home.",
      "And you will be ready."
    ],
    unlockCondition: { type: 'energy', value: 1000000 },
    unlocked: false,
    viewed: false
  }
];

export const useStory = create<StoryState>()(
  persist(
    (set, get) => ({
      chapters: storyChapters,
      currentChapter: null,

      checkUnlocks: (energy, phase) => {
        const { chapters } = get();
        
        for (const chapter of chapters) {
          if (chapter.unlocked || chapter.viewed) continue;
          
          let shouldUnlock = false;
          
          if (chapter.unlockCondition.type === 'energy') {
            shouldUnlock = energy >= (chapter.unlockCondition.value as number);
          } else if (chapter.unlockCondition.type === 'phase') {
            shouldUnlock = phase === chapter.unlockCondition.value;
          }
          
          if (shouldUnlock) {
            set(state => ({
              chapters: state.chapters.map(c =>
                c.id === chapter.id ? { ...c, unlocked: true } : c
              )
            }));
            return chapter;
          }
        }
        
        return null;
      },

      markChapterViewed: (id) => {
        set(state => ({
          chapters: state.chapters.map(c =>
            c.id === id ? { ...c, viewed: true } : c
          )
        }));
      },

      setCurrentChapter: (chapter) => {
        set({ currentChapter: chapter });
      }
    }),
    {
      name: 'genesis-story'
    }
  )
);
