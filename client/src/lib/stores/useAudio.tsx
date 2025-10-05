import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  currentLifeStage: number; // 0-3 based on BioMatter
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  updateAmbience: (bioMatter: number) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false, // Start unmuted by default
  currentLifeStage: 0,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Control background music
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.currentTime = 0;
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.5;
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    }
    
    // Update the muted state after controlling music
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  updateAmbience: (bioMatter) => {
    const { backgroundMusic, isMuted } = get();
    
    // Determine life stage: 0: wasteland, 1: green glows, 2: plants/water, 3: full life
    let lifeStage = 0;
    if (bioMatter >= 50000) lifeStage = 3;
    else if (bioMatter >= 10000) lifeStage = 2;
    else if (bioMatter >= 1000) lifeStage = 1;
    
    const previousStage = get().currentLifeStage;
    
    // Only update if stage changed
    if (lifeStage !== previousStage) {
      set({ currentLifeStage: lifeStage });
      
      if (backgroundMusic && !isMuted) {
        // Adjust playback rate and volume based on life stage
        // More life = slower, warmer music
        const playbackRates = [1.0, 0.95, 0.9, 0.85];
        const volumes = [0.5, 0.55, 0.6, 0.65];
        
        backgroundMusic.playbackRate = playbackRates[lifeStage];
        backgroundMusic.volume = volumes[lifeStage];
        
        console.log(`Ambience updated to life stage ${lifeStage}`);
      }
    }
  }
}));
