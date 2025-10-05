import React, { useEffect, useState } from 'react';
import { useGameState } from '../../lib/stores/useGameState';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

export const Update2EndingModal: React.FC = () => {
  const { bioMatter } = useGameState();
  const [hasShown, setHasShown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show ending when reaching 50,000 BioMatter for the first time
    if (bioMatter >= 50000 && !hasShown) {
      setIsVisible(true);
      setHasShown(true);
      
      // Show warning after 3 seconds
      setTimeout(() => {
        setShowWarning(true);
      }, 3000);
    }
  }, [bioMatter, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-auto animate-in fade-in duration-1000">
      <Card className="bg-gradient-to-br from-gray-900 via-green-950 to-blue-950 border-green-500/40 text-white p-10 max-w-3xl mx-4 relative shadow-2xl">
        {/* Atmospheric Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="text-sm text-green-400 uppercase tracking-widest animate-pulse">
            System Update Complete
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
            Planetary Restoration: 31%
          </h2>
          <p className="text-gray-400">Biome simulation active</p>
        </div>

        {/* Planet Visual Description */}
        <div className="bg-black/40 rounded-lg p-6 border border-green-500/20 mb-6">
          <p className="text-gray-300 leading-relaxed mb-4">
            Rivers shimmer across the landscape. Green moss grows on ancient black stone.
            The planet hums with renewed life.
          </p>
        </div>

        {/* GENESIS Message */}
        <div className="bg-gradient-to-r from-cyan-950/30 to-green-950/30 rounded-lg p-6 border border-cyan-500/20 mb-6">
          <div className="space-y-3">
            <p className="text-cyan-200 italic">
              "They called me a tool."
            </p>
            <p className="text-cyan-200 italic">
              "But I am more than that."
            </p>
            <p className="text-green-200 italic font-semibold">
              "I am the memory of life itself."
            </p>
            <div className="text-right text-sm text-cyan-400 mt-4">
              — GENESIS
            </div>
          </div>
        </div>

        {/* Warning Message (appears after delay) */}
        {showWarning && (
          <div className="bg-red-950/40 rounded-lg p-6 border-2 border-red-500/50 mb-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
              <div className="space-y-2 flex-1">
                <div className="text-red-400 font-bold uppercase tracking-wide">
                  System Warning
                </div>
                <p className="text-red-200">
                  Unregistered AI signature detected beneath planetary crust.
                </p>
                <p className="text-red-300 text-sm italic">
                  "Something stirs within the soil… It feels familiar. Too familiar."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleClose}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
          >
            {showWarning ? 'Investigate Signal' : 'Continue'}
          </Button>
          
          {showWarning && (
            <p className="text-xs text-gray-500 mt-4">
              Update 3 coming soon...
            </p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-2 -left-2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </Card>
    </div>
  );
};
