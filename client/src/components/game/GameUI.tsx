import React, { useState, useEffect } from 'react';
import { EnergyOrb } from './EnergyOrb';
import { UpgradePanel } from './UpgradePanel';
import { AchievementsPanel } from './AchievementsPanel';
import { StructuresPanel } from './StructuresPanel';
import { PrestigePanel } from './PrestigePanel';
import { AchievementNotification } from './AchievementNotification';
import { BioMatterPanel } from './BioMatterPanel';
import { DiscoveryLogModal } from './DiscoveryLogModal';
import { Update2EndingModal } from './Update2EndingModal';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';
import { useAchievements, Achievement } from '../../lib/stores/useAchievements';
import { useUnlocks } from '../../lib/stores/useUnlocks';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Volume2, VolumeX, Leaf } from 'lucide-react';

export const GameUI: React.FC = () => {
  const { energy, energyPerSecond, bioMatter } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  const { unlockedIds } = useAchievements();
  const { getTotalProduction } = useUnlocks();
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showBioMatterPanel, setShowBioMatterPanel] = useState(false);
  
  const structureProduction = getTotalProduction();
  const totalPerSecond = energyPerSecond + structureProduction;

  // Track new achievements
  useEffect(() => {
    let previousUnlockedIds = useAchievements.getState().unlockedIds;
    
    const checkForNewAchievements = useAchievements.subscribe(
      state => state.unlockedIds,
      (newUnlockedIds: string[]) => {
        const newIds = newUnlockedIds.filter((id: string) => !previousUnlockedIds.includes(id));
        if (newIds.length > 0) {
          const achievements = useAchievements.getState().achievements;
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
              {totalPerSecond > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  +{formatNumber(totalPerSecond)}/sec
                </div>
              )}
            </div>
          </Card>

          {/* Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBioMatterPanel(!showBioMatterPanel)}
              variant="ghost"
              size="sm"
              className="text-white hover:text-green-400"
              title="BioMatter Synthesis"
            >
              <Leaf size={20} />
            </Button>
            <PrestigePanel />
            <StructuresPanel />
            <AchievementsPanel />
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
      </div>

      {/* Center Energy Orb (Clickable) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <EnergyOrb />
      </div>

      {/* Bottom Upgrade Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <UpgradePanel />
      </div>

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
