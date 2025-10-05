import React, { useEffect, useState } from 'react';
import { useDiscoveryLogs, DiscoveryLog } from '../../lib/stores/useDiscoveryLogs';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, X } from 'lucide-react';

export const DiscoveryLogModal: React.FC = () => {
  const { logs, newLogId, markAsViewed } = useDiscoveryLogs();
  const [currentLog, setCurrentLog] = useState<DiscoveryLog | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newLogId) {
      const log = logs.find(l => l.id === newLogId);
      if (log) {
        setCurrentLog(log);
        setIsVisible(true);
      }
    }
  }, [newLogId, logs]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentLog) {
        markAsViewed(currentLog.id);
        setCurrentLog(null);
      }
    }, 300);
  };

  if (!currentLog || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300">
      <Card className="bg-gradient-to-br from-gray-900 to-green-950 border-green-500/40 text-white p-8 max-w-lg mx-4 relative shadow-2xl">
        {/* Close button */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-green-500/30">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <FileText className="text-green-400" size={24} />
          </div>
          <div>
            <div className="text-xs text-green-400 uppercase tracking-wide">Discovery Log</div>
            <h2 className="text-2xl font-bold text-green-300">{currentLog.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
            <p className="text-gray-200 leading-relaxed italic">
              "{currentLog.content}"
            </p>
          </div>

          {/* GENESIS attribution */}
          <div className="text-right">
            <div className="text-sm text-green-400">— GENESIS</div>
          </div>

          {/* Action button */}
          <Button
            onClick={handleClose}
            className="w-full bg-green-600 hover:bg-green-700 mt-6"
          >
            Continue
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
      </Card>
    </div>
  );
};
