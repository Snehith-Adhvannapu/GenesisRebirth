import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { setMapProductionGetter } from './useGameState';

export type TileType = 'barren' | 'water' | 'mountain' | 'crater' | 'green' | 'forest';
export type StructureType = 'terraformer' | 'biofactory' | 'extractor' | 'research';

export interface Tile {
  q: number; // Hex coordinate Q
  r: number; // Hex coordinate R
  type: TileType;
  structure: StructureType | null;
  isUnlocked: boolean;
  isDiscovered: boolean;
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
  getTotalProduction: () => { energy: number; bioMatter: number };
  canAffordStructure: (structure: StructureType, energy: number, bioMatter: number) => boolean;
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
      
      // Create initial 7x7 hex grid
      const radius = 3;
      for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
          const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
          
          // Determine tile type based on position
          let type: TileType = 'barren';
          const random = Math.abs(q * 7 + r * 13) % 100; // Deterministic "random"
          
          if (distance > 2) {
            if (random < 15) type = 'water';
            else if (random < 30) type = 'mountain';
            else if (random < 40) type = 'crater';
          }
          
          tiles.set(tileKey(q, r), {
            q,
            r,
            type,
            structure: null,
            isUnlocked: distance <= 1, // Center tiles unlocked
            isDiscovered: distance <= 1
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
      
      // Place the structure
      const newTiles = new Map(tiles);
      newTiles.set(tileKey(q, r), {
        ...tile,
        structure: structureType
      });
      
      set({ tiles: newTiles, selectedStructure: null });
      return true;
    },

    unlockTiles: (bioMatter) => {
      const { tiles } = get();
      const newTiles = new Map(tiles);
      let unlocked = false;
      
      // Unlock tiles based on bioMatter milestones
      let unlockRadius = 1;
      if (bioMatter >= 100) unlockRadius = 2;
      if (bioMatter >= 500) unlockRadius = 3;
      if (bioMatter >= 2000) unlockRadius = 4;
      
      newTiles.forEach((tile, key) => {
        const distance = Math.abs(tile.q) + Math.abs(tile.r) + Math.abs(-tile.q - tile.r);
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

    getTotalProduction: () => {
      const { tiles, structures } = get();
      let energy = 0;
      let bioMatter = 0;
      
      tiles.forEach(tile => {
        if (tile.structure) {
          const structure = structures[tile.structure];
          if (structure) {
            energy += structure.productionPerSecond.energy || 0;
            bioMatter += structure.productionPerSecond.bioMatter || 0;
          }
        }
      });
      
      return { energy, bioMatter };
    },

    canAffordStructure: (structureType, energy, bioMatter) => {
      const { structures } = get();
      const structure = structures[structureType];
      if (!structure) return false;
      
      return energy >= structure.energyCost && bioMatter >= structure.bioMatterCost;
    }
    };
  })
);
