import React from 'react';
import { useMap } from '../../lib/stores/useMap';
import { useGameState } from '../../lib/stores/useGameState';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export const TerritoryPanel: React.FC = () => {
  const { getUnlockedTilesCount, getExpansionCost, getTotalProduction, expandTerritory, canExpandTerritory } = useMap();
  const { 
    energy, 
    bioMatter, 
    minerals, 
    rareCrystals,
    mineralsPerSecond,
    rareCrystalsPerSecond,
    spendEnergy,
    spendBioMatter,
    spendMinerals
  } = useGameState();

  const unlockedTiles = getUnlockedTilesCount();
  const expansionCost = getExpansionCost();
  const production = getTotalProduction();
  const canExpand = canExpandTerritory();

  const canAffordExpansion = 
    canExpand &&
    energy >= expansionCost.energy &&
    bioMatter >= expansionCost.bioMatter &&
    minerals >= expansionCost.minerals;

  const handleExpansion = () => {
    if (canAffordExpansion) {
      // First check if expansion is possible
      const expansionSuccessful = expandTerritory();
      
      // Only deduct resources if expansion was successful
      if (expansionSuccessful) {
        spendEnergy(expansionCost.energy);
        spendBioMatter(expansionCost.bioMatter);
        spendMinerals(expansionCost.minerals);
      }
    }
  };

  return (
    <Card className="p-4 bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm">
      <h2 className="text-lg font-bold text-cyan-400 mb-3">Territory Management</h2>
      
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-cyan-300 font-semibold mb-1">Territory</div>
          <div className="text-slate-300">
            Total Tiles Owned: <span className="text-white font-bold">{unlockedTiles}</span>
          </div>
        </div>

        <Separator className="bg-cyan-500/20" />

        <div>
          <div className="text-cyan-300 font-semibold mb-1">Production Rates</div>
          <div className="space-y-1">
            <div className="text-slate-300">
              Energy: <span className="text-green-400 font-bold">+{production.energy.toFixed(1)}/s</span>
            </div>
            <div className="text-slate-300">
              BioMatter: <span className="text-emerald-400 font-bold">+{production.bioMatter.toFixed(1)}/s</span>
            </div>
            <div className="text-slate-300">
              Minerals: <span className="text-amber-400 font-bold">+{production.minerals.toFixed(1)}/s</span>
            </div>
            <div className="text-slate-300">
              Rare Crystals: <span className="text-purple-400 font-bold">+{production.rareCrystals.toFixed(1)}/s</span>
            </div>
          </div>
        </div>

        <Separator className="bg-cyan-500/20" />

        <div>
          <div className="text-cyan-300 font-semibold mb-1">Current Resources</div>
          <div className="space-y-1">
            <div className="text-slate-300">
              Energy: <span className="text-white font-bold">{energy.toFixed(0)}</span>
            </div>
            <div className="text-slate-300">
              BioMatter: <span className="text-white font-bold">{bioMatter.toFixed(0)}</span>
            </div>
            <div className="text-slate-300">
              Minerals: <span className="text-white font-bold">{minerals.toFixed(0)}</span>
            </div>
            <div className="text-slate-300">
              Rare Crystals: <span className="text-white font-bold">{rareCrystals.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-cyan-500/20" />

        <div>
          <div className="text-cyan-300 font-semibold mb-2">Expand Territory</div>
          <div className="space-y-1 mb-2 text-xs">
            <div className={energy >= expansionCost.energy ? 'text-green-400' : 'text-red-400'}>
              Energy: {expansionCost.energy}
            </div>
            <div className={bioMatter >= expansionCost.bioMatter ? 'text-green-400' : 'text-red-400'}>
              BioMatter: {expansionCost.bioMatter}
            </div>
            <div className={minerals >= expansionCost.minerals ? 'text-green-400' : 'text-red-400'}>
              Minerals: {expansionCost.minerals}
            </div>
          </div>
          <Button
            onClick={handleExpansion}
            disabled={!canAffordExpansion}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500"
          >
            {!canExpand ? 'Max Territory Reached' : canAffordExpansion ? 'Expand Territory' : 'Insufficient Resources'}
          </Button>
        </div>

        <div className="text-xs text-slate-400 italic mt-2">
          "Your world is growing. Every expansion brings new challenges, new resources, and new potential."
        </div>
      </div>
    </Card>
  );
};
