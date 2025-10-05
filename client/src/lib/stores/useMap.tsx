import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { setMapProductionGetter } from './useGameState';

export type TileType = 'barren' | 'water' | 'mountain' | 'crater' | 'green' | 'forest' | 'volcano' | 'crystalFields' | 'desertPlains';
export type StructureType = 'terraformer' | 'biofactory' | 'extractor' | 'research';

export interface Tile {
  q: number; // Hex coordinate Q
  r: number; // Hex coordinate R
  type: TileType;
  structure: StructureType | null;
  isUnlocked: boolean;
  isDiscovered: boolean;
  bonusMultiplier?: number; // Adjacency bonus multiplier
}

export interface Structure {
  id: StructureType;
  name: string;
  description: string;
  energyCost: number;
  bioMatterCost: number;
  effect: string;
  placementRules: (tile: Tile, tiles: Map<string, Tile>) => boolean;
  productionPerSecond: { energy?: number; bioMatter?: number };
}

interface MapState {
  tiles: Map<string, Tile>;
  selectedStructure: StructureType | null;
  selectedTile: string | null;
  structures: Record<StructureType, Structure>;
  
  // Actions
  initializeMap: () => void;
  getTile: (q: number, r: number) => Tile | undefined;
  setSelectedStructure: (structure: StructureType | null) => void;
  setSelectedTile: (tileKey: string | null) => void;
  placeStructure: (q: number, r: number, structure: StructureType) => boolean;
  unlockTiles: (bioMatter: number) => void;
  evolveTile: (q: number, r: number, newType: TileType) => void;
  getAdjacentTiles: (q: number, r: number) => Tile[];
  calculateAdjacencyBonus: (tile: Tile, structure: StructureType) => number;
  getTotalProduction: () => { energy: number; bioMatter: number; minerals: number; rareCrystals: number };
  canAffordStructure: (structure: StructureType, energy: number, bioMatter: number) => boolean;
  getExpansionCost: () => { energy: number; bioMatter: number; minerals: number };
  expandTerritory: () => boolean;
  getUnlockedTilesCount: () => number;
  canExpandTerritory: () => boolean;
}

// Hex coordinate helpers
const tileKey = (q: number, r: number) => `${q},${r}`;

const hexDirections = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

