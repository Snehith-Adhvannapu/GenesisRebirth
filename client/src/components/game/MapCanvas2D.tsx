import React, { useRef, useEffect, useState } from 'react';
import { useMap } from '../../lib/stores/useMap';
import { useGameState } from '../../lib/stores/useGameState';

const TILE_SIZE = 50; // Smaller for mobile optimization
const MAP_SIZE = 10; // 10x10 grid

// Convert grid coordinates to world position
const gridToWorld = (x: number, y: number): [number, number] => {
  return [x * TILE_SIZE, y * TILE_SIZE];
};

// Get tile color based on type
const getTileColor = (tile: any): string => {
  if (!tile.isUnlocked) return '#1a1a1a';
  
  switch (tile.type) {
    case 'barren': return '#3a3a3a';
    case 'water': return '#2a5a8a';
    case 'mountain': return '#5a4a3a';
    case 'crater': return '#4a3a5a';
    case 'green': return '#2a5a2a';
    case 'forest': return '#1a4a1a';
    default: return '#3a3a3a';
  }
};

// Get structure color
const getStructureColor = (structureType: string): string => {
  switch (structureType) {
    case 'terraformer': return '#00ff00';
    case 'biofactory': return '#00ffff';
    case 'extractor': return '#ffaa00';
    case 'research': return '#ff00ff';
    default: return '#ffffff';
  }
};

export const MapCanvas2D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTileInfo, setShowTileInfo] = useState(false);
  const [tileInfoPosition, setTileInfoPosition] = useState({ x: 0, y: 0 });
  const [tileInfoData, setTileInfoData] = useState<any>(null);
  
  const { tiles, selectedStructure, selectedTile, setSelectedTile, initializeMap, unlockTiles, placeStructure, canAffordStructure, structures } = useMap();
  const { energy, bioMatter, spendEnergy, spendBioMatter } = useGameState();
  
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);
  
  useEffect(() => {
    unlockTiles(bioMatter);
  }, [bioMatter, unlockTiles]);
  
  // Render the map
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Center the camera on the map
      const mapWidth = MAP_SIZE * TILE_SIZE;
      const mapHeight = MAP_SIZE * TILE_SIZE;
      setCamera({
        x: (canvas.width - mapWidth) / 2,
        y: (canvas.height - mapHeight) / 2,
        zoom: Math.min(canvas.width / mapWidth, canvas.height / mapHeight) * 0.8
      });
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrame: number;
    let time = 0;
    
    const render = () => {
      time += 0.016;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);
      
      // Draw grid background
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1 / camera.zoom;
      for (let x = 0; x <= MAP_SIZE; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, MAP_SIZE * TILE_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= MAP_SIZE; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(MAP_SIZE * TILE_SIZE, y * TILE_SIZE);
        ctx.stroke();
      }
      
      // Draw tiles
      tiles.forEach((tile) => {
        const [x, y] = gridToWorld(tile.q, tile.r);
        const color = getTileColor(tile);
        
        // Tile background
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        
        // Selected tile highlight
        if (selectedTile === `${tile.q},${tile.r}`) {
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 3 / camera.zoom;
          ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          
          // Pulse effect
          const pulse = Math.sin(time * 3) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.2})`;
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
        
        // Locked overlay
        if (!tile.isUnlocked) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          
          // Lock icon
          ctx.fillStyle = '#666';
          ctx.font = `${20 / camera.zoom}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔒', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
        
        // Structure on tile
        if (tile.structure && tile.isUnlocked) {
          const structureColor = getStructureColor(tile.structure);
          ctx.fillStyle = structureColor;
          
          // Rotating square
          ctx.save();
          ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
          ctx.rotate(time * 0.5);
          ctx.fillRect(-15, -15, 30, 30);
          ctx.restore();
          
          // Glow effect
          const gradient = ctx.createRadialGradient(
            x + TILE_SIZE / 2, y + TILE_SIZE / 2, 0,
            x + TILE_SIZE / 2, y + TILE_SIZE / 2, 25
          );
          gradient.addColorStop(0, structureColor + '80');
          gradient.addColorStop(1, structureColor + '00');
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 20);
        }
        
        // Preview placement
        if (selectedTile === `${tile.q},${tile.r}` && selectedStructure && !tile.structure && tile.isUnlocked) {
          const structureColor = getStructureColor(selectedStructure);
          ctx.fillStyle = structureColor + '60';
          ctx.fillRect(x + 15, y + 15, TILE_SIZE - 30, TILE_SIZE - 30);
        }
      });
      
      ctx.restore();
      
      animationFrame = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animationFrame);
  }, [tiles, selectedTile, selectedStructure, camera]);
  
  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setCamera(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - camera.x) / camera.zoom;
    const y = (e.clientY - rect.top - camera.y) / camera.zoom;
    
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
      const tileKey = `${tileX},${tileY}`;
      const tile = tiles.get(tileKey);
      
      if (tile && tile.isUnlocked) {
        if (selectedStructure && !tile.structure) {
          if (canAffordStructure(selectedStructure, energy, bioMatter)) {
            const structure = structures[selectedStructure];
            const success = placeStructure(tileX, tileY, selectedStructure);
            if (success) {
              spendEnergy(structure.energyCost);
              if (structure.bioMatterCost > 0) {
                spendBioMatter(structure.bioMatterCost);
              }
            }
          }
        } else if (!selectedStructure) {
          // Show tile info when no structure is selected
          setTileInfoData(tile);
          setTileInfoPosition({ x: e.clientX, y: e.clientY });
          setShowTileInfo(true);
        } else {
          setSelectedTile(selectedTile === tileKey ? null : tileKey);
        }
      }
    }
  };
  
  const getTileTypeName = (type: string): string => {
    switch (type) {
      case 'barren': return 'Barren Land';
      case 'water': return 'Water';
      case 'mountain': return 'Mountain';
      case 'crater': return 'Crater';
      case 'green': return 'Green Land';
      case 'forest': return 'Forest';
      default: return 'Unknown';
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
      />
      
      {/* Tile Info Popup */}
      {showTileInfo && tileInfoData && (
        <div 
          className="fixed bg-black/95 border-2 border-cyan-500/50 rounded-lg p-3 text-white z-50 pointer-events-auto shadow-2xl"
          style={{
            left: Math.min(tileInfoPosition.x, window.innerWidth - 200),
            top: Math.min(tileInfoPosition.y, window.innerHeight - 150),
            maxWidth: '200px'
          }}
          onClick={() => setShowTileInfo(false)}
        >
          <div className="text-sm">
            <div className="font-bold text-cyan-400 mb-2 flex justify-between items-start">
              <span>{getTileTypeName(tileInfoData.type)}</span>
              <button 
                onClick={() => setShowTileInfo(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-xs space-y-1">
              <div className="text-gray-300">
                Position: ({tileInfoData.q}, {tileInfoData.r})
              </div>
              {tileInfoData.structure && structures[tileInfoData.structure as keyof typeof structures] && (
                <div className="text-green-400 font-semibold">
                  Structure: {structures[tileInfoData.structure as keyof typeof structures].name}
                </div>
              )}
              {!tileInfoData.structure && (
                <div className="text-gray-400 italic">
                  No structure built
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
