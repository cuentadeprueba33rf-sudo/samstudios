import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Plus, ThumbsUp, Check, Star, Users, Pencil, FileText, X, ExternalLink, Maximize2, Volume2, Pause, SkipForward, SkipBack, AlertCircle, RefreshCw } from 'lucide-react';
import { Movie } from '../types';

interface PlayerProps {
  movie: Movie;
  allMovies: Movie[];
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
  isLiked: boolean;
  isInMyList: boolean;
  onToggleLike: () => void;
  onToggleMyList: () => void;
  isAdmin?: boolean;
  onEdit?: (movie: Movie) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  movie, 
  onBack, 
  isLiked, 
  isInMyList, 
  onToggleLike, 
  onToggleMyList,
  isAdmin,
  onEdit
}) => {
  const handlePlayClick = () => {
    if (movie.streamUrl) {
      window.open(movie.streamUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-20 font-sans">
      
      {/* Botón Volver */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none flex justify-between items-start">
          <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center justify-center glass-panel hover:bg-white/20 text-white transition-all rounded-full p-3 group"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {isAdmin && onEdit && (
              <button 
                onClick={() => onEdit(movie)}
                className="pointer-events-auto flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-all rounded-full p-3 shadow-lg"
              >
                <Pencil className="h-5 w-5 fill-black" />
              </button>
          )}
      </div>

      {/* Hero Content */}
      <div className="relative w-full min-h-[70vh] md:h-[85vh] bg-black group flex flex-col justify-end md:justify-center">
        <div className="absolute inset-0 z-0">
            <img src={movie.posterUrl} alt="Background" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-32 pb-12 md:py-0">
                <div className="max-w-3xl animate-fade-in flex flex-col gap-6">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-none uppercase font-display">
                        {movie.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-300 uppercase tracking-widest">
                        <div className="flex items-center gap-1 text-white">
                            <Star className="h-4 w-4 fill-white" />
                            <span>{movie.rating}</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <span>{movie.year}</span>
                        <span className="text-gray-600">•</span>
                        <span className="px-2 py-0.5 border border-white/20 rounded text-[10px] bg-white text-black font-black tracking-widest uppercase">HD</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-300">{movie.genre.join(', ')}</span>
                    </div>

                    <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        {movie.description || "Sin descripción disponible."}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={handlePlayClick}
                            className="flex items-center justify-center px-10 py-4 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition-all shadow-xl uppercase tracking-wider group"
                        >
                            <Play className="h-5 w-5 mr-3 fill-current group-hover:scale-110 transition-transform" />
                            Ver Ahora
                        </button>
                        
                        <div className="flex gap-3">
                            <button onClick={onToggleMyList} className={`flex items-center justify-center px-6 py-4 rounded-full transition-all border ${isInMyList ? 'bg-white text-black border-white' : 'glass-panel hover:bg-white/20 text-white border-transparent'}`}>
                                {isInMyList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </button>
                            <button onClick={onToggleLike} className={`flex items-center justify-center px-6 py-4 rounded-full transition-all border ${isLiked ? 'bg-white text-black border-white' : 'glass-panel hover:bg-white/20 text-white border-transparent'}`}>
                                <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-black' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
        </div>
      </div>
      
      {/* Details Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 relative z-10 border-t border-white/5">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="col-span-2">
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2 font-display">
                    <Users className="h-5 w-5 text-white" /> Reparto Principal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {movie.director && (
                        <div className="glass-panel p-5 rounded-2xl">
                            <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Director</span>
                            <span className="text-white font-bold text-lg font-display">{movie.director}</span>
                        </div>
                    )}
                    {movie.actors && movie.actors.length > 0 && (
                        <div className="glass-panel p-5 rounded-2xl sm:col-span-2">
                            <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Elenco</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {movie.actors.map((actor, idx) => (
                                    <span key={idx} className="px-4 py-1.5 rounded-full bg-white/5 text-xs text-gray-200 border border-white/10 font-medium hover:bg-white/10 transition-colors">{actor}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl h-fit">
                 <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 font-display">Ficha Técnica</h4>
                 <div className="space-y-5 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Géneros</span>
                        <span className="text-white font-medium text-right">{movie.genre.join(', ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Año</span>
                        <span className="text-white">{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Formato</span>
                        <span className="text-white font-black tracking-widest">4K HDR</span>
                    </div>
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};