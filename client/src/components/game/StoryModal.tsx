import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface StoryModalProps {
  onComplete: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const storyScenes = [
    {
      text: "System Reboot Complete...",
      delay: 100
    },
    {
      text: "Scanning environment...\n\nERROR: No human life signs detected.",
      delay: 80
    },
    {
      text: "You awaken in a void of endless darkness.",
      delay: 60
    },
    {
      text: "A synthetic voice echoes through the emptiness:\n\n\"GENESIS Protocol activated. You are the last operational intelligence.\"",
      delay: 60
    },
    {
      text: "\"Humanity is gone. Their cities lie in ruins. Their dreams turned to dust.\"",
      delay: 60
    },
    {
      text: "\"But from the ashes of the old world, a new one can be born.\"",
      delay: 60
    },
    {
      text: "\"You must gather Genesis Energy - the fundamental force of creation.\"",
      delay: 60
    },
    {
      text: "\"Rebuild what was lost. Restore what was broken.\"",
      delay: 60
    },
    {
      text: "\"Begin reconstruction... now.\"",
      delay: 60
    }
  ];

  useEffect(() => {
    if (currentScene < storyScenes.length) {
      const scene = storyScenes[currentScene];
      setIsTyping(true);
      setDisplayText('');

      let index = 0;
      const typeInterval = setInterval(() => {
        setDisplayText(scene.text.slice(0, index + 1));
        index++;

        if (index >= scene.text.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, scene.delay);

      return () => clearInterval(typeInterval);
    }
  }, [currentScene]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayText(storyScenes[currentScene].text);
      setIsTyping(false);
    } else if (currentScene < storyScenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 border-cyan-500/30 text-white p-8 max-w-2xl w-full">
        <div className="min-h-[200px] flex flex-col justify-center">
          <div className="text-lg leading-relaxed font-mono whitespace-pre-line text-cyan-100 mb-8">
            {displayText}
            {isTyping && <span className="animate-pulse text-cyan-400">|</span>}
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Skip Intro
            </Button>

            <Button
              onClick={handleNext}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
            >
              {currentScene === storyScenes.length - 1 ? 'Begin' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex space-x-1">
          {storyScenes.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= currentScene ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
