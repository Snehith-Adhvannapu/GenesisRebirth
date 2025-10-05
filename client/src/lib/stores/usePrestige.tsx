import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrestigeState {
  prestigeLevel: number;
  prestigePoints: number;
  totalRebirths: number;
  
  // Permanent upgrades
  energyMultiplier: number;
  clickMultiplier: number;
  productionMultiplier: number;
  
  calculatePrestigeGain: (currentEnergy: number) => number;
  canPrestige: (currentEnergy: number) => boolean;
  performPrestige: (currentEnergy: number) => void;
  buyPrestigeUpgrade: (type: 'energy' | 'click' | 'production', cost: number) => boolean;
  getUpgradeCost: (type: 'energy' | 'click' | 'production') => number;
}

const PRESTIGE_THRESHOLD = 1000000; // 1 million energy needed for first prestige

export const usePrestige = create<PrestigeState>()(
  persist(
    (set, get) => ({
      prestigeLevel: 0,
      prestigePoints: 0,
      totalRebirths: 0,
      energyMultiplier: 1,
      clickMultiplier: 1,
      productionMultiplier: 1,

      calculatePrestigeGain: (currentEnergy) => {
        if (currentEnergy < PRESTIGE_THRESHOLD) return 0;
        // Formula: sqrt(energy / threshold) rounded down
        return Math.floor(Math.sqrt(currentEnergy / PRESTIGE_THRESHOLD));
      },

      canPrestige: (currentEnergy) => {
        return get().calculatePrestigeGain(currentEnergy) > 0;
      },

      performPrestige: (currentEnergy) => {
        const gain = get().calculatePrestigeGain(currentEnergy);
        if (gain > 0) {
          set(state => ({
            prestigePoints: state.prestigePoints + gain,
            prestigeLevel: state.prestigeLevel + 1,
            totalRebirths: state.totalRebirths + 1
          }));
        }
      },

      getUpgradeCost: (type) => {
        const state = get();
        const level = type === 'energy' ? state.energyMultiplier - 1 :
                      type === 'click' ? state.clickMultiplier - 1 :
                      state.productionMultiplier - 1;
        return Math.floor(1 + level * 2);
      },

      buyPrestigeUpgrade: (type, cost) => {
        const state = get();
        if (state.prestigePoints < cost) return false;

        set(prevState => {
          const updates: any = {
            prestigePoints: prevState.prestigePoints - cost
          };

          if (type === 'energy') {
            updates.energyMultiplier = prevState.energyMultiplier + 0.1;
          } else if (type === 'click') {
            updates.clickMultiplier = prevState.clickMultiplier + 0.1;
          } else if (type === 'production') {
            updates.productionMultiplier = prevState.productionMultiplier + 0.1;
          }

          return updates;
        });

        return true;
      }
    }),
    {
      name: 'genesis-prestige'
    }
  )
);
