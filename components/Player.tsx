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
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number>(null);

  // Determinar si es un link directo real (.mp4, .m3u8, etc)
  const isVideoFile = movie.isDirectLink || 
                     movie.streamUrl?.toLowerCase().endsWith('.mp4') || 
                     movie.streamUrl?.toLowerCase().endsWith('.mkv') ||
                     movie.streamUrl?.toLowerCase().endsWith('.m3u8');

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    setIsCinemaMode(false);

    // Timeout de seguridad: Si en 12 segundos no hay respuesta, mostrar error
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setLoadError(true);
      }
    }, 12000);

    return () => clearTimeout(timer);
  }, [movie.id]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const handlePlayClick = () => {
    if (movie.streamUrl) {
      setIsCinemaMode(true);
    }
  };

  const openInNewTab = () => {
    window.open(movie.streamUrl, '_blank', 'noopener,noreferrer');
  };

  const retryLoad = () => {
      setIsLoading(true);
      setLoadError(false);
      // Forzar recarga del frame/video
      const currentUrl = movie.streamUrl;
      // Pequeño hack para forzar refresh
      movie.streamUrl = '';
      setTimeout(() => {
          movie.streamUrl = currentUrl;
      }, 100);
  };

  if (isCinemaMode) {
    return (
      <div 
        className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Barra superior */}
        <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsCinemaMode(false)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"><ArrowLeft className="h-6 w-6" /></button>
              <h2 className="text-white font-black text-lg md:text-2xl tracking-tighter uppercase italic truncate max-w-[50vw]">{movie.title}</h2>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={openInNewTab} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-brand-500 rounded-full text-xs font-black text-white transition-all border border-white/10 uppercase tracking-widest"><ExternalLink className="h-4 w-4" /> Abrir Link</button>
              <button onClick={() => setIsCinemaMode(false)} className="p-3 bg-red-600/20 hover:bg-red-600 rounded-full text-white transition-all"><X className="h-6 w-6" /></button>
           </div>
        </div>

        {/* Área del Player */}
        <div className="flex-1 w-full h-full relative bg-[#020202] flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-black">
                    <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
                    <p className="text-white font-black tracking-widest uppercase text-xs animate-pulse">Conectando con Servidor Externo...</p>
                </div>
            )}

            {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-black/90 animate-fade-in">
                    <AlertCircle className="h-16 w-16 text-brand-500 mb-4" />
                    <h3 className="text-2xl font-black text-white uppercase italic mb-2">Error de Sincronización</h3>
                    <p className="text-gray-400 text-sm max-w-md mb-8">
                        El servidor externo está tardando demasiado o el enlace no es compatible con el reproductor nativo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={retryLoad} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl uppercase text-xs hover:bg-gray-200 transition-all">
                            <RefreshCw className="h-4 w-4" /> Reintentar
                        </button>
                        <button onClick={openInNewTab} className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-black rounded-xl uppercase text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-900/40">
                            <ExternalLink className="h-4 w-4" /> Abrir en TeraBox
                        </button>
                    </div>
                </div>
            )}
            
            {isVideoFile ? (
                /* PLAYER NATIVO (PARA MP4 REAL) */
                <video 
                    ref={videoRef}
                    src={movie.streamUrl}
                    className="w-full h-full max-h-screen"
                    autoPlay
                    controls={showControls}
                    onLoadStart={() => setIsLoading(true)}
                    onCanPlay={() => setIsLoading(false)}
                    onError={() => { setIsLoading(false); setLoadError(true); }}
                />
            ) : (
                /* IFRAME (PARA TERABOX / EMBEDS) */
                <iframe 
                    key={movie.streamUrl}
                    src={movie.streamUrl}
                    className="w-full h-full border-none bg-black"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
                    title={movie.title}
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto pb-20 font-sans">
      
      {/* Botón Volver */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none flex justify-between items-start">
          <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center justify-center bg-black/40 backdrop-blur-xl hover:bg-white/10 text-white transition-all rounded-full p-3 group border border-white/5"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {isAdmin && onEdit && (
              <button 
                onClick={() => onEdit(movie)}
                className="pointer-events-auto flex items-center justify-center bg-brand-500 hover:bg-red-600 text-white transition-all rounded-full p-3 shadow-lg"
              >
                <Pencil className="h-5 w-5 fill-white" />
              </button>
          )}
      </div>

      {/* Hero Content */}
      <div className="relative w-full min-h-[70vh] md:h-[85vh] bg-black group flex flex-col justify-end md:justify-center">
        <div className="absolute inset-0 z-0">
            <img src={movie.posterUrl} alt="Background" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0a0a0a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-32 pb-12 md:py-0">
                <div className="max-w-3xl animate-fade-in flex flex-col gap-6">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl leading-[1] uppercase italic">
                        {movie.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-200">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            <span>{movie.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>{movie.year}</span>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 border border-white/20 rounded text-[10px] bg-brand-500 text-white font-black tracking-widest uppercase">HD</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{movie.genre.join(', ')}</span>
                    </div>

                    <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        {movie.description || "Sin descripción disponible."}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={handlePlayClick}
                            className="flex items-center justify-center px-10 py-4 bg-white text-black font-black text-lg rounded-lg hover:bg-brand-500 hover:text-white transition-all active:scale-95 shadow-xl uppercase italic tracking-tighter group"
                        >
                            <Play className="h-6 w-6 mr-3 fill-current group-hover:scale-110 transition-transform" />
                            Ver Ahora
                        </button>
                        
                        <div className="flex gap-3">
                            <button onClick={onToggleMyList} className={`flex items-center justify-center px-6 py-4 rounded-lg transition-all border ${isInMyList ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}>
                                {isInMyList ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            </button>
                            <button onClick={onToggleLike} className={`flex items-center justify-center px-6 py-4 rounded-lg transition-all border ${isLiked ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}>
                                <ThumbsUp className={`h-6 w-6 ${isLiked ? 'fill-blue-400' : ''}`} />
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
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-500" /> Reparto Principal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {movie.director && (
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Director</span>
                            <span className="text-white font-bold text-lg italic">{movie.director}</span>
                        </div>
                    )}
                    {movie.actors && movie.actors.length > 0 && (
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 sm:col-span-2">
                            <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Elenco</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {movie.actors.map((actor, idx) => (
                                    <span key={idx} className="px-4 py-1.5 rounded-full bg-white/10 text-xs text-gray-200 border border-white/5 font-medium">{actor}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/5 h-fit">
                 <h4 className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-4">Ficha Técnica</h4>
                 <div className="space-y-5 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500 uppercase text-[10px] font-bold">Géneros</span>
                        <span className="text-white font-medium">{movie.genre.join(', ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500 uppercase text-[10px] font-bold">Año</span>
                        <span className="text-white">{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-[10px] font-bold">Formato</span>
                        <span className="text-green-400 font-black">ULTRA HD 4K</span>
                    </div>
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};