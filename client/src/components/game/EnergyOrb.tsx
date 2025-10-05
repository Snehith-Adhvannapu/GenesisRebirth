import React, { useState, useEffect } from 'react';
import { useGameState } from '../../lib/stores/useGameState';
import { useAudio } from '../../lib/stores/useAudio';

export const EnergyOrb: React.FC = () => {
  const { generateEnergy, energyPerClick, setIsGenerating } = useGameState();
  const { playHit } = useAudio();
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Generate energy
    generateEnergy();
    setIsGenerating(true);
    
    // Play sound
    playHit();

    // Add click effect
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newEffect = {
      id: Date.now(),
      x: centerX,
      y: centerY
    };
    
    setClickEffects(prev => [...prev, newEffect]);

    // Remove effect after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);

    // Reset generating state
    setTimeout(() => setIsGenerating(false), 200);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleClick(e);
  };

  return (
    <div className="relative">
      {/* Clickable area */}
      <div
        className="w-64 h-64 rounded-full cursor-pointer select-none relative z-10"
        style={{ touchAction: 'manipulation' }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Click effects */}
        {clickEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none text-cyan-400 font-bold text-xl animate-ping"
            style={{
              left: effect.x - 20,
              top: effect.y - 10,
              animation: 'float-up 1s ease-out forwards'
            }}
          >
            +{energyPerClick}
          </div>
        ))}
      </div>

      {/* Tap hint for mobile */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="text-center text-cyan-300 text-sm animate-pulse">
          <div>Tap to Generate</div>
          <div>Genesis Energy</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
