import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Structure {
  id: string;
  name: string;
  description: string;
  unlockCost: number;
  baseCost: number;
  baseProduction: number;
  owned: number;
  icon: string;
  tier: number;
}

export interface CivilizationPhase {
  id: string;
  name: string;
  description: string;
  requiredEnergy: number;
  unlocked: boolean;
  icon: string;
}

interface UnlocksState {
  structures: Structure[];
  civilizationPhase: string;
  phases: CivilizationPhase[];
  
  unlockStructure: (id: string) => void;
  buyStructure: (id: string, currentEnergy: number) => { success: boolean; cost: number };
  getStructureCost: (structure: Structure) => number;
  getTotalProduction: () => number;
  checkPhaseUnlock: (totalEnergy: number) => CivilizationPhase | null;
}

const baseStructures: Structure[] = [
  {
    id: 'basic_generator',
    name: 'Basic Generator',
    description: 'A simple energy generator that produces 1 energy/sec',
    unlockCost: 0,
    baseCost: 50,
    baseProduction: 1,
    owned: 0,
    icon: '⚡',
    tier: 1
  },
  {
    id: 'solar_array',
    name: 'Solar Array',
    description: 'Harnesses solar energy for 5 energy/sec',
    unlockCost: 500,
    baseCost: 300,
    baseProduction: 5,
    owned: 0,
    icon: '☀️',
    tier: 2
  },
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: 'Advanced reactor producing 25 energy/sec',
    unlockCost: 5000,
    baseCost: 2000,
    baseProduction: 25,
    owned: 0,
    icon: '⚛️',
    tier: 3
  },
  {
    id: 'quantum_factory',
    name: 'Quantum Factory',
    description: 'Quantum energy factory generating 100 energy/sec',
    unlockCost: 50000,
    baseCost: 15000,
    baseProduction: 100,
    owned: 0,
    icon: '🏭',
    tier: 4
  },
  {
    id: 'genesis_core',
    name: 'Genesis Core',
    description: 'Ultimate energy source producing 500 energy/sec',
    unlockCost: 500000,
    baseCost: 100000,
    baseProduction: 500,
    owned: 0,
    icon: '💠',
    tier: 5
  }
];

const civilizationPhases: CivilizationPhase[] = [
  {
    id: 'void',
    name: 'The Void',
    description: 'Nothing exists yet. Only darkness.',
    requiredEnergy: 0,
    unlocked: true,
    icon: '🌑'
  },
  {
    id: 'awakening',
    name: 'Awakening',
    description: 'The first sparks of energy emerge from the void.',
    requiredEnergy: 100,
    unlocked: false,
    icon: '✨'
  },
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Basic structures begin to take form.',
    requiredEnergy: 1000,
    unlocked: false,
    icon: '🏗️'
  },
  {
    id: 'reconstruction',
    name: 'Reconstruction',
    description: 'The world starts to rebuild itself.',
    requiredEnergy: 10000,
    unlocked: false,
    icon: '🌆'
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Advanced civilization emerges from the ashes.',
    requiredEnergy: 100000,
    unlocked: false,
    icon: '🌃'
  },
  {
    id: 'ascension',
    name: 'Ascension',
    description: 'Transcendence beyond the old world.',
    requiredEnergy: 1000000,
    unlocked: false,
    icon: '🌌'
  }
];

export const useUnlocks = create<UnlocksState>()(
  persist(
    (set, get) => ({
      structures: baseStructures,
      civilizationPhase: 'void',
      phases: civilizationPhases,

      unlockStructure: (id) => {
        set(state => ({
          structures: state.structures.map(s =>
            s.id === id && s.unlockCost === 0 ? { ...s, unlockCost: -1 } : s
          )
        }));
      },

      buyStructure: (id, currentEnergy) => {
        const structure = get().structures.find(s => s.id === id);
        if (!structure) return { success: false, cost: 0 };

        const cost = get().getStructureCost(structure);
        if (currentEnergy < cost) return { success: false, cost };

        set(state => ({
          structures: state.structures.map(s =>
            s.id === id ? { ...s, owned: s.owned + 1 } : s
          )
        }));

        return { success: true, cost };
      },

      getStructureCost: (structure) => {
        return Math.floor(structure.baseCost * Math.pow(1.15, structure.owned));
      },

      getTotalProduction: () => {
        return get().structures.reduce(
          (total, s) => total + (s.baseProduction * s.owned),
          0
        );
      },

      checkPhaseUnlock: (totalEnergy) => {
        const { phases, civilizationPhase } = get();
        const currentPhaseIndex = phases.findIndex(p => p.id === civilizationPhase);
        
        for (let i = currentPhaseIndex + 1; i < phases.length; i++) {
          const phase = phases[i];
          if (totalEnergy >= phase.requiredEnergy && !phase.unlocked) {
            set(state => ({
              civilizationPhase: phase.id,
              phases: state.phases.map(p =>
                p.id === phase.id ? { ...p, unlocked: true } : p
              )
            }));
            return phase;
          }
        }
        
        return null;
      }
    }),
    {
      name: 'genesis-unlocks'
    }
  )
);
