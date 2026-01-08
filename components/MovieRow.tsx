import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  rank?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onMovieClick, rank }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const slide = (offset: number) => {
    if (rowRef.current) {
      rowRef.current.scrollLeft += offset;
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-4 md:mb-10 relative group/row">
      <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white mb-2 md:mb-4 px-4 sm:px-6 lg:px-8 flex items-end gap-2 md:gap-3">
         {title}
         <span className="text-[10px] sm:text-xs font-semibold text-brand-500 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer mb-0.5 md:mb-1 flex items-center hover:text-white">
            Ver todo <ChevronRight className="h-3 w-3 ml-0.5" />
         </span>
      </h2>
      
      <div className="relative group">
        {/* Left Gradient/Button */}
        <div 
            className="absolute top-0 bottom-0 left-0 z-40 w-8 md:w-12 bg-gradient-to-r from-[#0f1014]/80 to-transparent hidden md:block pointer-events-none"
        />
        <ChevronLeft 
            className="absolute top-0 bottom-0 left-2 z-50 m-auto h-8 w-8 md:h-12 md:w-12 cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-white drop-shadow-lg hidden md:block bg-black/50 rounded-full p-1.5 md:p-2 hover:bg-black/70" 
            onClick={() => slide(-800)}
        />
        
        {/* Scroll Container */}
        <div 
            ref={rowRef}
            className="flex flex-nowrap gap-2 sm:gap-3 md:gap-4 overflow-x-scroll scroll-smooth hide-scrollbar px-4 sm:px-6 lg:px-8 pb-4 pt-2"
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className={`flex-none ${
                rank 
                    ? 'min-w-[110px] w-[110px] md:min-w-[200px] md:w-[200px]' // Ranked sizes
                    : 'min-w-[100px] w-[100px] md:min-w-[180px] md:w-[180px]' // Standard sizes
            }`}>
              <MovieCard 
                movie={movie} 
                onClick={onMovieClick} 
                rank={rank ? index + 1 : undefined} 
              />
            </div>
          ))}
        </div>

        {/* Right Gradient/Button */}
        <ChevronRight 
            className="absolute top-0 bottom-0 right-2 z-50 m-auto h-8 w-8 md:h-12 md:w-12 cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-white drop-shadow-lg hidden md:block bg-black/50 rounded-full p-1.5 md:p-2 hover:bg-black/70" 
            onClick={() => slide(800)}
        />
         <div 
            className="absolute top-0 bottom-0 right-0 z-40 w-8 md:w-12 bg-gradient-to-l from-[#0f1014]/80 to-transparent hidden md:block pointer-events-none"
        />
      </div>
    </div>
  );
};