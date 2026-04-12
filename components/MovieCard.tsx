import React from 'react';
import { Play } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  rank?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, rank }) => {
  return (
    <div 
      className={`group relative cursor-pointer ${rank ? 'ml-4 sm:ml-8' : ''}`}
      onClick={() => onClick(movie)}
    >
      {/* Image Container - Aspect ratio locked */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-surface-variant transition-all duration-500 ease-out group-hover:scale-105 group-hover:z-10 group-hover:shadow-[0_0_40px_rgba(182,160,255,0.2)] ring-0 group-hover:ring-1 group-hover:ring-primary/30">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        
        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-4">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary rounded-full p-1 shadow-lg">
                        <Play className="h-2 w-2 md:h-3 md:w-3 text-on-primary fill-on-primary" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-secondary">{movie.rating.toFixed(1)}</span>
                 </div>
                 <h3 className="text-on-surface font-headline font-bold text-[10px] md:text-sm leading-tight drop-shadow-md line-clamp-2 hidden md:block">{movie.title}</h3>
                 <p className="text-on-surface-variant text-[9px] md:text-[10px] mt-1 line-clamp-1 hidden md:block font-label uppercase tracking-wider">{movie.genre.slice(0, 1).join(' • ')}</p>
            </div>
        </div>
      </div>

      {/* Rank Number Overlay - Adjusted for small cards */}
      {rank && (
        <div className="absolute -left-4 -bottom-2 md:-left-8 md:-bottom-4 z-20 h-[60px] w-[40px] md:h-[140px] md:w-[100px] flex items-end justify-end pointer-events-none select-none">
           <svg width="100%" height="100%" viewBox="0 0 70 100" className="overflow-visible drop-shadow-2xl">
             <text 
               x="50" 
               y="95" 
               textAnchor="end"
               fontSize="120" 
               fontWeight="900" 
               fill="#0e0e0e" 
               stroke="#262626" 
               strokeWidth="3"
               style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-5px' }}
             >
               {rank}
             </text>
             <text 
               x="50" 
               y="95" 
               textAnchor="end"
               fontSize="120" 
               fontWeight="900" 
               fill="none" 
               stroke="#b6a0ff" 
               strokeWidth="1.5"
               style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-5px' }}
             >
               {rank}
             </text>
           </svg>
        </div>
      )}
    </div>
  );
};