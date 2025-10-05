// Game balance and logic calculations

export const calculateEnergyPerClick = (level: number): number => {
  if (level === 0) return 1;
  return Math.floor(1 * Math.pow(1.5, level));
};

export const calculateEnergyPerSecond = (level: number): number => {
  if (level === 0) return 0;
  return Math.floor(1 * Math.pow(1.8, level));
};

export const getUpgradeClickCost = (currentLevel: number): number => {
  return Math.floor(15 * Math.pow(2, currentLevel));
};

export const getUpgradeGeneratorCost = (currentLevel: number): number => {
  return Math.floor(100 * Math.pow(3, currentLevel));
};

// Offline earnings calculation
export const calculateOfflineEarnings = (
  energyPerSecond: number,
  offlineTimeSeconds: number,
  maxOfflineHours: number = 24
): number => {
  const maxOfflineSeconds = maxOfflineHours * 3600;
  const actualOfflineTime = Math.min(offlineTimeSeconds, maxOfflineSeconds);
  
  return Math.floor(energyPerSecond * actualOfflineTime);
};

// Prestige/rebirth system (for future expansion)
export const calculatePrestigeRequirement = (currentEnergy: number): number => {
  return 1000000; // 1 million energy for first prestige
};

// BioMatter system (Update 2 - Breath of Life)
export const getEnergyToBioMatterCost = (amount: number = 1): number => {
  return Math.floor(50 * amount); // 50 energy per BioMatter
};

export const getTerraformerCost = (currentCount: number): number => {
  return Math.floor(500 * Math.pow(1.5, currentCount));
};

export const calculateBioMatterPerSecond = (terraformerCount: number): number => {
  if (terraformerCount === 0) return 0;
  return Math.floor(1 * Math.pow(1.2, terraformerCount - 1));
};

// Achievement system helpers (for future expansion)
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (gameState: any) => boolean;
  reward: {
    type: 'multiplier' | 'bonus_energy' | 'unlock';
    value: number;
  };
}

export const baseAchievements: Achievement[] = [
  {
    id: 'first_click',
    name: 'Genesis Awakening',
    description: 'Generate your first Genesis Energy',
    requirement: (state) => state.energy >= 1,
    reward: { type: 'bonus_energy', value: 10 }
  },
  {
    id: 'hundred_energy',
    name: 'Power Surge',
    description: 'Accumulate 100 Genesis Energy',
    requirement: (state) => state.energy >= 100,
    reward: { type: 'multiplier', value: 1.1 }
  },
  {
    id: 'first_upgrade',
    name: 'Enhanced Systems',
    description: 'Purchase your first upgrade',
    requirement: (state) => state.clickUpgradeLevel >= 1 || state.generatorUpgradeLevel >= 1,
    reward: { type: 'bonus_energy', value: 50 }
  },
  {
    id: 'automation',
    name: 'Self-Sustaining',
    description: 'Activate the auto-generator',
    requirement: (state) => state.generatorUpgradeLevel >= 1,
    reward: { type: 'multiplier', value: 1.2 }
  }
];
