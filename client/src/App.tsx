import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { MapCanvas2D } from './components/game/MapCanvas2D';
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
      {viewMode === 'energy' ? <GameCanvas /> : <MapCanvas2D />}
      
      {/* View Toggle Button */}
      {gameStarted && (
        <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto" style={{ zIndex: 20 }}>
          <div className="flex gap-1 md:gap-2 bg-black/90 border border-cyan-500/30 rounded-lg p-1 md:p-2">
            <Button
              onClick={() => setViewMode('energy')}
              className={`${
                viewMode === 'energy'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              } text-xs md:text-sm px-2 md:px-3 h-7 md:h-9`}
              size="sm"
            >
              <Zap size={14} className="mr-1 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Energy</span>
              <span className="sm:hidden">⚡</span>
            </Button>
            <Button
              onClick={() => setViewMode('map')}
              className={`${
                viewMode === 'map'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              } text-xs md:text-sm px-2 md:px-3 h-7 md:h-9`}
              size="sm"
            >
              <Map size={14} className="mr-1 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Map</span>
              <span className="sm:hidden">🗺️</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Game UI Overlay */}
      {gameStarted && <GameUI viewMode={viewMode} />}
      
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
