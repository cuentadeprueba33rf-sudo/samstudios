import React, { useState, useEffect } from 'react';
import { Wrench, X } from 'lucide-react';

export const ConstructionNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (isClosed) return;
    
    // Show notification 10 seconds after mounting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  if (!isVisible || isClosed) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 animate-fade-in-up max-w-sm w-full">
      <div className="glass-panel shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl p-4 flex items-start gap-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-white"></div>
        
        <div className="bg-white/10 p-2 rounded-full text-white shrink-0">
          <Wrench className="h-5 w-5" />
        </div>
        
        <div className="flex-1 pt-0.5">
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Catálogo en Construcción</h4>
          <p className="text-gray-300 text-xs leading-relaxed">
            Estamos agregando nuevas películas y series constantemente. ¡Vuelve pronto para descubrir más contenido!
          </p>
        </div>
        
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
