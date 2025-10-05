import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';
import { getUpgradeClickCost, getUpgradeGeneratorCost } from '../../lib/gameLogic';
import { Zap, RotateCw } from 'lucide-react';

export const UpgradePanel: React.FC = () => {
  const {
    energy,
    energyPerClick,
    energyPerSecond,
    clickUpgradeLevel,
    generatorUpgradeLevel,
    upgradeClick,
    upgradeGenerator
  } = useGameState();
  const { playSuccess } = useAudio();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  const handleUpgradeClick = () => {
    const cost = getUpgradeClickCost(clickUpgradeLevel);
    if (energy >= cost) {
      upgradeClick();
      playSuccess();
    }
  };

  const handleUpgradeGenerator = () => {
    const cost = getUpgradeGeneratorCost(generatorUpgradeLevel);
    if (energy >= cost) {
      upgradeGenerator();
      playSuccess();
    }
  };

  const clickCost = getUpgradeClickCost(clickUpgradeLevel);
  const generatorCost = getUpgradeGeneratorCost(generatorUpgradeLevel);

  return (
    <div className="flex space-x-4 max-w-4xl mx-auto">
      {/* Energy Per Click Upgrade */}
      <Card className="bg-black/80 border-cyan-500/30 text-white p-4 flex-1">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="text-yellow-400 mr-2" size={20} />
            <span className="font-semibold">Energy Amplifier</span>
          </div>
          
          <div className="text-sm text-gray-300 mb-2">
            Level {clickUpgradeLevel}
          </div>
          
          <div className="text-lg text-cyan-400 mb-2">
            +{energyPerClick} per tap
          </div>
          
          <Button
            onClick={handleUpgradeClick}
            disabled={energy < clickCost}
            className={`w-full ${
              energy >= clickCost
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div>Upgrade</div>
              <div className="text-xs">
                {formatNumber(clickCost)} Energy
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Auto Generator Upgrade */}
      <Card className="bg-black/80 border-cyan-500/30 text-white p-4 flex-1">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <RotateCw className="text-green-400 mr-2" size={20} />
            <span className="font-semibold">Auto Generator</span>
          </div>
          
          <div className="text-sm text-gray-300 mb-2">
            Level {generatorUpgradeLevel}
          </div>
          
          <div className="text-lg text-green-400 mb-2">
            {energyPerSecond > 0 ? `${formatNumber(energyPerSecond)}/sec` : 'Inactive'}
          </div>
          
          <Button
            onClick={handleUpgradeGenerator}
            disabled={energy < generatorCost}
            className={`w-full ${
              energy >= generatorCost
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div>Upgrade</div>
              <div className="text-xs">
                {formatNumber(generatorCost)} Energy
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
