import React from 'react';
import { EnergyOrb } from './EnergyOrb';
import { UpgradePanel } from './UpgradePanel';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Volume2, VolumeX } from 'lucide-react';

export const GameUI: React.FC = () => {
  const { energy, energyPerSecond } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex justify-between items-start">
          {/* Energy Display */}
          <Card className="bg-black/80 border-cyan-500/30 text-white p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {formatNumber(energy)}
              </div>
              <div className="text-sm text-cyan-300">Genesis Energy</div>
              {energyPerSecond > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  +{formatNumber(energyPerSecond)}/sec
                </div>
              )}
            </div>
          </Card>

          {/* Sound Toggle */}
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="text-white hover:text-cyan-400"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>

      {/* Center Energy Orb (Clickable) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <EnergyOrb />
      </div>

      {/* Bottom Upgrade Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <UpgradePanel />
      </div>
    </div>
  );
};
