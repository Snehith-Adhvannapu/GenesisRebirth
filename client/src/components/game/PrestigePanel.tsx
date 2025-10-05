import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { usePrestige } from '../../lib/stores/usePrestige';
import { useGameState } from '../../lib/stores/useGameState';
import { useUnlocks } from '../../lib/stores/useUnlocks';
import { useAchievements } from '../../lib/stores/useAchievements';
import { useStory } from '../../lib/stores/useStory';
import { Sparkles, X, AlertTriangle } from 'lucide-react';

export const PrestigePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { energy, initializeGame } = useGameState();
  const { 
    prestigeLevel, 
    prestigePoints, 
    totalRebirths,
    energyMultiplier, 
    clickMultiplier, 
    productionMultiplier,
    calculatePrestigeGain,
    canPrestige,
    performPrestige,
    buyPrestigeUpgrade,
    getUpgradeCost
  } = usePrestige();

  const prestigeGain = calculatePrestigeGain(energy);
  const canDoPrestige = canPrestige(energy);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  const handlePrestige = () => {
    if (!canDoPrestige) return;

    performPrestige(energy);
    
    // Reset game state but keep prestige bonuses
    useGameState.setState({
      energy: 0,
      energyPerClick: 1,
      energyPerSecond: 0,
      clickUpgradeLevel: 0,
      generatorUpgradeLevel: 0,
      isGenerating: false
    });

    // Reset unlocks
    useUnlocks.getState().structures.forEach(s => {
      useUnlocks.setState(state => ({
        structures: state.structures.map(str => 
          str.id === s.id ? { ...s, owned: 0 } : str
        )
      }));
    });

    // Reset civilization phase
    useUnlocks.setState({ civilizationPhase: 'void' });

    setShowConfirm(false);
    setIsOpen(false);
  };

  const handleBuyUpgrade = (type: 'energy' | 'click' | 'production') => {
    const cost = getUpgradeCost(type);
    buyPrestigeUpgrade(type, cost);
  };

  return (
    <>
      {/* Prestige Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className={`text-white hover:text-purple-400 relative h-8 w-8 md:h-10 md:w-10 p-0 ${
          canDoPrestige ? 'animate-pulse' : ''
        }`}
      >
        <Sparkles size={16} className="md:w-5 md:h-5" />
        {prestigeLevel > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
            {prestigeLevel}
          </span>
        )}
      </Button>

      {/* Prestige Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <Card className="bg-black/90 border-purple-500/30 text-white p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-purple-400 flex items-center">
                  <Sparkles className="mr-2" size={28} />
                  Rebirth System
                </h2>
                <p className="text-sm text-gray-400">
                  Prestige Level: {prestigeLevel} | Points: {prestigePoints} | Total Rebirths: {totalRebirths}
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

            <ScrollArea className="flex-1 pr-4">
              {/* Prestige Info */}
              <Card className={`p-4 mb-4 ${
                canDoPrestige 
                  ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50'
                  : 'bg-gray-900/30 border-gray-700/30'
              }`}>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Perform Rebirth</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Reset your progress to gain permanent bonuses
                  </p>
                  {canDoPrestige ? (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-purple-400">
                        +{prestigeGain} Prestige Points
                      </div>
                      <Button
                        onClick={() => setShowConfirm(true)}
                        className="mt-3 bg-purple-600 hover:bg-purple-700"
                      >
                        Rebirth Now
                      </Button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Requires {formatNumber(1000000)} total energy
                      <br />
                      Current: {formatNumber(energy)}
                    </div>
                  )}
                </div>
              </Card>

              {/* Permanent Upgrades */}
              <h3 className="text-lg font-bold mb-3 text-purple-400">Permanent Upgrades</h3>
              
              <div className="space-y-3">
                <Card className="p-4 bg-gray-900/50 border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Energy Gain Multiplier</div>
                      <div className="text-sm text-gray-400">
                        Current: {energyMultiplier.toFixed(1)}x
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBuyUpgrade('energy')}
                      disabled={prestigePoints < getUpgradeCost('energy')}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      +0.1x ({getUpgradeCost('energy')} PP)
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-900/50 border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Click Power Multiplier</div>
                      <div className="text-sm text-gray-400">
                        Current: {clickMultiplier.toFixed(1)}x
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBuyUpgrade('click')}
                      disabled={prestigePoints < getUpgradeCost('click')}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      +0.1x ({getUpgradeCost('click')} PP)
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-900/50 border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Production Multiplier</div>
                      <div className="text-sm text-gray-400">
                        Current: {productionMultiplier.toFixed(1)}x
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBuyUpgrade('production')}
                      disabled={prestigePoints < getUpgradeCost('production')}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      +0.1x ({getUpgradeCost('production')} PP)
                    </Button>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
          <Card className="bg-black/90 border-red-500/50 text-white p-6 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
              <h3 className="text-xl font-bold mb-3">Confirm Rebirth</h3>
              <p className="text-gray-300 mb-4">
                This will reset ALL your progress (energy, upgrades, structures) but you'll gain <span className="text-purple-400 font-bold">{prestigeGain} Prestige Points</span> for permanent bonuses.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePrestige}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Confirm Rebirth
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
