import React from 'react';
import { useMap, StructureType } from '../../lib/stores/useMap';
import { useGameState } from '../../lib/stores/useGameState';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatNumber } from '../../lib/utils';

export const BuildingPanel: React.FC = () => {
  const { structures, selectedStructure, setSelectedStructure, canAffordStructure } = useMap();
  const { energy, bioMatter } = useGameState();

  const structureList: StructureType[] = ['terraformer', 'biofactory', 'extractor', 'research'];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10">
      <Card className="bg-black/90 border-cyan-500/30 p-4">
        <h2 className="text-xl font-bold text-cyan-400 mb-3">Build Structures</h2>

        <div className="space-y-2">
          {structureList.map((structureType) => {
            const structure = structures[structureType];
            const isSelected = selectedStructure === structureType;
            const canAfford = canAffordStructure(structureType, energy, bioMatter);

            return (
              <Button
                key={structureType}
                onClick={() => setSelectedStructure(isSelected ? null : structureType)}
                className={`w-full text-left p-3 h-auto transition-all ${
                  isSelected
                    ? 'bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300'
                    : canAfford
                    ? 'bg-gray-800 hover:bg-gray-700 border border-cyan-700'
                    : 'bg-gray-900/50 hover:bg-gray-900 border border-gray-700 opacity-50 cursor-not-allowed'
                }`}
                disabled={!canAfford}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">
                      {structure.name}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <span className={energy >= structure.energyCost ? 'text-cyan-400' : 'text-red-400'}>
                        ⚡ {formatNumber(structure.energyCost)}
                      </span>
                      <span className={bioMatter >= structure.bioMatterCost ? 'text-green-400' : 'text-red-400'}>
                        🧬 {formatNumber(structure.bioMatterCost)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{structure.description}</p>
                  <p className="text-xs text-yellow-400 font-semibold">{structure.effect}</p>
                </div>
              </Button>
            );
          })}
        </div>

        {selectedStructure && (
          <div className="mt-3 p-2 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-cyan-200">
            <p className="font-semibold">📍 Placement Mode Active</p>
            <p className="mt-1">Tap a tile on the map to place {structures[selectedStructure].name}</p>
            <Button
              onClick={() => setSelectedStructure(null)}
              className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white text-xs py-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};