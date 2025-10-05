import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { StoryChapter } from '../../lib/stores/useStory';
import { Book } from 'lucide-react';

interface StoryChapterModalProps {
  chapter: StoryChapter;
  onComplete: () => void;
}

export const StoryChapterModal: React.FC<StoryChapterModalProps> = ({ chapter, onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentScene < chapter.scenes.length) {
      const scene = chapter.scenes[currentScene];
      setIsTyping(true);
      setDisplayText('');

      let index = 0;
      const typeInterval = setInterval(() => {
        setDisplayText(scene.slice(0, index + 1));
        index++;

        if (index >= scene.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 40);

      return () => clearInterval(typeInterval);
    }
  }, [currentScene, chapter.scenes]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayText(chapter.scenes[currentScene]);
      setIsTyping(false);
    } else if (currentScene < chapter.scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-b from-purple-900/90 to-black/90 border-purple-500/30 text-white p-8 max-w-2xl w-full">
        <div className="min-h-[200px] flex flex-col justify-center">
          {/* Chapter Title */}
          <div className="flex items-center justify-center mb-6">
            <Book className="text-purple-400 mr-2" size={24} />
            <h2 className="text-xl font-bold text-purple-400">{chapter.title}</h2>
          </div>

          {/* Story Text */}
          <div className="text-lg leading-relaxed font-serif whitespace-pre-line text-gray-100 mb-8 text-center min-h-[120px]">
            {displayText}
            {isTyping && <span className="animate-pulse text-purple-400">|</span>}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              {currentScene === chapter.scenes.length - 1 ? 'Continue Journey' : 'Next'}
            </Button>
          </div>

          {/* Progress Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {chapter.scenes.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index <= currentScene ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