export const useMap = create<MapState>()(
  subscribeWithSelector((set, get) => {
    // Register map production getter with game state
    setMapProductionGetter(() => get().getTotalProduction());
    
    return {
      tiles: new Map(),
      selectedStructure: null,
      selectedTile: null,
    
    structures: {
      terraformer: {
        id: 'terraformer',
        name: 'Terraformer',
        description: 'Generates BioMatter. Must be placed on barren tiles.',
        energyCost: 50,
        bioMatterCost: 10,
        effect: '+1 BioMatter/sec',
        placementRules: (tile, tiles) => {
          return tile.type === 'barren' && tile.structure === null;
        },
        productionPerSecond: { bioMatter: 1 }
      },
      biofactory: {
        id: 'biofactory',
        name: 'Bio Factory',
        description: 'Converts BioMatter to advanced lifeforms. Must be near water tiles.',
        energyCost: 200,
        bioMatterCost: 50,
        effect: '+5 BioMatter/sec',
        placementRules: (tile, tiles) => {
          if (tile.structure !== null) return false;
          const adjacent = get().getAdjacentTiles(tile.q, tile.r);
          return adjacent.some(t => t.type === 'water');
        },
        productionPerSecond: { bioMatter: 5 }
      },
      extractor: {
        id: 'extractor',
        name: 'Energy Extractor',
        description: 'Generates Energy. Must be placed on mountains or craters.',
        energyCost: 100,
        bioMatterCost: 25,
        effect: '+10 Energy/sec',
        placementRules: (tile, tiles) => {
          return (tile.type === 'mountain' || tile.type === 'crater') && tile.structure === null;
        },
        productionPerSecond: { energy: 10 }
      },
      research: {
        id: 'research',
        name: 'Research Hub',
        description: 'Unlocks upgrades. Cost increases with distance from core.',
        energyCost: 500,
        bioMatterCost: 100,
        effect: '+2 Energy/sec, +2 BioMatter/sec',
        placementRules: (tile, tiles) => {
          return tile.structure === null;
        },
        productionPerSecond: { energy: 2, bioMatter: 2 }
      }
    } as Record<StructureType, Structure>,

    initializeMap: () => {
      // Guard: only initialize if map is empty
      if (get().tiles.size > 0) {
        return;
      }
      
      const tiles = new Map<string, Tile>();
      const gridSize = 20; // 20x20 square grid (expanded from 10x10)
      
      // Create square grid
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Calculate distance from center for unlock logic
          const centerX = Math.floor(gridSize / 2);
          const centerY = Math.floor(gridSize / 2);
          const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
          
          // Determine tile type based on position
          let type: TileType = 'barren';
          const random = Math.abs(x * 7 + y * 13) % 100; // Deterministic "random"
          
          if (distance > 2) {
            if (random < 12) type = 'water';
            else if (random < 22) type = 'mountain';
            else if (random < 32) type = 'crater';
            else if (random < 37) type = 'volcano'; // High energy/resource yield
            else if (random < 42) type = 'crystalFields'; // Rare resource bonus
            else if (random < 52) type = 'desertPlains'; // Low yield but strategic
            else if (random < 60) type = 'green';
            else if (random < 68) type = 'forest';
          }
          
          tiles.set(tileKey(x, y), {
            q: x,
            r: y,
            type,
            structure: null,
            isUnlocked: distance <= 2, // Center 5x5 area unlocked initially
            isDiscovered: distance <= 2
          });
        }
      }
      
      set({ tiles });
    },

    getTile: (q, r) => {
      return get().tiles.get(tileKey(q, r));
    },

    setSelectedStructure: (structure) => {
      set({ selectedStructure: structure });
    },

    setSelectedTile: (tileKey) => {
      set({ selectedTile: tileKey });
    },

    placeStructure: (q, r, structureType) => {
      const { tiles, structures } = get();
      const tile = tiles.get(tileKey(q, r));
      
      if (!tile || !tile.isUnlocked || tile.structure !== null) {
        return false;
      }
      
      const structure = structures[structureType];
      if (!structure) return false;
      
      // Check placement rules
      if (!structure.placementRules(tile, tiles)) {
        return false;
      }

      // Calculate adjacency bonus for this placement
      const bonusMultiplier = get().calculateAdjacencyBonus(tile, structureType);
      
      // Place the structure with bonus
      const newTiles = new Map(tiles);
      newTiles.set(tileKey(q, r), {
        ...tile,
        structure: structureType,
        bonusMultiplier
      });
      
      set({ tiles: newTiles, selectedStructure: null });
      return true;
    },

    unlockTiles: (bioMatter) => {
      const { tiles } = get();
      const newTiles = new Map(tiles);
      let unlocked = false;
      
      const gridSize = 10;
      const centerX = Math.floor(gridSize / 2);
      const centerY = Math.floor(gridSize / 2);
      
      // Unlock tiles based on bioMatter milestones
      let unlockRadius = 2;
      if (bioMatter >= 100) unlockRadius = 3;
      if (bioMatter >= 500) unlockRadius = 4;
      if (bioMatter >= 1000) unlockRadius = 5;
      if (bioMatter >= 2000) unlockRadius = 6;
      if (bioMatter >= 5000) unlockRadius = 10; // Unlock entire map
      
      newTiles.forEach((tile, key) => {
        const distance = Math.abs(tile.q - centerX) + Math.abs(tile.r - centerY);
        if (distance <= unlockRadius && !tile.isUnlocked) {
          newTiles.set(key, { ...tile, isUnlocked: true, isDiscovered: true });
          unlocked = true;
        }
      });
      
      if (unlocked) {
        set({ tiles: newTiles });
      }
    },

    evolveTile: (q, r, newType) => {
      const { tiles } = get();
      const tile = tiles.get(tileKey(q, r));
      if (!tile) return;
      
      const newTiles = new Map(tiles);
      newTiles.set(tileKey(q, r), { ...tile, type: newType });
      set({ tiles: newTiles });
    },

    getAdjacentTiles: (q, r) => {
      const { tiles } = get();
      const adjacent: Tile[] = [];
      
      for (const dir of hexDirections) {
        const neighbor = tiles.get(tileKey(q + dir.q, r + dir.r));
        if (neighbor) {
          adjacent.push(neighbor);
        }
      }
      
      return adjacent;
    },

    calculateAdjacencyBonus: (tile, structureType) => {
      const adjacentTiles = get().getAdjacentTiles(tile.q, tile.r);
      let bonusMultiplier = 1.0;

      // Extractor bonuses
      if (structureType === 'extractor') {
        // Bonus near volcano (high energy yield)
        const hasVolcanoNearby = adjacentTiles.some(t => t.type === 'volcano');
        if (hasVolcanoNearby) bonusMultiplier += 0.5;

        // Bonus on desert plains (strategic location)
        if (tile.type === 'desertPlains') bonusMultiplier += 0.2;
      }

      // Biofactory bonuses
      if (structureType === 'biofactory') {
        // Bonus near forests and water
        const hasForestNearby = adjacentTiles.some(t => t.type === 'forest');
        const hasWaterNearby = adjacentTiles.some(t => t.type === 'water');
        if (hasForestNearby && hasWaterNearby) bonusMultiplier += 0.6;
        else if (hasWaterNearby) bonusMultiplier += 0.3;
      }

      // Research hub bonuses
      if (structureType === 'research') {
        // Bonus near crystal fields (rare resource areas)
        const hasCrystalFieldsNearby = adjacentTiles.some(t => t.type === 'crystalFields');
        if (hasCrystalFieldsNearby) bonusMultiplier += 0.4;
      }

      // Terraformer bonuses
      if (structureType === 'terraformer') {
        // Bonus on green tiles
        if (tile.type === 'green') bonusMultiplier += 0.3;
      }

      return bonusMultiplier;
    },

    getTotalProduction: () => {
      const { tiles, structures } = get();
      let energy = 0;
      let bioMatter = 0;
      let minerals = 0;
      let rareCrystals = 0;
      
      tiles.forEach(tile => {
        if (tile.structure) {
          const structure = structures[tile.structure];
          if (structure) {
            const bonus = tile.bonusMultiplier || 1.0;
            energy += (structure.productionPerSecond.energy || 0) * bonus;
            bioMatter += (structure.productionPerSecond.bioMatter || 0) * bonus;

            // Special terrain production bonuses
            // Volcanoes produce minerals when extractors are placed
            if (tile.structure === 'extractor' && tile.type === 'volcano') {
              minerals += 2 * bonus;
            }
            // Crystal fields produce rare crystals when research hubs are placed
            if (tile.structure === 'research' && tile.type === 'crystalFields') {
              rareCrystals += 1 * bonus;
            }
            // Mountains produce minerals
            if (tile.structure === 'extractor' && tile.type === 'mountain') {
              minerals += 1 * bonus;
            }
          }
        }
      });
      
      return { energy, bioMatter, minerals, rareCrystals };
    },

    canAffordStructure: (structureType, energy, bioMatter) => {
      const { structures } = get();
      const structure = structures[structureType];
      if (!structure) return false;
      
      return energy >= structure.energyCost && bioMatter >= structure.bioMatterCost;
    },

    getUnlockedTilesCount: () => {
      const { tiles } = get();
      let count = 0;
      tiles.forEach(tile => {
        if (tile.isUnlocked) count++;
      });
      return count;
    },

    getExpansionCost: () => {
      const unlockedCount = get().getUnlockedTilesCount();
      // Cost increases with each expansion
      const expansionLevel = Math.floor(unlockedCount / 25); // 25 tiles per level
      
      return {
        energy: Math.floor(500 * Math.pow(1.5, expansionLevel)),
        bioMatter: Math.floor(100 * Math.pow(1.3, expansionLevel)),
        minerals: Math.floor(50 * Math.pow(1.4, expansionLevel))
      };
    },

    canExpandTerritory: () => {
      const { tiles } = get();
      const gridSize = 20;
      const centerX = Math.floor(gridSize / 2);
      const centerY = Math.floor(gridSize / 2);
      
      // Find the current unlock radius
      let currentMaxDistance = 0;
      tiles.forEach(tile => {
        if (tile.isUnlocked) {
          const distance = Math.abs(tile.q - centerX) + Math.abs(tile.r - centerY);
          currentMaxDistance = Math.max(currentMaxDistance, distance);
        }
      });
      
      // Check if there are any locked tiles in the next ring
      const newUnlockRadius = currentMaxDistance + 1;
      let hasLockedTilesInNextRing = false;
      
      tiles.forEach(tile => {
        const distance = Math.abs(tile.q - centerX) + Math.abs(tile.r - centerY);
        if (distance === newUnlockRadius && !tile.isUnlocked) {
          hasLockedTilesInNextRing = true;
        }
      });
      
      return hasLockedTilesInNextRing;
    },

    expandTerritory: () => {
      const { tiles } = get();
      
      // Check if expansion is possible
      if (!get().canExpandTerritory()) {
        return false;
      }
      
      const newTiles = new Map(tiles);
      let unlocked = false;
      
      const gridSize = 20;
      const centerX = Math.floor(gridSize / 2);
      const centerY = Math.floor(gridSize / 2);
      
      // Find the current unlock radius
      let currentMaxDistance = 0;
      tiles.forEach(tile => {
        if (tile.isUnlocked) {
          const distance = Math.abs(tile.q - centerX) + Math.abs(tile.r - centerY);
          currentMaxDistance = Math.max(currentMaxDistance, distance);
        }
      });
      
      // Unlock the next ring of tiles
      const newUnlockRadius = currentMaxDistance + 1;
      
      newTiles.forEach((tile, key) => {
        const distance = Math.abs(tile.q - centerX) + Math.abs(tile.r - centerY);
        if (distance === newUnlockRadius && !tile.isUnlocked) {
          newTiles.set(key, { ...tile, isUnlocked: true, isDiscovered: true });
          unlocked = true;
        }
      });
      
      if (unlocked) {
        set({ tiles: newTiles });
        return true;
      }
      
      return false;
    }
    };
  })
);
