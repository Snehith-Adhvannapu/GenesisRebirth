import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { MapCanvas } from './components/game/MapCanvas';
import { BuildingPanel } from './components/game/BuildingPanel';
import { GameUI } from './components/game/GameUI';
import { StoryModal } from './components/game/StoryModal';
import { StoryChapterModal } from './components/game/StoryChapterModal';
import { OfflineModal } from './components/game/OfflineModal';
import { useGameState } from './lib/stores/useGameState';
import { useAudio } from './lib/stores/useAudio';
import { useStory, StoryChapter } from './lib/stores/useStory';
import { useUnlocks } from './lib/stores/useUnlocks';
import { loadGameData, calculateOfflineProgress } from './lib/saveSystem';
import { Button } from './components/ui/button';
import { Map, Zap } from 'lucide-react';
import "@fontsource/inter";

function App() {
  const { initializeGame, gameStarted, addEnergy, energy } = useGameState();
  const [showStory, setShowStory] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<{ energy: number; hours: number } | null>(null);
  const [currentStoryChapter, setCurrentStoryChapter] = useState<StoryChapter | null>(null);
  const [viewMode, setViewMode] = useState<'energy' | 'map'>('energy');
  const { setHitSound, setSuccessSound, setBackgroundMusic } = useAudio();
  const { checkUnlocks, markChapterViewed } = useStory();
  const { civilizationPhase } = useUnlocks();

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

  // Check for story chapter unlocks
  useEffect(() => {
    if (gameStarted && !showStory && !currentStoryChapter && !offlineEarnings) {
      const newChapter = checkUnlocks(energy, civilizationPhase);
      if (newChapter) {
        setCurrentStoryChapter(newChapter);
      }
    }
  }, [energy, civilizationPhase, gameStarted, showStory, currentStoryChapter, offlineEarnings, checkUnlocks]);

  const handleStoryComplete = () => {
    setShowStory(false);
    initializeGame();
  };

  const handleChapterComplete = () => {
    if (currentStoryChapter) {
      markChapterViewed(currentStoryChapter.id);
      setCurrentStoryChapter(null);
    }
  };

  const handleOfflineModalClose = () => {
    if (offlineEarnings) {
      addEnergy(offlineEarnings.energy);
      setOfflineEarnings(null);
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Game Canvas - Energy Orb Visualization or Map View */}
      {viewMode === 'energy' ? <GameCanvas /> : <MapCanvas />}
      
      {/* View Toggle Button */}
      {gameStarted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-2 bg-black/80 border border-cyan-500/30 rounded-lg p-2">
            <Button
              onClick={() => setViewMode('energy')}
              className={`${
                viewMode === 'energy'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              size="sm"
            >
              <Zap size={16} className="mr-1" />
              Energy View
            </Button>
            <Button
              onClick={() => setViewMode('map')}
              className={`${
                viewMode === 'map'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              size="sm"
            >
              <Map size={16} className="mr-1" />
              Map View
            </Button>
          </div>
        </div>
      )}
      
      {/* Game UI Overlay */}
      {gameStarted && <GameUI />}
      
      {/* Building Panel (only in map view) */}
      {gameStarted && viewMode === 'map' && <BuildingPanel />}
      
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

      {/* Story Chapter Modal */}
      {currentStoryChapter && !showStory && !offlineEarnings && (
        <StoryChapterModal
          chapter={currentStoryChapter}
          onComplete={handleChapterComplete}
        />
      )}
    </div>
  );
}

export default App;
