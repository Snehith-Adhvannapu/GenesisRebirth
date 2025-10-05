import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Clock, Zap } from 'lucide-react';

interface OfflineModalProps {
  energy: number;
  hours: number;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ energy, hours, onClose }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  };

  const formatTime = (hours: number): string => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return remainingHours > 0 
        ? `${days}d ${remainingHours}h`
        : `${days}d`;
    }
    if (hours >= 1) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.floor((hours % 1) * 60);
      return minutes > 0
        ? `${wholeHours}h ${minutes}m`
        : `${wholeHours}h`;
    }
    const minutes = Math.floor(hours * 60);
    return `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 border-cyan-500/30 text-white p-8 max-w-md w-full">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Clock className="text-cyan-400 mr-2" size={32} />
            <h2 className="text-2xl font-bold text-cyan-400">Welcome Back!</h2>
          </div>

          <p className="text-gray-300 mb-6">
            Your auto-generator continued working while you were away
          </p>

          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Zap className="text-yellow-400 mr-2" size={24} />
              <span className="text-3xl font-bold text-cyan-400">
                +{formatNumber(energy)}
              </span>
            </div>
            <p className="text-sm text-gray-400">Genesis Energy Earned</p>
            <p className="text-xs text-gray-500 mt-2">
              Offline for {formatTime(hours)}
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Collect Energy
          </Button>
        </div>
      </Card>
    </div>
  );
};
