import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { saveGameData } from '../saveSystem';
import { getUpgradeClickCost, getUpgradeGeneratorCost, calculateEnergyPerSecond, calculateEnergyPerClick, getEnergyToBioMatterCost, getTerraformerCost, calculateBioMatterPerSecond } from '../gameLogic';
import { useAchievements } from './useAchievements';
import { useUnlocks } from './useUnlocks';
import { usePrestige } from './usePrestige';
import { useDiscoveryLogs } from './useDiscoveryLogs';
import { useAudio } from './useAudio';

// Lazy import function to avoid circular dependency
let _getMapProduction: (() => { energy: number; bioMatter: number }) | null = null;
export const setMapProductionGetter = (getter: () => { energy: number; bioMatter: number }) => {
  _getMapProduction = getter;
};
const getMapProduction = () => _getMapProduction?.() || { energy: 0, bioMatter: 0 };

interface GameState {
  // Core game state
  energy: number;
  energyPerClick: number;
  energyPerSecond: number;
  clickUpgradeLevel: number;
  generatorUpgradeLevel: number;
  gameStarted: boolean;
  isGenerating: boolean;

  // Update 2 - BioMatter system
  bioMatter: number;
  bioMatterPerSecond: number;
  terraformerCount: number;

  // Actions
  initializeGame: (savedData?: any) => void;
  generateEnergy: () => void;
  addEnergy: (amount: number) => void;
  spendEnergy: (amount: number) => boolean;
  spendBioMatter: (amount: number) => boolean;
  upgradeClick: () => void;
  upgradeGenerator: () => void;
  setIsGenerating: (generating: boolean) => void;
  
  // BioMatter actions
  convertToBioMatter: (amount: number) => void;
  buyTerraformer: () => void;
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
      
      // BioMatter initial state
      bioMatter: 0,
      bioMatterPerSecond: 0,
      terraformerCount: 0,

      initializeGame: (savedData) => {
        if (savedData) {
          set({
            energy: savedData.energy || 0,
            clickUpgradeLevel: savedData.clickUpgradeLevel || 0,
            generatorUpgradeLevel: savedData.generatorUpgradeLevel || 0,
            energyPerClick: calculateEnergyPerClick(savedData.clickUpgradeLevel || 0),
            energyPerSecond: calculateEnergyPerSecond(savedData.generatorUpgradeLevel || 0),
            bioMatter: savedData.bioMatter || 0,
            terraformerCount: savedData.terraformerCount || 0,
            bioMatterPerSecond: calculateBioMatterPerSecond(savedData.terraformerCount || 0),
            gameStarted: true
          });
          
          // Initialize discovery logs from saved data
          useDiscoveryLogs.getState().initializeLogs(savedData.discoveredLogs);
        } else {
          set({
            energy: 0,
            energyPerClick: 1,
            energyPerSecond: 0,
            clickUpgradeLevel: 0,
            generatorUpgradeLevel: 0,
            bioMatter: 0,
            terraformerCount: 0,
            bioMatterPerSecond: 0,
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
            bioMatter: state.bioMatter,
            terraformerCount: state.terraformerCount,
            discoveredLogs: useDiscoveryLogs.getState().discoveredIds,
            timestamp: Date.now()
          });
        }, 5000); // Save every 5 seconds

        // Start auto-generation
        if (generationInterval) clearInterval(generationInterval);
        generationInterval = setInterval(() => {
          const state = get();
          
          // Get production from all sources
          const structureProduction = useUnlocks.getState().getTotalProduction();
          const mapProduction = getMapProduction();
          
          // Energy production
          const basePerSecond = state.energyPerSecond + structureProduction + mapProduction.energy;
          const productionPrestigeMultiplier = usePrestige.getState().productionMultiplier;
          const totalPerSecond = basePerSecond * productionPrestigeMultiplier;
          
          if (totalPerSecond > 0) {
            set({ energy: state.energy + totalPerSecond });
          }
          
          // BioMatter production from Terraformers and Map structures
          const totalBioMatterPerSecond = state.bioMatterPerSecond + mapProduction.bioMatter;
          if (totalBioMatterPerSecond > 0) {
            const newBioMatter = state.bioMatter + totalBioMatterPerSecond;
            set({ bioMatter: newBioMatter });
            
            // Check for discovery logs
            useDiscoveryLogs.getState().checkDiscoveries(newBioMatter);
            
            // Update audio ambience
            useAudio.getState().updateAmbience(newBioMatter);
          }
          
          // Check for phase unlocks
          useUnlocks.getState().checkPhaseUnlock(state.energy);
        }, 1000); // Generate every second
      },

      generateEnergy: () => {
        const { energyPerClick } = get();
        const achievementMultiplier = useAchievements.getState().getActiveMultiplier();
        const prestigeMultiplier = usePrestige.getState().energyMultiplier;
        const clickPrestigeMultiplier = usePrestige.getState().clickMultiplier;
        const totalMultiplier = achievementMultiplier * prestigeMultiplier * clickPrestigeMultiplier;
        
        set(state => ({
          energy: state.energy + (energyPerClick * totalMultiplier)
        }));
        
        // Check achievements
        useAchievements.getState().checkAchievements(get());
      },

      addEnergy: (amount) => {
        const prestigeMultiplier = usePrestige.getState().energyMultiplier;
        set(state => ({
          energy: state.energy + (amount * prestigeMultiplier)
        }));
        
        // Check achievements
        useAchievements.getState().checkAchievements(get());
      },

      spendEnergy: (amount) => {
        const state = get();
        if (state.energy >= amount && amount >= 0) {
          set({ energy: state.energy - amount });
          return true;
        }
        return false;
      },

      spendBioMatter: (amount) => {
        const state = get();
        if (state.bioMatter >= amount && amount >= 0) {
          set({ bioMatter: state.bioMatter - amount });
          return true;
        }
        return false;
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
          
          // Check achievements
          useAchievements.getState().checkAchievements(get());
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
          
          // Check achievements
          useAchievements.getState().checkAchievements(get());
        }
      },

      setIsGenerating: (generating) => {
        set({ isGenerating: generating });
      },

      convertToBioMatter: (amount) => {
        const state = get();
        const cost = getEnergyToBioMatterCost(amount);
        
        if (state.energy >= cost) {
          const newBioMatter = state.bioMatter + amount;
          set({
            energy: state.energy - cost,
            bioMatter: newBioMatter
          });
          
          // Check achievements
          useAchievements.getState().checkAchievements(get());
          
          // Check for discovery logs
          useDiscoveryLogs.getState().checkDiscoveries(newBioMatter);
          
          // Update audio ambience
          useAudio.getState().updateAmbience(newBioMatter);
        }
      },

      buyTerraformer: () => {
        const state = get();
        const cost = getTerraformerCost(state.terraformerCount);
        
        if (state.energy >= cost) {
          const newCount = state.terraformerCount + 1;
          set({
            energy: state.energy - cost,
            terraformerCount: newCount,
            bioMatterPerSecond: calculateBioMatterPerSecond(newCount)
          });
          
          // Check achievements
          useAchievements.getState().checkAchievements(get());
        }
      }
    };
  })
);
