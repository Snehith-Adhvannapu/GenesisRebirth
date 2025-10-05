import React, { useState } from 'react';
import { useGameState } from '../../lib/stores/useGameState';
import { getEnergyToBioMatterCost, getTerraformerCost } from '../../lib/gameLogic';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Leaf, Zap, ArrowRight } from 'lucide-react';

export const BioMatterPanel: React.FC = () => {
  const { energy, bioMatter, bioMatterPerSecond, terraformerCount, convertToBioMatter, buyTerraformer } = useGameState();
  const [convertAmount, setConvertAmount] = useState(1);

  const conversionCost = getEnergyToBioMatterCost(convertAmount);
  const terraformerCost = getTerraformerCost(terraformerCount);
  const canConvert = energy >= conversionCost;
  const canBuyTerraformer = energy >= terraformerCost;

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  const handleConvert = () => {
    if (canConvert) {
      convertToBioMatter(convertAmount);
    }
  };

  return (
    <Card className="bg-black/90 border-green-500/30 text-white p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-green-500/30 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="text-green-400" size={24} />
            <h2 className="text-2xl font-bold text-green-400">Life Synthesis</h2>
          </div>
          <p className="text-sm text-gray-400">Channel Genesis Energy to create biological matter</p>
        </div>

        {/* BioMatter Display */}
        <div className="bg-green-950/30 rounded-lg p-4 border border-green-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-300 mb-1">
              {formatNumber(bioMatter)}
            </div>
            <div className="text-sm text-green-400">BioMatter</div>
            {bioMatterPerSecond > 0 && (
              <div className="text-xs text-green-500 mt-1">
                +{formatNumber(bioMatterPerSecond)}/sec
              </div>
            )}
          </div>
        </div>

        {/* Conversion Controls */}
        <div className="space-y-3">
          <div className="text-sm text-gray-300">Synthesize BioMatter</div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-cyan-950/30 rounded-lg p-3 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <Zap className="text-cyan-400" size={20} />
                <span className="text-cyan-300">{formatNumber(conversionCost)} Energy</span>
              </div>
            </div>
            
            <ArrowRight className="text-gray-500" size={20} />
            
            <div className="flex-1 bg-green-950/30 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center justify-between">
                <Leaf className="text-green-400" size={20} />
                <span className="text-green-300">{convertAmount} BioMatter</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setConvertAmount(1)}
              variant={convertAmount === 1 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              x1
            </Button>
            <Button
              onClick={() => setConvertAmount(10)}
              variant={convertAmount === 10 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              x10
            </Button>
            <Button
              onClick={() => setConvertAmount(100)}
              variant={convertAmount === 100 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              x100
            </Button>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!canConvert}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500"
          >
            Synthesize Life
          </Button>
        </div>

        {/* Terraformer Section */}
        <div className="border-t border-green-500/30 pt-4 space-y-3">
          <div className="text-sm text-gray-300">Terraformer Units</div>
          
          <div className="bg-green-950/20 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-bold text-green-300">
                  {terraformerCount} Active
                </div>
                <div className="text-xs text-gray-400">
                  Auto-generating {formatNumber(bioMatterPerSecond)} BioMatter/sec
                </div>
              </div>
            </div>

            <Button
              onClick={buyTerraformer}
              disabled={!canBuyTerraformer}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500"
            >
              Build Terraformer ({formatNumber(terraformerCost)} Energy)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
