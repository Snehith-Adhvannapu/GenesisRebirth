import React, { useRef, useEffect } from 'react';
import { useGameState } from '../../lib/stores/useGameState';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { energy, energyPerClick, isGenerating } = useGameState();
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
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background grid effect
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
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

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [energy, energyPerClick, isGenerating]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
