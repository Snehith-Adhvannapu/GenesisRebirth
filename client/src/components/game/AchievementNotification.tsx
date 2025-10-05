import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Achievement } from '../../lib/stores/useAchievements';
import { Trophy } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 100);

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <Card className="bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-yellow-500/50 text-white p-4 min-w-[300px]">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Trophy className="text-yellow-400" size={16} />
              <span className="text-sm font-semibold text-yellow-400">Achievement Unlocked!</span>
            </div>
            <div className="font-bold text-white">{achievement.name}</div>
            <div className="text-xs text-gray-300">{achievement.description}</div>
            {achievement.reward.type === 'multiplier' && (
              <div className="text-xs text-green-400 mt-1">
                Bonus: {(achievement.reward.value - 1) * 100}% multiplier
              </div>
            )}
            {achievement.reward.type === 'bonus_energy' && (
              <div className="text-xs text-cyan-400 mt-1">
                Bonus: +{achievement.reward.value} Energy
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
