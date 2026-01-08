import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Crown, Sparkles, Pencil, Plus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Actor } from '../types';
import { AddActorModal } from './AddActorModal';

interface TopActorsRowProps {
    isAdmin: boolean;
}

export const TopActorsRow: React.FC<TopActorsRowProps> = ({ isAdmin }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const fetchActors = async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .order('created_at', { ascending: true }); // Simple ordering by creation for now
      
      if (!error && data) {
          setActors(data as Actor[]);
      }
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const slide = (offset: number) => {
    if (rowRef.current) {
      rowRef.current.scrollLeft += offset;
    }
  };

  const handleEditClick = (actor: Actor) => {
      if (!isAdmin) return;
      setSelectedActor(actor);
      setIsModalOpen(true);
  };

  const handleAddClick = () => {
      setSelectedActor(null);
      setIsModalOpen(true);
  };

  const handleSave = () => {
      fetchActors(); // Reload data
  };

  if (actors.length === 0 && !isAdmin) return null; // Don't show empty row to users

  return (
    <>
    <div className="relative py-12 bg-gradient-to-b from-[#0f1014] to-[#050505] border-y border-yellow-900/20">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10 flex items-end justify-between">
         <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                <span className="text-xs font-bold text-yellow-500 tracking-[0.2em] uppercase">Hall of Fame</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-600 uppercase italic tracking-tighter drop-shadow-sm flex items-center gap-4">
                Top Estrellas
                {isAdmin && (
                    <button 
                        onClick={handleAddClick}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
                        title="Agregar Actor"
                    >
                        <Plus className="h-5 w-5 text-white" />
                    </button>
                )}
            </h2>
         </div>
         
         {/* Navigation Arrows */}
         <div className="flex gap-2">
            <button onClick={() => slide(-300)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-300" />
            </button>
            <button onClick={() => slide(300)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-300" />
            </button>
         </div>
      </div>

      <div 
        ref={rowRef}
        className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 pb-8 scroll-smooth hide-scrollbar items-end"
      >
        {actors.length === 0 && isAdmin && (
            <div 
                onClick={handleAddClick}
                className="w-[200px] h-[300px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all"
            >
                <Plus className="h-10 w-10 text-gray-500 mb-2" />
                <span className="text-gray-500 text-sm font-bold">Agregar Actor</span>
            </div>
        )}

        {actors.map((actor, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;

            return (
                <div 
                    key={actor.id} 
                    className={`relative group flex-shrink-0 transition-all duration-500
                        ${isFirst ? 'w-[280px] md:w-[320px]' : 'w-[160px] md:w-[200px]'}
                        ${isAdmin ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => handleEditClick(actor)}
                >
                    {/* Card Container */}
                    <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2
                        ${isFirst ? 'h-[400px] md:h-[480px] border-2 border-yellow-500/50 shadow-yellow-900/40' : 'h-[240px] md:h-[300px] border border-white/10 hover:border-white/30'}
                    `}>
                        
                        {/* Image */}
                        <img 
                            src={actor.image} 
                            alt={actor.name} 
                            className={`w-full h-full object-cover transition-transform duration-700 
                                ${isFirst ? 'group-hover:scale-110 saturate-100' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}
                            `}
                        />
                        
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                        
                        {/* ADMIN EDIT OVERLAY */}
                        {isAdmin && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 z-30">
                                <Pencil className="h-10 w-10 text-white drop-shadow-lg" />
                            </div>
                        )}

                        {/* Rank Badge */}
                        <div className={`absolute top-0 left-0 px-4 py-2 rounded-br-2xl font-black text-xl z-20 shadow-lg
                             ${isFirst ? 'bg-yellow-500 text-black' : 'bg-gray-800/80 text-white backdrop-blur-md'}
                        `}>
                            #{rank}
                        </div>

                        {/* Special Crown for #1 */}
                        {isFirst && (
                             <div className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-full border border-yellow-500/30 animate-bounce">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                             </div>
                        )}

                        {/* Info Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
                            {actor.award && isFirst && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-md mb-2 backdrop-blur-md animate-pulse">
                                    <Trophy className="h-3 w-3 text-yellow-400" />
                                    <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-wider">{actor.award}</span>
                                </div>
                            )}

                            <h3 className={`font-black text-white leading-none uppercase tracking-tight
                                ${isFirst ? 'text-3xl mb-1' : 'text-xl mb-1'}
                            `}>
                                {actor.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className={`h-0.5 bg-brand-500 rounded-full ${isFirst ? 'w-8' : 'w-4'}`} />
                                <p className="text-xs md:text-sm font-medium truncate">{actor.character}</p>
                            </div>
                            
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-wider">
                                {actor.movie}
                            </p>
                        </div>
                    </div>

                    {/* Reflection / Shadow Effect for #1 */}
                    {isFirst && (
                         <div className="absolute -bottom-4 left-4 right-4 h-4 bg-yellow-500/20 blur-xl rounded-full" />
                    )}
                </div>
            );
        })}
      </div>
    </div>

    {isModalOpen && (
        <AddActorModal 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            actorToEdit={selectedActor}
        />
    )}
    </>
  );
};