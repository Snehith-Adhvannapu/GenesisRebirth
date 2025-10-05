import React, { useState } from 'react';
import { useMap, StructureType } from '../../lib/stores/useMap';
import { useGameState } from '../../lib/stores/useGameState';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatNumber } from '../../lib/utils';
import { Building2, ChevronUp, ChevronDown } from 'lucide-react';

export const BuildingPanel: React.FC = () => {
  const { structures, selectedStructure, setSelectedStructure, canAffordStructure } = useMap();
  const { energy, bioMatter } = useGameState();
  const [isExpanded, setIsExpanded] = useState(true);

  const structureList: StructureType[] = ['terraformer', 'biofactory', 'extractor', 'research'];

  return (
    <div className="fixed bottom-4 left-2 right-2 md:left-auto md:right-4 md:w-96 z-10">
      <Card className="bg-black/95 border-cyan-500/30 p-2 md:p-3">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base md:text-lg font-bold text-cyan-400 flex items-center gap-1">
            <Building2 size={18} />
            <span>Build Structures</span>
          </h2>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300 h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-1.5 md:space-y-2">
          {structureList.map((structureType) => {
            const structure = structures[structureType];
            const isSelected = selectedStructure === structureType;
            const canAfford = canAffordStructure(structureType, energy, bioMatter);

            return (
              <Button
                key={structureType}
                onClick={() => setSelectedStructure(isSelected ? null : structureType)}
                className={`w-full text-left p-2 md:p-3 h-auto transition-all ${
                  isSelected
                    ? 'bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300'
                    : canAfford
                    ? 'bg-gray-800 hover:bg-gray-700 border border-cyan-700'
                    : 'bg-gray-900/50 hover:bg-gray-900 border border-gray-700 opacity-50 cursor-not-allowed'
                }`}
                disabled={!canAfford}
              >
                <div className="flex flex-col gap-0.5 md:gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-xs md:text-sm">
                      {structure.name}
                    </span>
                    <div className="flex gap-1.5 text-[10px] md:text-xs">
                      <span className={energy >= structure.energyCost ? 'text-cyan-400' : 'text-red-400'}>
                        ⚡ {formatNumber(structure.energyCost)}
                      </span>
                      <span className={bioMatter >= structure.bioMatterCost ? 'text-green-400' : 'text-red-400'}>
                        🧬 {formatNumber(structure.bioMatterCost)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400 line-clamp-1">{structure.description}</p>
                  <p className="text-[10px] md:text-xs text-yellow-400 font-semibold line-clamp-1">{structure.effect}</p>
                </div>
              </Button>
            );
          })}
          </div>
        )}

        {selectedStructure && (
          <div className="mt-2 p-2 bg-cyan-900/30 border border-cyan-500/50 rounded text-[10px] md:text-xs text-cyan-200">
            <p className="font-semibold">📍 Placement Mode</p>
            <p className="mt-0.5">Tap a tile to place {structures[selectedStructure].name}</p>
            <Button
              onClick={() => setSelectedStructure(null)}
              className="mt-1.5 w-full bg-red-600 hover:bg-red-500 text-white text-[10px] md:text-xs py-1 h-7"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};