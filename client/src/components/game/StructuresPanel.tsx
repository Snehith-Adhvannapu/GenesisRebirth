import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useUnlocks, Structure } from '../../lib/stores/useUnlocks';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';
import { Building2, X, Lock } from 'lucide-react';

export const StructuresPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { structures, buyStructure, getStructureCost, getTotalProduction } = useUnlocks();
  const { energy } = useGameState();
  const { playSuccess } = useAudio();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  const handleBuy = (structure: Structure) => {
    const result = buyStructure(structure.id, energy);
    if (result.success) {
      useGameState.getState().addEnergy(-result.cost);
      playSuccess();
    }
  };

  const unlockedStructures = structures.filter(s => 
    s.unlockCost === 0 || s.unlockCost === -1 || energy >= s.unlockCost
  );

  const totalProduction = getTotalProduction();

  return (
    <>
      {/* Structures Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="text-white hover:text-green-400 relative"
      >
        <Building2 size={20} />
        {totalProduction > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-black text-xs rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center">
            {formatNumber(totalProduction)}
          </span>
        )}
      </Button>

      {/* Structures Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <Card className="bg-black/90 border-cyan-500/30 text-white p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-green-400 flex items-center">
                  <Building2 className="mr-2" size={28} />
                  Structures
                </h2>
                <p className="text-sm text-gray-400">
                  Build structures to automate energy production
                  {totalProduction > 0 && (
                    <span className="ml-2 text-green-400">
                      (+{formatNumber(totalProduction)}/sec from structures)
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Structures List */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {structures.map(structure => {
                  const cost = getStructureCost(structure);
                  const isUnlocked = structure.unlockCost === 0 || structure.unlockCost === -1 || energy >= structure.unlockCost;
                  const canAfford = energy >= cost;

                  return (
                    <Card
                      key={structure.id}
                      className={`p-4 ${
                        isUnlocked
                          ? 'bg-gray-900/50 border-green-500/30'
                          : 'bg-gray-900/30 border-gray-700/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{structure.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-white flex items-center">
                              {structure.name}
                              {!isUnlocked && <Lock className="ml-2 text-gray-500" size={16} />}
                            </div>
                            {structure.owned > 0 && (
                              <span className="text-sm text-cyan-400">
                                Owned: {structure.owned}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-300 mb-2">
                            {structure.description}
                          </div>
                          <div className="text-xs text-green-400 mb-2">
                            Production: {structure.baseProduction}/sec each
                            {structure.owned > 0 && (
                              <span className="ml-2">
                                (Total: {structure.baseProduction * structure.owned}/sec)
                              </span>
                            )}
                          </div>
                          {isUnlocked ? (
                            <Button
                              onClick={() => handleBuy(structure)}
                              disabled={!canAfford}
                              size="sm"
                              className={`${
                                canAfford
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            >
                              Buy - {formatNumber(cost)} Energy
                            </Button>
                          ) : (
                            <div className="text-xs text-gray-500">
                              🔒 Unlocks at {formatNumber(structure.unlockCost)} total energy
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </>
  );
};
