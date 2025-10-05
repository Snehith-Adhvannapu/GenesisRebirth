import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { GameUI } from './components/game/GameUI';
import { StoryModal } from './components/game/StoryModal';
import { OfflineModal } from './components/game/OfflineModal';
import { useGameState } from './lib/stores/useGameState';
import { useAudio } from './lib/stores/useAudio';
import { loadGameData, calculateOfflineProgress } from './lib/saveSystem';
import "@fontsource/inter";

function App() {
  const { initializeGame, gameStarted, addEnergy } = useGameState();
  const [showStory, setShowStory] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<{ energy: number; hours: number } | null>(null);
  const { setHitSound, setSuccessSound, setBackgroundMusic } = useAudio();

  useEffect(() => {
    // Initialize audio
    const hitAudio = new Audio('/sounds/hit.mp3');
    const successAudio = new Audio('/sounds/success.mp3');
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    setBackgroundMusic(bgMusic);

    // Load saved game data
    const savedData = loadGameData();
    if (savedData) {
      // Calculate offline earnings
      const offlineProgress = calculateOfflineProgress(savedData);
      if (offlineProgress) {
        setOfflineEarnings({
          energy: offlineProgress.offlineEarnings,
          hours: offlineProgress.offlineHours
        });
      }
      initializeGame(savedData);
    } else {
      // First time playing, show story
      setShowStory(true);
    }
  }, [initializeGame, setHitSound, setSuccessSound, setBackgroundMusic, addEnergy]);

  const handleStoryComplete = () => {
    setShowStory(false);
    initializeGame();
  };

  const handleOfflineModalClose = () => {
    if (offlineEarnings) {
      addEnergy(offlineEarnings.energy);
      setOfflineEarnings(null);
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Game Canvas - Energy Orb Visualization */}
      <GameCanvas />
      
      {/* Game UI Overlay */}
      {gameStarted && <GameUI />}
      
      {/* Story Modal */}
      {showStory && <StoryModal onComplete={handleStoryComplete} />}
      
      {/* Offline Earnings Modal */}
      {offlineEarnings && !showStory && (
        <OfflineModal
          energy={offlineEarnings.energy}
          hours={offlineEarnings.hours}
          onClose={handleOfflineModalClose}
        />
      )}
    </div>
  );
}

export default App;
