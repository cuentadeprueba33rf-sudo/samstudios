import React, { useState } from 'react';
import { Send, X, MessageSquarePlus, Film, Tv } from 'lucide-react';

interface RequestModalProps {
  onClose: () => void;
  adminEmail?: string;
}

export const RequestModal: React.FC<RequestModalProps> = ({ onClose, adminEmail = "tu-email@ejemplo.com" }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Película');
  const [note, setNote] = useState('');

  const handleSend = () => {
    if (!title) return;

    const subject = `Nueva Solicitud: ${title}`;
    const body = `Hola Admin,\n\nMe gustaría solicitar el siguiente contenido para SamStudios:\n\nTitulo: ${title}\nTipo: ${type}\nNota adicional: ${note}\n\n¡Gracias!`;
    
    // Create mailto link
    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Close modal after a short delay
    setTimeout(() => {
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1a1c22] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 to-[#1a1c22] p-6 border-b border-white/5 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquarePlus className="h-6 w-6 text-brand-500" />
                    Solicitar Contenido
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    ¿No encuentras lo que buscas? Pídelo aquí.
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
            </button>
        </div>

        <div className="p-6 space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Título de la Película / Serie</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-600 transition-all"
                    placeholder="Ej: Breaking Bad"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Tipo de Contenido</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setType('Película')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${type === 'Película' ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-[#0f1014] text-gray-400 border-white/10 hover:border-white/30'}`}
                    >
                        <Film className="h-4 w-4" /> Película
                    </button>
                    <button 
                        onClick={() => setType('Serie')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${type === 'Serie' ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-[#0f1014] text-gray-400 border-white/10 hover:border-white/30'}`}
                    >
                        <Tv className="h-4 w-4" /> Serie
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Nota Adicional (Opcional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none placeholder-gray-600 transition-all"
                    placeholder="Año, Temporada específica, idioma..."
                />
            </div>

            <button 
                onClick={handleSend}
                disabled={!title}
                className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-2
                    ${title ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                `}
            >
                <Send className="h-4 w-4" />
                Enviar Solicitud
            </button>
            
            <p className="text-[10px] text-center text-gray-500">
                Se abrirá tu aplicación de correo predeterminada.
            </p>
        </div>
      </div>
    </div>
  );
};