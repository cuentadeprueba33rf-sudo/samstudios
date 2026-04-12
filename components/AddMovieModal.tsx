import React, { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon, Image as ImageIcon, Trophy, Save, Trash2, AlertTriangle, FileText, Calendar, Star, Clapperboard, MonitorPlay, Zap } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Movie } from '../types';

interface AddMovieModalProps {
  onClose: () => void;
  onAdd: (movie: Movie) => void;
  onDelete?: (movieId: string) => Promise<void>;
  movieToEdit?: Movie | null;
}

export const AddMovieModal: React.FC<AddMovieModalProps> = ({ onClose, onAdd, onDelete, movieToEdit }) => {
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [trendingRank, setTrendingRank] = useState<string>('');
  const [isDirectLink, setIsDirectLink] = useState(false);
  
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');

  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (movieToEdit) {
        setTitle(movieToEdit.title);
        setStreamUrl(movieToEdit.streamUrl);
        setPosterUrl(movieToEdit.posterUrl);
        setTrendingRank(movieToEdit.trendingRank ? movieToEdit.trendingRank.toString() : '');
        setIsDirectLink(!!movieToEdit.isDirectLink);
        setDescription(movieToEdit.description);
        setSnippet(movieToEdit.snippet || '');
        setYear(movieToEdit.year);
        setGenre(movieToEdit.genre.join(', '));
        setRating(movieToEdit.rating.toString());
    }
  }, [movieToEdit]);

  // Función para optimizar links de TeraBox
  const resolveLink = () => {
    if (!streamUrl) return;
    setResolving(true);
    setStatus("Analizando origen de datos...");
    
    // Regex para capturar el ID de cualquier variante de TeraBox
    const teraBoxRegex = /(?:terabox\.com|1024terabox\.com|teraboxapp\.com|terabox\.app)\/s\/([a-zA-Z0-9_-]+)/;
    const match = streamUrl.match(teraBoxRegex);
    
    setTimeout(() => {
        if (match && match[1]) {
            const id = match[1];
            // Usamos un formato de Embed estable. TeraBox no permite MP4 directo sin API de pago.
            // Por lo tanto, lo configuramos como Embed (isDirectLink = false)
            const resolved = `https://www.terabox.app/sharing/embed?surl=${id}`;
            setStreamUrl(resolved);
            setIsDirectLink(false); // IMPORTANTE: Debe ser false para que cargue en Iframe
            setStatus("Link optimizado para Modo Embed (Sin Bloqueos)");
        } else {
            // Si es un archivo real .mp4
            if (streamUrl.toLowerCase().match(/\.(mp4|mkv|webm|m3u8)$/)) {
                setIsDirectLink(true);
                setStatus("Archivo de Video Directo Detectado");
            } else {
                setStatus("Link procesado como página externa.");
            }
        }
        setResolving(false);
    }, 1000);
  };

  const handleSave = async () => {
    if (!title) {
        setError("Por favor escribe el título.");
        return;
    }
    setLoading(true);
    setError('');
    
    try {
      let finalDescription = description;
      let finalYear = year;
      let finalGenre: string[] = genre.split(',').map(g => g.trim()).filter(g => g);
      let finalRating = parseFloat(rating) || 0;

      const finalStreamUrl = streamUrl || (movieToEdit ? movieToEdit.streamUrl : '');
      const finalPosterUrl = posterUrl || (movieToEdit ? movieToEdit.posterUrl : `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`);
      const finalRank = trendingRank ? parseInt(trendingRank) : null;
      const finalId = movieToEdit ? movieToEdit.id : crypto.randomUUID();

      const movieToSave: Movie = {
        id: finalId,
        title: title,
        streamUrl: finalStreamUrl,
        posterUrl: finalPosterUrl,
        description: finalDescription || 'Sin descripción.',
        snippet: snippet || '',
        year: finalYear,
        genre: finalGenre.length > 0 ? finalGenre : ['General'],
        rating: finalRating,
        imdbId: movieToEdit ? movieToEdit.imdbId : '',
        trendingRank: finalRank || null,
        isDirectLink: isDirectLink,
        director: movieToEdit ? movieToEdit.director : undefined,
        actors: movieToEdit ? movieToEdit.actors : undefined
      };

      // Remove undefined fields so Firestore doesn't complain
      if (movieToSave.director === undefined) delete movieToSave.director;
      if (movieToSave.actors === undefined) delete movieToSave.actors;
      if (movieToSave.imdbId === undefined || movieToSave.imdbId === '') delete movieToSave.imdbId;
      if (movieToSave.snippet === '') delete movieToSave.snippet;

      setStatus('Escribiendo en Firebase...');

      const movieRef = doc(db, 'movies', movieToSave.id);
      await setDoc(movieRef, { ...movieToSave, created_at: new Date().toISOString() }, { merge: true });

      onAdd(movieToSave);
      onClose();
    } catch (e: any) {
      setError(e.message || "Error al guardar.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleDelete = async () => {
      if (!movieToEdit || !onDelete) return;
      setDeleteLoading(true);
      try {
          await onDelete(movieToEdit.id);
          onClose();
      } catch (e: any) {
          setError("Error al borrar: " + e.message);
          setDeleteLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-surface rounded-3xl w-full max-w-lg border border-outline/10 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-fade-in">
        
        <div className="h-1 w-full bg-surface-variant shrink-0">
            <div className={`h-full bg-primary transition-all duration-700 ${title ? 'w-1/2' : 'w-4'} ${streamUrl ? 'w-full' : ''}`} />
        </div>

        <div className="p-6 border-b border-outline/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-headline font-black text-on-surface flex items-center gap-2 uppercase italic">
            {movieToEdit ? 'Editar Contenido' : 'Añadir a la Red'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant hover:text-on-surface">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
          <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Nombre del Contenido</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-4 text-on-surface focus:border-primary outline-none transition-all font-headline font-bold text-lg"
                  placeholder="Ej: El Juego del Calamar 2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Enlace (TeraBox / URL)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-4 top-4 h-5 w-5 text-on-surface-variant" />
                      <input
                        type="text"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl pl-12 pr-4 py-4 text-on-surface focus:border-primary outline-none transition-all text-xs font-mono"
                        placeholder="Pega aquí el link..."
                      />
                    </div>
                    {streamUrl && (
                      <button 
                        onClick={resolveLink}
                        disabled={resolving}
                        className="bg-primary hover:bg-primary/80 text-on-primary px-5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {resolving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                      </button>
                    )}
                </div>
              </div>

              {/* MODO REPRODUCTOR */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${isDirectLink ? 'bg-primary/10 border-primary/30' : 'bg-surface-variant/50 border-outline/10'}`}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isDirectLink ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-variant text-on-surface-variant'}`}>
                        <MonitorPlay className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="block text-xs font-headline font-black text-on-surface uppercase italic">Modo AETHER Player</span>
                        <span className="block text-[10px] text-on-surface-variant font-label font-bold uppercase">{isDirectLink ? 'Video Nativo (MP4/M3U8)' : 'Reproductor Externo (Embed)'}</span>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsDirectLink(!isDirectLink)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors ${isDirectLink ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform ${isDirectLink ? 'translate-x-7' : ''}`} />
                  </button>
              </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline/10 animate-fade-in">
              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">URL del Póster</label>
                <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors"
                    placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Sinopsis (Descripción Completa)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm outline-none min-h-[100px] focus:border-primary transition-colors"
                    placeholder="Escribe la sinopsis detallada aquí..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Fragmento / Resumen Corto (Opcional)</label>
                <textarea
                    value={snippet}
                    onChange={(e) => setSnippet(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm outline-none min-h-[60px] focus:border-primary transition-colors"
                    placeholder="Un breve resumen de 1 o 2 líneas..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Géneros</label>
                <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Acción, Comedia, Drama..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Año</label>
                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors" placeholder="Ej: 2024" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Calificación</label>
                    <input type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors" placeholder="Ej: 8.5" />
                  </div>
              </div>

              <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Posición en el Ranking (Top 10)</label>
                <input
                    type="number"
                    value={trendingRank}
                    onChange={(e) => setTrendingRank(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Ej: 1 (Opcional)"
                />
              </div>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/30 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error shrink-0" />
                <p className="text-error text-[10px] font-bold uppercase leading-tight">{error}</p>
            </div>
          )}
          
          {status && <p className="text-primary text-[10px] font-black animate-pulse text-center uppercase tracking-widest">{status}</p>}

          <div className="flex gap-3 pt-4 shrink-0 pb-2">
            <button
                onClick={handleSave}
                disabled={!title || !streamUrl || loading || deleteLoading}
                className="flex-1 py-5 rounded-2xl font-headline font-black text-on-primary shadow-xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 uppercase tracking-widest italic text-sm"
            >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (movieToEdit ? 'Guardar Cambios' : 'Publicar Ahora')}
            </button>
            
            {movieToEdit && (
                <button
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className={`px-6 rounded-2xl font-bold transition-all border ${showDeleteConfirm ? 'bg-error border-error text-on-error animate-pulse' : 'bg-surface-variant/50 text-error border-error/20'}`}
                >
                    <Trash2 className="h-6 w-6" />
                </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};