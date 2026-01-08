import React from 'react';
import { ShieldCheck, ServerOff, Globe, CheckCircle } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(229,9,20,0.15),_transparent_70%)] pointer-events-none" />
      
      {/* Container: Added max-height and flex-col to enable internal scrolling */}
      <div className="relative bg-[#0f1014] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden">
        {/* Header decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#E50914] to-transparent shrink-0" />
        
        {/* Scrollable Content Area */}
        <div className="p-5 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#E50914] tracking-tighter mb-2">SAMSTUDIOS</h1>
            <h2 className="text-lg md:text-xl font-semibold text-white">Política de Transparencia</h2>
            <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-md">
              Antes de continuar, queremos asegurarnos de que entiendas cómo funciona nuestra plataforma.
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            
            {/* Point 1: No Hosting */}
            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="bg-gray-800 p-2 md:p-2.5 rounded-lg shrink-0">
                <ServerOff className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm md:text-base">Sin Servidores Propios</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1 leading-relaxed">
                  SamStudios no aloja, sube ni almacena ningún archivo de video en sus servidores. Somos un índice de búsqueda inteligente.
                </p>
              </div>
            </div>

            {/* Point 2: External Links */}
            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="bg-gray-800 p-2 md:p-2.5 rounded-lg shrink-0">
                <Globe className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm md:text-base">Enlaces Externos</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1 leading-relaxed">
                  Todo el contenido proviene de servidores públicos de terceros. Nosotros facilitamos el acceso organizando estos enlaces.
                </p>
              </div>
            </div>

            {/* Point 3: Safety */}
            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="bg-gray-800 p-2 md:p-2.5 rounded-lg shrink-0">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm md:text-base">Tu Seguridad es Primero</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1 leading-relaxed">
                  Nuestro objetivo es evitar que navegues por sitios inseguros llenos de spam o virus. Filtramos lo mejor para ti.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 md:mt-10 flex flex-col items-center gap-4 pb-2">
            <button 
              onClick={onAccept}
              className="group relative w-full md:w-auto px-10 py-3.5 bg-[#E50914] hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Entendido, Continuar</span>
              <CheckCircle className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <p className="text-[10px] text-gray-600 text-center">
              Al hacer clic en continuar, aceptas nuestros términos de uso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};