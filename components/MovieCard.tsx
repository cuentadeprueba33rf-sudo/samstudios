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
      <div className="relative aspect-[2/3] w-full rounded-sm md:rounded-md overflow-hidden bg-gray-900 transition-all duration-300 ease-out group-hover:scale-105 group-hover:z-10 group-hover:shadow-lg ring-0 group-hover:ring-1 group-hover:ring-white/30">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        
        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                 <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-white rounded-full p-0.5 md:p-1 shadow-sm">
                        <Play className="h-1.5 w-1.5 md:h-3 md:w-3 text-black fill-black" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-green-400">{movie.rating.toFixed(1)}</span>
                 </div>
                 <h3 className="text-white font-bold text-[8px] md:text-xs leading-tight drop-shadow-md line-clamp-2 hidden md:block">{movie.title}</h3>
                 <p className="text-gray-300 text-[8px] md:text-[9px] mt-0.5 line-clamp-1 hidden md:block">{movie.genre.slice(0, 1).join(' • ')}</p>
            </div>
        </div>
      </div>

      {/* Rank Number Overlay - Adjusted for small cards */}
      {rank && (
        <div className="absolute -left-2 -bottom-2 md:-left-6 md:-bottom-4 z-20 h-[50px] w-[30px] md:h-[140px] md:w-[100px] flex items-end justify-end pointer-events-none select-none">
           <svg width="100%" height="100%" viewBox="0 0 70 100" className="overflow-visible drop-shadow-lg">
             <text 
               x="50" 
               y="95" 
               textAnchor="end"
               fontSize="120" 
               fontWeight="900" 
               fill="#000000" 
               stroke="#4b5563" 
               strokeWidth="2"
               style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-5px' }}
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
               stroke="#ffffff" 
               strokeWidth="1.5"
               style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-5px' }}
             >
               {rank}
             </text>
           </svg>
        </div>
      )}
    </div>
  );
};