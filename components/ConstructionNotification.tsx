import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';

interface ConstructionNotificationProps {
  onRequestClick: () => void;
}

export const ConstructionNotification: React.FC<ConstructionNotificationProps> = ({ onRequestClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (isClosed) return;
    
    // Show notification 3 seconds after mounting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  if (!isVisible || isClosed) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-auto max-w-[90vw]">
      <div className="bg-[#141414]/90 backdrop-blur-md shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-3 border border-white/10">
        
        <div className="bg-brand-500/20 p-1.5 rounded-full text-brand-400 shrink-0">
          <MessageSquarePlus className="h-4 w-4" />
        </div>
        
        <div className="flex-1 whitespace-nowrap">
          <p className="text-gray-200 text-xs sm:text-sm font-medium">
            ¿No encuentras tu película?
          </p>
        </div>
        
        <button 
          onClick={() => {
            onRequestClick();
            setIsClosed(true);
          }}
          className="bg-white text-black px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors shrink-0"
        >
          Solicitar
        </button>

        <div className="w-px h-4 bg-white/20 mx-1"></div>

        <button 
          onClick={() => setIsClosed(true)}
          className="text-gray-500 hover:text-white transition-colors shrink-0 p-1 rounded-full hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
