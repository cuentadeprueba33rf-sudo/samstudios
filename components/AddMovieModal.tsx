import React, { useState, useEffect } from 'react';
import { X, Wand2, Loader2, Link as LinkIcon, Image as ImageIcon, Trophy, Save, Trash2, AlertTriangle, FileText, Calendar, Star, Clapperboard } from 'lucide-react';
import { generateMovieMetadata } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
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
  
  // New Manual Fields
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [status, setStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Pre-fill data if editing
  useEffect(() => {
    if (movieToEdit) {
        setTitle(movieToEdit.title);
        setStreamUrl(movieToEdit.streamUrl);
        setPosterUrl(movieToEdit.posterUrl);
        setTrendingRank(movieToEdit.trendingRank ? movieToEdit.trendingRank.toString() : '');
        
        // Fill manual fields
        setDescription(movieToEdit.description);
        setYear(movieToEdit.year);
        setGenre(movieToEdit.genre.join(', '));
        setRating(movieToEdit.rating.toString());

        setAutoMode(false); // Manual mode by default when editing
    }
  }, [movieToEdit]);

  const handleSmartGenerateAndSave = async () => {
    if (!title) {
        setError("Por favor escribe el título de la película.");
        return;
    }
    setLoading(true);
    setError('');
    
    try {
      let finalDescription = description;
      let finalYear = year;
      let finalGenre: string[] = genre.split(',').map(g => g.trim()).filter(g => g);
      let finalRating = parseFloat(rating) || 0;
      let finalDirector = '';
      let finalActors: string[] = [];
      let finalImdbId = '';

      // 1. Logic for Auto Mode (Generate Data)
      if (autoMode && !movieToEdit) {
          setStatus('Generando metadatos con IA...');
          const metadata = await generateMovieMetadata(title);
          
          finalDescription = metadata.description;
          finalYear = metadata.year;
          finalGenre = metadata.genre;
          finalRating = metadata.rating;
          finalImdbId = metadata.imdbId || '';
          
          if (!posterUrl) {
             // Fallback if no poster provided in auto mode
             // In a real app, you might fetch this from an API too
          }
      } 

      // 2. Prepare Final Object
      const finalStreamUrl = streamUrl || (movieToEdit ? movieToEdit.streamUrl : 'https://google.com'); // Placeholder if empty
      const finalPosterUrl = posterUrl || (movieToEdit ? movieToEdit.posterUrl : `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`);
      const finalRank = trendingRank ? parseInt(trendingRank) : null;
      const finalId = movieToEdit ? movieToEdit.id : crypto.randomUUID();

      // Ensure manual fields are respected if not auto
      if (!autoMode) {
          if (!description) finalDescription = 'Sin descripción disponible.';
          if (finalGenre.length === 0) finalGenre = ['General'];
      }

      const movieToSave: Movie = {
        id: finalId,
        title: title,
        streamUrl: finalStreamUrl,
        posterUrl: finalPosterUrl,
        description: finalDescription,
        year: finalYear,
        genre: finalGenre,
        rating: finalRating,
        director: finalDirector, // You could add inputs for these too if needed
        actors: finalActors,
        imdbId: finalImdbId,
        trendingRank: finalRank || undefined
      };

      setStatus('Guardando en Supabase...');

      const { error: dbError } = await supabase
        .from('movies')
        .upsert({
            id: movieToSave.id,
            title: movieToSave.title,
            description: movieToSave.description,
            year: movieToSave.year,
            genre: movieToSave.genre,
            "posterUrl": movieToSave.posterUrl,
            "streamUrl": movieToSave.streamUrl,
            rating: movieToSave.rating,
            director: movieToSave.director,
            actors: movieToSave.actors,
            "imdbId": movieToSave.imdbId,
            "trendingRank": movieToSave.trendingRank
        })
        .select();

      if (dbError) {
        throw new Error(dbError.message);
      }

      onAdd(movieToSave);
      onClose();
    } catch (e: any) {
      setError(e.message || "Error desconocido.");
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
          setError("Error al eliminar: " + e.message);
          setDeleteLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1a1c22] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center">
            {movieToEdit ? <Save className="h-5 w-5 mr-2 text-brand-500" /> : <Wand2 className="h-5 w-5 mr-2 text-brand-500" />}
            {movieToEdit ? 'Editar Película' : 'Agregar Película'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
            
          {!movieToEdit && (
              <div className="bg-brand-900/50 border border-brand-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Modo Automático (IA)</span>
                    <button 
                        onClick={() => setAutoMode(!autoMode)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${autoMode ? 'bg-brand-500' : 'bg-gray-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoMode ? 'translate-x-4' : ''}`} />
                    </button>
                </div>
                <p className="text-xs text-gray-400">
                    {autoMode ? "La IA escribirá la descripción y datos." : "Tú escribes todos los detalles manualmente."}
                </p>
              </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Ej: Avatar: Fire and Ash"
            />
          </div>

          {(!autoMode || movieToEdit) && (
              <div className="space-y-4 animate-fade-in">
                  
                  {/* MANUAL FIELDS */}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Link Streaming (Video)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        className="w-full bg-[#0f1014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Link Imagen (Poster)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        className="w-full bg-[#0f1014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="https://imagen.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Sinopsis / Descripción
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                        placeholder="Escribe de qué trata la película..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Año
                        </label>
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="2025"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" /> Calificación (1-10)
                        </label>
                        <input
                            type="number"
                            max="10"
                            step="0.1"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="8.5"
                        />
                      </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                        <Clapperboard className="h-4 w-4" /> Géneros (Separados por coma)
                    </label>
                    <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Acción, Drama, Sci-Fi"
                    />
                  </div>
              </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Ranking Tendencias (Opcional)
            </label>
            <input
                type="number"
                min="1"
                max="10"
                value={trendingRank}
                onChange={(e) => setTrendingRank(e.target.value)}
                className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ej: 1 para Top #1"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {status && <p className="text-blue-400 text-sm animate-pulse">{status}</p>}

          <div className="flex gap-3 pt-2">
            <button
                onClick={handleSmartGenerateAndSave}
                disabled={!title || loading || deleteLoading}
                className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center transition-all ${
                !title || loading || deleteLoading
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Guardar Cambios'}
            </button>
            
            {movieToEdit && (
                <>
                    {showDeleteConfirm ? (
                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 animate-fade-in"
                        >
                           {deleteLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <AlertTriangle className="h-5 w-5" />}
                           ¿Seguro?
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-3 bg-red-900/30 text-red-500 border border-red-500/30 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors flex items-center justify-center"
                            title="Eliminar Película"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};