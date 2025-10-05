import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAchievements } from '../../lib/stores/useAchievements';
import { Trophy, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export const AchievementsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { achievements, unlockedIds, totalMultiplier } = useAchievements();

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;

  return (
    <>
      {/* Achievement Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="text-white hover:text-yellow-400 relative h-8 w-8 md:h-10 md:w-10 p-0"
      >
        <Trophy size={16} className="md:w-5 md:h-5" />
        {unlockedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
            {unlockedCount}
          </span>
        )}
      </Button>

      {/* Achievements Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <Card className="bg-black/90 border-cyan-500/30 text-white p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
                  <Trophy className="mr-2" size={28} />
                  Achievements
                </h2>
                <p className="text-sm text-gray-400">
                  {unlockedCount} / {totalCount} Unlocked
                  {totalMultiplier > 1 && (
                    <span className="ml-2 text-green-400">
                      ({totalMultiplier.toFixed(1)}x Total Multiplier)
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

            {/* Achievements List */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <Card
                    key={achievement.id}
                    className={`p-4 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/30'
                        : 'bg-gray-900/30 border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`text-3xl ${
                          achievement.unlocked ? 'opacity-100' : 'opacity-30 grayscale'
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{achievement.name}</div>
                        <div className="text-sm text-gray-300 mt-1">
                          {achievement.description}
                        </div>
                        {achievement.unlocked ? (
                          <div className="text-xs mt-2">
                            {achievement.reward.type === 'multiplier' && (
                              <span className="text-green-400">
                                ✓ {(achievement.reward.value - 1) * 100}% multiplier active
                              </span>
                            )}
                            {achievement.reward.type === 'bonus_energy' && (
                              <span className="text-cyan-400">
                                ✓ +{achievement.reward.value} Energy claimed
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 mt-2">
                            🔒 Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </>
  );
};
