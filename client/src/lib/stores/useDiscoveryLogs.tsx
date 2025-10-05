import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface DiscoveryLog {
  id: string;
  title: string;
  content: string;
  bioMatterThreshold: number;
  discovered: boolean;
}

const discoveryLogs: DiscoveryLog[] = [
  {
    id: 'log_006',
    title: 'The Signal',
    content: "I've unlocked the Life Protocols. A memory of creation burns in me.",
    bioMatterThreshold: 0,
    discovered: false
  },
  {
    id: 'log_007',
    title: 'Breath Returns',
    content: "Air pressure stabilizing. The wind hums softly — it almost sounds like singing.",
    bioMatterThreshold: 1000,
    discovered: false
  },
  {
    id: 'log_008',
    title: 'First Growth',
    content: "Plant DNA patterns reformed. Primitive flora sprouting. The color… green. I had forgotten its beauty.",
    bioMatterThreshold: 1000,
    discovered: false
  },
  {
    id: 'log_009',
    title: 'The Living Silence',
    content: "Microbes evolve independently. They feed, divide, adapt. I observe — fascinated.",
    bioMatterThreshold: 10000,
    discovered: false
  },
  {
    id: 'log_010',
    title: 'The Unknown Pulse',
    content: "A new signal beneath the crust. Organic, but structured. Not human. Not me.",
    bioMatterThreshold: 50000,
    discovered: false
  }
];

interface DiscoveryLogState {
  logs: DiscoveryLog[];
  discoveredIds: string[];
  newLogId: string | null;

  checkDiscoveries: (bioMatter: number) => void;
  markAsViewed: (logId: string) => void;
  initializeLogs: (savedLogIds?: string[]) => void;
}

export const useDiscoveryLogs = create<DiscoveryLogState>()(
  subscribeWithSelector((set, get) => ({
    logs: discoveryLogs,
    discoveredIds: [],
    newLogId: null,

    initializeLogs: (savedLogIds) => {
      if (savedLogIds && savedLogIds.length > 0) {
        set({
          discoveredIds: savedLogIds,
          logs: discoveryLogs.map(log => ({
            ...log,
            discovered: savedLogIds.includes(log.id)
          }))
        });
      }
    },

    checkDiscoveries: (bioMatter) => {
      const { logs, discoveredIds } = get();
      
      for (const log of logs) {
        if (!log.discovered && bioMatter >= log.bioMatterThreshold) {
          set({
            logs: logs.map(l => 
              l.id === log.id ? { ...l, discovered: true } : l
            ),
            discoveredIds: [...discoveredIds, log.id],
            newLogId: log.id
          });
          
          break; // Only discover one log at a time
        }
      }
    },

    markAsViewed: (logId) => {
      set({ newLogId: null });
    }
  }))
);
