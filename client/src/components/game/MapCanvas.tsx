import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useMap, Tile, StructureType } from '../../lib/stores/useMap';
import { useGameState } from '../../lib/stores/useGameState';

// Hex geometry helper
const createHexGeometry = () => {
  const geometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 6);
  geometry.rotateX(Math.PI / 2);
  return geometry;
};

// Convert hex coordinates to world position
const hexToWorld = (q: number, r: number): [number, number, number] => {
  const x = q * 1.75;
  const z = r * 1.5 + q * 0.75;
  return [x, 0, z];
};

// Get tile color based on type
const getTileColor = (tile: Tile): string => {
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
const getStructureColor = (structureType: StructureType): string => {
  switch (structureType) {
    case 'terraformer': return '#00ff00';
    case 'biofactory': return '#00ffff';
    case 'extractor': return '#ffaa00';
    case 'research': return '#ff00ff';
    default: return '#ffffff';
  }
};

interface HexTileProps {
  tile: Tile;
  onTileClick: (q: number, r: number) => void;
}

const HexTile: React.FC<HexTileProps> = ({ tile, onTileClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const structureRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => hexToWorld(tile.q, tile.r), [tile.q, tile.r]);
  const color = useMemo(() => getTileColor(tile), [tile.type, tile.isUnlocked]);
  const geometry = useMemo(() => createHexGeometry(), []);
  
  const { selectedStructure, selectedTile } = useMap();
  const isSelected = selectedTile === `${tile.q},${tile.r}`;
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    } else if (meshRef.current) {
      meshRef.current.position.y = 0;
    }
    
    // Animate structure
    if (structureRef.current && tile.structure) {
      structureRef.current.rotation.y += 0.01;
    }
  });
  
  const handleClick = (e: any) => {
    if (tile.isUnlocked) {
      e.stopPropagation();
      onTileClick(tile.q, tile.r);
    }
  };
  
  return (
    <group position={position}>
      {/* Base tile */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={() => {
          if (tile.isUnlocked) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Locked overlay */}
      {!tile.isUnlocked && (
        <mesh geometry={geometry} position={[0, 0.05, 0]}>
          <meshStandardMaterial
            color="#000000"
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
      
      {/* Structure on tile */}
      {tile.structure && tile.isUnlocked && (
        <mesh ref={structureRef} position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial
            color={getStructureColor(tile.structure)}
            emissive={getStructureColor(tile.structure)}
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      )}
      
      {/* Selection indicator */}
      {isSelected && selectedStructure && !tile.structure && (
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.4]} />
          <meshStandardMaterial
            color={getStructureColor(selectedStructure)}
            transparent
            opacity={0.5}
            emissive={getStructureColor(selectedStructure)}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

interface MapSceneProps {
  onTileClick: (q: number, r: number) => void;
}

const MapScene: React.FC<MapSceneProps> = ({ onTileClick }) => {
  const { tiles } = useMap();
  const { bioMatter } = useGameState();
  
  const tilesArray = useMemo(() => Array.from(tiles.values()), [tiles]);
  
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />
      
      {/* Directional lights */}
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />
      
      {/* Point light for atmosphere */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color={bioMatter > 1000 ? '#00ff88' : '#0088ff'} />
      
      {/* Render all tiles */}
      {tilesArray.map((tile) => (
        <HexTile
          key={`${tile.q},${tile.r}`}
          tile={tile}
          onTileClick={onTileClick}
        />
      ))}
    </>
  );
};

export const MapCanvas: React.FC = () => {
  const { initializeMap, placeStructure, selectedStructure, setSelectedTile, selectedTile, unlockTiles, canAffordStructure } = useMap();
  const { energy, bioMatter } = useGameState();
  
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);
  
  // Unlock tiles based on BioMatter
  useEffect(() => {
    unlockTiles(bioMatter);
  }, [bioMatter, unlockTiles]);
  
  const { spendEnergy, spendBioMatter } = useGameState();
  const { structures } = useMap();
  
  const handleTileClick = (q: number, r: number) => {
    const tileKey = `${q},${r}`;
    
    // If a structure is selected and we can afford it, try to place it
    if (selectedStructure) {
      if (!canAffordStructure(selectedStructure, energy, bioMatter)) {
        console.log('Cannot afford structure');
        return;
      }
      
      const structure = structures[selectedStructure];
      const success = placeStructure(q, r, selectedStructure);
      if (success) {
        console.log(`Placed ${selectedStructure} at (${q}, ${r})`);
        // Deduct costs using proper spend methods
        const energySpent = spendEnergy(structure.energyCost);
        const bioMatterSpent = structure.bioMatterCost > 0 ? spendBioMatter(structure.bioMatterCost) : true;
        
        if (!energySpent || !bioMatterSpent) {
          console.error('Failed to deduct resources - this should not happen');
        }
      } else {
        console.log('Cannot place structure here - check placement rules');
      }
    } else {
      // Just select the tile to show info
      setSelectedTile(selectedTile === tileKey ? null : tileKey);
    }
  };
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 0 }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 12, 8]} fov={60} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
          enablePan={true}
        />
        <MapScene onTileClick={handleTileClick} />
      </Canvas>
    </div>
  );
};
