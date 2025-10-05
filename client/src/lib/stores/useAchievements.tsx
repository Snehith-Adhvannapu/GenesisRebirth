import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  reward: {
    type: 'multiplier' | 'bonus_energy';
    value: number;
  };
  condition: {
    type: 'energy_total' | 'clicks' | 'upgrade_level' | 'generator_level';
    value: number;
  };
}

interface AchievementsState {
  achievements: Achievement[];
  unlockedIds: string[];
  totalMultiplier: number;
  
  checkAchievements: (gameState: any) => Achievement[];
  unlockAchievement: (id: string) => void;
  getActiveMultiplier: () => number;
}

const baseAchievements: Achievement[] = [
  {
    id: 'genesis_awakening',
    name: 'Genesis Awakening',
    description: 'Generate your first Genesis Energy',
    unlocked: false,
    icon: '⚡',
    reward: { type: 'bonus_energy', value: 10 },
    condition: { type: 'energy_total', value: 1 }
  },
  {
    id: 'power_surge',
    name: 'Power Surge',
    description: 'Accumulate 100 Genesis Energy',
    unlocked: false,
    icon: '💫',
    reward: { type: 'multiplier', value: 1.1 },
    condition: { type: 'energy_total', value: 100 }
  },
  {
    id: 'first_upgrade',
    name: 'Enhanced Systems',
    description: 'Purchase your first upgrade',
    unlocked: false,
    icon: '🔧',
    reward: { type: 'bonus_energy', value: 50 },
    condition: { type: 'upgrade_level', value: 1 }
  },
  {
    id: 'automation',
    name: 'Self-Sustaining',
    description: 'Activate the auto-generator',
    unlocked: false,
    icon: '♻️',
    reward: { type: 'multiplier', value: 1.2 },
    condition: { type: 'generator_level', value: 1 }
  },
  {
    id: 'energy_hoarder',
    name: 'Energy Hoarder',
    description: 'Accumulate 10,000 Genesis Energy',
    unlocked: false,
    icon: '💎',
    reward: { type: 'multiplier', value: 1.5 },
    condition: { type: 'energy_total', value: 10000 }
  },
  {
    id: 'click_master',
    name: 'Click Master',
    description: 'Upgrade Energy Amplifier to level 10',
    unlocked: false,
    icon: '👆',
    reward: { type: 'multiplier', value: 1.3 },
    condition: { type: 'upgrade_level', value: 10 }
  },
  {
    id: 'automation_expert',
    name: 'Automation Expert',
    description: 'Upgrade Auto Generator to level 10',
    unlocked: false,
    icon: '🤖',
    reward: { type: 'multiplier', value: 1.4 },
    condition: { type: 'generator_level', value: 10 }
  },
  {
    id: 'energy_tycoon',
    name: 'Energy Tycoon',
    description: 'Accumulate 1,000,000 Genesis Energy',
    unlocked: false,
    icon: '👑',
    reward: { type: 'multiplier', value: 2.0 },
    condition: { type: 'energy_total', value: 1000000 }
  }
];

export const useAchievements = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: baseAchievements,
      unlockedIds: [],
      totalMultiplier: 1.0,

      checkAchievements: (gameState) => {
        const { achievements, unlockedIds } = get();
        const newlyUnlocked: Achievement[] = [];

        achievements.forEach(achievement => {
          if (unlockedIds.includes(achievement.id)) return;

          let conditionMet = false;

          switch (achievement.condition.type) {
            case 'energy_total':
              conditionMet = gameState.energy >= achievement.condition.value;
              break;
            case 'upgrade_level':
              conditionMet = gameState.clickUpgradeLevel >= achievement.condition.value;
              break;
            case 'generator_level':
              conditionMet = gameState.generatorUpgradeLevel >= achievement.condition.value;
              break;
          }

          if (conditionMet) {
            newlyUnlocked.push(achievement);
            get().unlockAchievement(achievement.id);
          }
        });

        return newlyUnlocked;
      },

      unlockAchievement: (id) => {
        set(state => {
          if (state.unlockedIds.includes(id)) return state;

          const achievement = state.achievements.find(a => a.id === id);
          if (!achievement) return state;

          const newMultiplier = achievement.reward.type === 'multiplier'
            ? state.totalMultiplier * achievement.reward.value
            : state.totalMultiplier;

          return {
            unlockedIds: [...state.unlockedIds, id],
            achievements: state.achievements.map(a =>
              a.id === id ? { ...a, unlocked: true } : a
            ),
            totalMultiplier: newMultiplier
          };
        });
      },

      getActiveMultiplier: () => {
        return get().totalMultiplier;
      }
    }),
    {
      name: 'genesis-achievements'
    }
  )
);
