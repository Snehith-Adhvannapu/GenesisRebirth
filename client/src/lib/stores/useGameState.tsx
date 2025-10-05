import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { saveGameData } from '../saveSystem';
import { getUpgradeClickCost, getUpgradeGeneratorCost, calculateEnergyPerSecond, calculateEnergyPerClick } from '../gameLogic';

interface GameState {
  // Core game state
  energy: number;
  energyPerClick: number;
  energyPerSecond: number;
  clickUpgradeLevel: number;
  generatorUpgradeLevel: number;
  gameStarted: boolean;
  isGenerating: boolean;

  // Actions
  initializeGame: (savedData?: any) => void;
  generateEnergy: () => void;
  addEnergy: (amount: number) => void;
  upgradeClick: () => void;
  upgradeGenerator: () => void;
  setIsGenerating: (generating: boolean) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => {
    // Auto-save mechanism
    let saveInterval: NodeJS.Timeout;

    // Auto-generation mechanism
    let generationInterval: NodeJS.Timeout;

    return {
      // Initial state
      energy: 0,
      energyPerClick: 1,
      energyPerSecond: 0,
      clickUpgradeLevel: 0,
      generatorUpgradeLevel: 0,
      gameStarted: false,
      isGenerating: false,

      initializeGame: (savedData) => {
        if (savedData) {
          set({
            energy: savedData.energy || 0,
            clickUpgradeLevel: savedData.clickUpgradeLevel || 0,
            generatorUpgradeLevel: savedData.generatorUpgradeLevel || 0,
            energyPerClick: calculateEnergyPerClick(savedData.clickUpgradeLevel || 0),
            energyPerSecond: calculateEnergyPerSecond(savedData.generatorUpgradeLevel || 0),
            gameStarted: true
          });
        } else {
          set({
            energy: 0,
            energyPerClick: 1,
            energyPerSecond: 0,
            clickUpgradeLevel: 0,
            generatorUpgradeLevel: 0,
            gameStarted: true
          });
        }

        // Start auto-save
        if (saveInterval) clearInterval(saveInterval);
        saveInterval = setInterval(() => {
          const state = get();
          saveGameData({
            energy: state.energy,
            clickUpgradeLevel: state.clickUpgradeLevel,
            generatorUpgradeLevel: state.generatorUpgradeLevel,
            timestamp: Date.now()
          });
        }, 5000); // Save every 5 seconds

        // Start auto-generation
        if (generationInterval) clearInterval(generationInterval);
        generationInterval = setInterval(() => {
          const state = get();
          if (state.energyPerSecond > 0) {
            set({ energy: state.energy + state.energyPerSecond });
          }
        }, 1000); // Generate every second
      },

      generateEnergy: () => {
        const { energyPerClick } = get();
        set(state => ({
          energy: state.energy + energyPerClick
        }));
      },

      addEnergy: (amount) => {
        set(state => ({
          energy: state.energy + amount
        }));
      },

      upgradeClick: () => {
        const state = get();
        const cost = getUpgradeClickCost(state.clickUpgradeLevel);
        
        if (state.energy >= cost) {
          const newLevel = state.clickUpgradeLevel + 1;
          set({
            energy: state.energy - cost,
            clickUpgradeLevel: newLevel,
            energyPerClick: calculateEnergyPerClick(newLevel)
          });
        }
      },

      upgradeGenerator: () => {
        const state = get();
        const cost = getUpgradeGeneratorCost(state.generatorUpgradeLevel);
        
        if (state.energy >= cost) {
          const newLevel = state.generatorUpgradeLevel + 1;
          set({
            energy: state.energy - cost,
            generatorUpgradeLevel: newLevel,
            energyPerSecond: calculateEnergyPerSecond(newLevel)
          });
        }
      },

      setIsGenerating: (generating) => {
        set({ isGenerating: generating });
      }
    };
  })
);
