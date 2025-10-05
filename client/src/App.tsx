import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { GameUI } from './components/game/GameUI';
import { StoryModal } from './components/game/StoryModal';
import { useGameState } from './lib/stores/useGameState';
import { useAudio } from './lib/stores/useAudio';
import { loadGameData } from './lib/saveSystem';
import "@fontsource/inter";

function App() {
  const { initializeGame, gameStarted } = useGameState();
  const [showStory, setShowStory] = useState(false);
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
      initializeGame(savedData);
    } else {
      // First time playing, show story
      setShowStory(true);
    }
  }, [initializeGame, setHitSound, setSuccessSound]);

  const handleStoryComplete = () => {
    setShowStory(false);
    initializeGame();
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Game Canvas - Energy Orb Visualization */}
      <GameCanvas />
      
      {/* Game UI Overlay */}
      {gameStarted && <GameUI />}
      
      {/* Story Modal */}
      {showStory && <StoryModal onComplete={handleStoryComplete} />}
    </div>
  );
}

export default App;
