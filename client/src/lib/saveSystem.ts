// Save/load system using localStorage

interface SaveData {
  energy: number;
  clickUpgradeLevel: number;
  generatorUpgradeLevel: number;
  timestamp: number;
  achievements?: string[];
  bioMatter?: number;
  terraformerCount?: number;
  discoveredLogs?: string[];
  minerals?: number;
  rareCrystals?: number;
  unlockedTiles?: number;
}

const SAVE_KEY = 'genesis_factory_save';

export const saveGameData = (data: SaveData): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save game data:', error);
  }
};

export const loadGameData = (): SaveData | null => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;

    return JSON.parse(savedData);
  } catch (error) {
    console.error('Failed to load game data:', error);
    return null;
  }
};

export const clearSaveData = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear save data:', error);
  }
};

// Calculate offline earnings when game is loaded
export const calculateOfflineProgress = (saveData: SaveData) => {
  const currentTime = Date.now();
  const offlineTime = Math.max(0, currentTime - saveData.timestamp);
  const offlineHours = offlineTime / (1000 * 60 * 60);
  
  // Only calculate offline earnings if they had a generator and were offline for more than 1 minute
  if (saveData.generatorUpgradeLevel > 0 && offlineHours > (1 / 60)) {
    const energyPerSecond = Math.floor(1 * Math.pow(1.8, saveData.generatorUpgradeLevel));
    const maxOfflineHours = 24; // Max 24 hours of offline earnings
    const actualOfflineHours = Math.min(offlineHours, maxOfflineHours);
    const offlineEarnings = Math.floor(energyPerSecond * actualOfflineHours * 3600);
    
    return {
      offlineEarnings,
      offlineHours: actualOfflineHours
    };
  }
  
  return null;
};

// Export/import save data for sharing or backup
export const exportSaveData = (): string => {
  const saveData = loadGameData();
  if (!saveData) return '';
  
  return btoa(JSON.stringify(saveData));
};

export const importSaveData = (encodedData: string): boolean => {
  try {
    const decodedData = JSON.parse(atob(encodedData));
    
    // Validate save data structure
    if (typeof decodedData.energy === 'number' &&
        typeof decodedData.clickUpgradeLevel === 'number' &&
        typeof decodedData.generatorUpgradeLevel === 'number') {
      
      saveGameData({
        ...decodedData,
        timestamp: Date.now()
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to import save data:', error);
    return false;
  }
};
