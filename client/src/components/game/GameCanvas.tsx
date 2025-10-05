import React, { useRef, useEffect } from 'react';
import { useGameState } from '../../lib/stores/useGameState';
import { useUnlocks } from '../../lib/stores/useUnlocks';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { energy, energyPerClick, isGenerating, bioMatter } = useGameState();
  const { civilizationPhase } = useUnlocks();
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let time = 0;
    let pulseIntensity = 0;

    const animate = () => {
      time += 0.016; // ~60fps
      
      // Determine life stage based on BioMatter
      let lifeStage = 0; // 0: wasteland, 1: green glows, 2: plants/water, 3: full life
      if (bioMatter >= 50000) lifeStage = 3;
      else if (bioMatter >= 10000) lifeStage = 2;
      else if (bioMatter >= 1000) lifeStage = 1;
      
      // Background color based on civilization phase and life stage
      let bgColor = '#000000';
      let gridColor = 'rgba(0, 255, 255, 0.1)';
      
      // Override colors if life is present
      if (lifeStage > 0) {
        // Transition to greenish/blue tones as life emerges
        const greenProgress = Math.min(bioMatter / 50000, 1);
        const r = Math.floor(10 * (1 - greenProgress * 0.5));
        const g = Math.floor(20 + 40 * greenProgress);
        const b = Math.floor(20 + 60 * greenProgress);
        bgColor = `rgb(${r}, ${g}, ${b})`;
        gridColor = `rgba(0, ${150 + 100 * greenProgress}, ${100 + 100 * greenProgress}, ${0.1 + 0.2 * greenProgress})`;
      } else {
        switch (civilizationPhase) {
          case 'void':
            bgColor = '#000000';
            gridColor = 'rgba(0, 255, 255, 0.1)';
            break;
          case 'awakening':
            bgColor = '#0a0a1a';
            gridColor = 'rgba(100, 150, 255, 0.15)';
            break;
          case 'foundation':
            bgColor = '#0f0f28';
            gridColor = 'rgba(150, 150, 255, 0.2)';
            break;
          case 'reconstruction':
            bgColor = '#1a1a3a';
            gridColor = 'rgba(200, 200, 255, 0.25)';
            break;
          case 'renaissance':
            bgColor = '#1a1a50';
            gridColor = 'rgba(255, 200, 150, 0.3)';
            break;
          case 'ascension':
            bgColor = '#0a0030';
            gridColor = 'rgba(255, 100, 255, 0.35)';
            break;
        }
      }
      
      // Clear canvas with phase-appropriate background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background grid effect
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center coordinates
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Energy orb
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.15;
      const energyScale = Math.log10(energy + 10) / 10; // Logarithmic scaling
      const orbRadius = baseRadius * (0.5 + energyScale);
      
      // Pulse effect when generating energy
      if (isGenerating) {
        pulseIntensity = Math.min(pulseIntensity + 0.1, 1);
      } else {
        pulseIntensity = Math.max(pulseIntensity - 0.05, 0);
      }

      const pulsedRadius = orbRadius + Math.sin(time * 10) * 10 * pulseIntensity;

      // Outer glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulsedRadius * 2
      );
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 50, 255, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulsedRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main energy orb
      const orbGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulsedRadius
      );
      orbGradient.addColorStop(0, '#00FFFF');
      orbGradient.addColorStop(0.7, '#0080FF');
      orbGradient.addColorStop(1, '#0040FF');
      
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulsedRadius, 0, Math.PI * 2);
      ctx.fill();

      // Energy particles
      const particleCount = Math.min(20, Math.floor(energyPerClick));
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time;
        const distance = pulsedRadius * 1.5 + Math.sin(time * 2 + i) * 20;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core energy lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.5;
        const innerRadius = pulsedRadius * 0.3;
        const outerRadius = pulsedRadius * 0.8;
        
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
      }

      // Life stage visual effects
      if (lifeStage >= 1) {
        // Stage 1: Green glows under the ground
        const glowCount = Math.min(10, Math.floor(bioMatter / 100));
        for (let i = 0; i < glowCount; i++) {
          const angle = (i / glowCount) * Math.PI * 2 + time * 0.3;
          const distance = canvas.height * 0.4 + Math.sin(time * 2 + i) * 30;
          const x = centerX + Math.cos(angle) * distance;
          const y = canvas.height - 50 + Math.sin(time + i) * 20;
          
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
          glowGradient.addColorStop(0, 'rgba(0, 255, 100, 0.3)');
          glowGradient.addColorStop(1, 'rgba(0, 150, 50, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (lifeStage >= 2) {
        // Stage 2: Vines and mist
        ctx.strokeStyle = 'rgba(50, 200, 100, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          const startX = (canvas.width / 6) * (i + 1);
          const startY = canvas.height;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          
          for (let j = 0; j < 10; j++) {
            const x = startX + Math.sin(time + i + j * 0.5) * 20;
            const y = startY - j * 30;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        
        // Water streams at bottom
        ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      }

      if (lifeStage >= 3) {
        // Stage 3: Floating microorganisms
        const organismCount = 15;
        for (let i = 0; i < organismCount; i++) {
          const angle = (i / organismCount) * Math.PI * 2 + time * 0.5;
          const distance = pulsedRadius * 2.5 + Math.sin(time * 2 + i) * 50;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = 3 + Math.sin(time * 3 + i) * 2;
          
          ctx.fillStyle = `rgba(100, 255, 150, ${0.4 + Math.sin(time * 2 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Cell nucleus
          ctx.fillStyle = `rgba(200, 255, 200, ${0.6 + Math.sin(time * 3 + i) * 0.4})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [energy, energyPerClick, isGenerating, civilizationPhase, bioMatter]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
