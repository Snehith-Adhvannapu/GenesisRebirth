import React, { useState, useEffect } from 'react';
import { EnergyOrb } from './EnergyOrb';
import { UpgradePanel } from './UpgradePanel';
import { AchievementsPanel } from './AchievementsPanel';
import { PrestigePanel } from './PrestigePanel';
import { AchievementNotification } from './AchievementNotification';
import { BioMatterPanel } from './BioMatterPanel';
import { TerritoryPanel } from './TerritoryPanel';
import { DiscoveryLogModal } from './DiscoveryLogModal';
import { Update2EndingModal } from './Update2EndingModal';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';
import { useAchievements, Achievement } from '../../lib/stores/useAchievements';
import { useUnlocks } from '../../lib/stores/useUnlocks';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Volume2, VolumeX, Leaf, Map } from 'lucide-react';

interface GameUIProps {
  viewMode?: 'energy' | 'map';
}

export const GameUI: React.FC<GameUIProps> = ({ viewMode = 'energy' }) => {
  const { energy, energyPerSecond, bioMatter, minerals, rareCrystals } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  const { unlockedIds } = useAchievements();
  const { getTotalProduction } = useUnlocks();
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showBioMatterPanel, setShowBioMatterPanel] = useState(false);
  const [showTerritoryPanel, setShowTerritoryPanel] = useState(false);
  
  const structureProduction = getTotalProduction();
  const totalPerSecond = energyPerSecond + structureProduction;

  // Track new achievements
  useEffect(() => {
    let previousUnlockedIds = useAchievements.getState().unlockedIds;
    
    const checkForNewAchievements = useAchievements.subscribe(
      (state) => {
        const newUnlockedIds = state.unlockedIds;
        const newIds = newUnlockedIds.filter((id: string) => !previousUnlockedIds.includes(id));
        if (newIds.length > 0) {
          const achievements = state.achievements;
          const newAchievements = newIds.map((id: string) => 
            achievements.find(a => a.id === id)
          ).filter(Boolean) as Achievement[];
          
          setAchievementQueue(prev => [...prev, ...newAchievements]);
        }
        previousUnlockedIds = newUnlockedIds;
      }
    );

    return () => checkForNewAchievements();
  }, []);

  // Display achievements from queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(rest);
      
      // Apply bonus energy if applicable
      if (next.reward.type === 'bonus_energy') {
        useGameState.getState().addEnergy(next.reward.value);
      }
    }
  }, [achievementQueue, currentAchievement]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 p-1 md:p-4 pointer-events-auto z-10">
        <div className="flex justify-between items-start gap-1">
          {/* Energy Display */}
          <Card className="bg-black/90 border-cyan-500/30 text-white p-1.5 md:p-4 flex-shrink min-w-[80px]">
            <div className="text-center">
              <div className="text-lg md:text-3xl font-bold text-cyan-400 mb-0 md:mb-1">
                {formatNumber(energy)}
              </div>
              <div className="text-[9px] md:text-sm text-cyan-300 hidden sm:block">Genesis Energy</div>
              <div className="text-[9px] md:text-sm text-cyan-300 sm:hidden">Energy</div>
              {totalPerSecond > 0 && (
                <div className="text-[9px] md:text-xs text-green-400 mt-0 md:mt-1">
                  +{formatNumber(totalPerSecond)}/s
                </div>
              )}
            </div>
          </Card>

          {/* Controls */}
          <div className="flex flex-wrap gap-1 md:gap-2 pointer-events-auto justify-end items-center">
            <Button
              onClick={() => setShowBioMatterPanel(!showBioMatterPanel)}
              variant="ghost"
              size="sm"
              className="text-white hover:text-green-400 pointer-events-auto h-8 w-8 md:h-10 md:w-10 p-0 flex-shrink-0"
              title="BioMatter Synthesis"
            >
              <Leaf size={16} className="md:w-5 md:h-5" />
            </Button>
            <Button
              onClick={() => setShowTerritoryPanel(!showTerritoryPanel)}
              variant="ghost"
              size="sm"
              className="text-white hover:text-amber-400 pointer-events-auto h-8 w-8 md:h-10 md:w-10 p-0 flex-shrink-0"
              title="Territory Management"
            >
              <Map size={16} className="md:w-5 md:h-5" />
            </Button>
            <PrestigePanel />
            <AchievementsPanel />
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:text-cyan-400 pointer-events-auto h-8 w-8 md:h-10 md:w-10 p-0 flex-shrink-0"
            >
              {isMuted ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Center Energy Orb (Clickable) - Only in Energy View */}
      {viewMode === 'energy' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <EnergyOrb />
          </div>
        </div>
      )}

      {/* Bottom Upgrade Panel - Only in Energy View */}
      {viewMode === 'energy' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto z-10">
          <UpgradePanel />
        </div>
      )}

      {/* BioMatter Panel */}
      {showBioMatterPanel && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10 w-full max-w-2xl px-4">
          <BioMatterPanel />
          <Button
            onClick={() => setShowBioMatterPanel(false)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-6 text-white hover:text-red-400"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Territory Panel */}
      {showTerritoryPanel && (
        <div className="absolute top-20 right-4 pointer-events-auto z-10 w-full max-w-sm">
          <TerritoryPanel />
          <Button
            onClick={() => setShowTerritoryPanel(false)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white hover:text-red-400"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Discovery Log Modal */}
      <DiscoveryLogModal />

      {/* Update 2 Ending Modal */}
      <Update2EndingModal />

      {/* Achievement Notifications */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
      )}
    </div>
  );
};
