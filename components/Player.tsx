import React, { useMemo } from 'react';
import { ArrowLeft, Play, Plus, ThumbsUp, Check, Star, Users, Clapperboard, Pencil } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

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
  allMovies, 
  onBack, 
  onMovieClick,
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

  // Logic for "More like this"
  const recommendations = useMemo(() => {
    return allMovies.filter(m => 
        m.id !== movie.id && // Exclude current movie
        m.genre.some(g => movie.genre.includes(g)) // Must share at least one genre
    ).slice(0, 10); // Limit to 10
  }, [movie, allMovies]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto pb-20 font-sans">
      
      {/* Back Button Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none flex justify-between items-start">
          <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center justify-center bg-black/40 backdrop-blur-xl hover:bg-white/10 text-white transition-all rounded-full p-3 group border border-white/5"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* EDIT BUTTON FOR ADMINS */}
          {isAdmin && onEdit && (
              <button 
                onClick={() => onEdit(movie)}
                className="pointer-events-auto flex items-center justify-center bg-brand-500 hover:bg-red-600 text-white transition-all rounded-full p-3 shadow-lg animate-fade-in"
                title="Editar Película"
              >
                <Pencil className="h-5 w-5 fill-white" />
              </button>
          )}
      </div>

      {/* Hero Content / Player Area */}
      <div className="relative w-full h-[70vh] md:h-[85vh] bg-black group">
         
         {/* Background Image with Cinematic Grade */}
        <div className="absolute inset-0">
            <img 
                src={movie.posterUrl} 
                alt="Background" 
                className="w-full h-full object-cover object-top"
            />
            {/* Complex Gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0a0a0a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full mt-20">
                <div className="max-w-3xl animate-fade-in flex flex-col gap-6">
                    
                    {/* Title */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl leading-[1.1]">
                        {movie.title}
                    </h1>

                    {/* Meta Data Pill */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-200">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            <span>{movie.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>{movie.year}</span>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 border border-white/20 rounded text-xs bg-white/5 backdrop-blur-md">HD</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{movie.genre.join(', ')}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        {movie.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        <button 
                            onClick={handlePlayClick}
                            className="flex items-center justify-center px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <Play className="h-6 w-6 mr-3 fill-black" />
                            Ver Ahora
                        </button>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={onToggleMyList}
                                className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all active:scale-95 border ${isInMyList ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}
                            >
                                {isInMyList ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            </button>

                            <button 
                                onClick={onToggleLike}
                                className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all active:scale-95 border ${isLiked ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}
                            >
                                <ThumbsUp className={`h-6 w-6 ${isLiked ? 'fill-blue-400' : ''}`} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
      
      {/* Details Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 relative z-10">
         
         {/* Cast & Crew Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 border-t border-white/10 pt-10">
            <div className="col-span-2">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-500" /> Reparto y Equipo
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {movie.director && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Director</span>
                            <span className="text-white font-medium text-lg">{movie.director}</span>
                        </div>
                    )}
                    {movie.actors && movie.actors.length > 0 && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 sm:col-span-2">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Elenco Principal</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {movie.actors.map((actor, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-200 border border-white/5">
                                        {actor}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Info */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5 h-fit">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Detalles</h4>
                 <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500">Géneros</span>
                        <span className="text-white text-right">{movie.genre.join(', ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500">Año</span>
                        <span className="text-white">{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Calificación</span>
                        <span className="text-green-400 font-bold">{movie.rating}/10</span>
                    </div>
                 </div>
            </div>
         </div>

         {/* More Like This Section */}
         {recommendations.length > 0 && (
             <div className="animate-fade-in-up">
                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clapperboard className="h-6 w-6 text-brand-500" />
                    Más como esto
                 </h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {recommendations.map(recMovie => (
                        <MovieCard key={recMovie.id} movie={recMovie} onClick={onMovieClick} />
                    ))}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};