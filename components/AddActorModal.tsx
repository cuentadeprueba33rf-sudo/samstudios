import React, { useState, useEffect } from 'react';
import { X, User, Save, Trash2, Loader2, Image as ImageIcon, Film, Trophy, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Actor } from '../types';

interface AddActorModalProps {
  onClose: () => void;
  onSave: () => void; // Trigger reload in parent
  actorToEdit?: Actor | null;
}

export const AddActorModal: React.FC<AddActorModalProps> = ({ onClose, onSave, actorToEdit }) => {
  const [name, setName] = useState('');
  const [character, setCharacter] = useState('');
  const [movie, setMovie] = useState('');
  const [image, setImage] = useState('');
  const [award, setAward] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (actorToEdit) {
      setName(actorToEdit.name);
      setCharacter(actorToEdit.character);
      setMovie(actorToEdit.movie);
      setImage(actorToEdit.image);
      setAward(actorToEdit.award || '');
    }
  }, [actorToEdit]);

  const handleSave = async () => {
    if (!name || !image) {
      setError("El nombre y la imagen son obligatorios.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const actorData = {
        name,
        character,
        movie,
        image,
        award: award || null
      };

      if (actorToEdit) {
        // Update
        const { error } = await supabase
          .from('actors')
          .update(actorData)
          .eq('id', actorToEdit.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('actors')
          .insert([actorData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actorToEdit) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from('actors').delete().eq('id', actorToEdit.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1a1c22] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-yellow-500" />
            {actorToEdit ? 'Editar Actor' : 'Agregar Estrella'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Nombre del Actor</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Ej: Timothée Chalamet"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">URL Foto (Retrato)</label>
             <div className="relative">
                <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-[#0f1014] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  placeholder="https://..."
                />
             </div>
             {image && (
                 <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border border-white/20 mx-auto">
                     <img src={image} alt="Preview" className="w-full h-full object-cover" />
                 </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Personaje</label>
                <input
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ej: Paul Atreides"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Película / Serie</label>
                <input
                type="text"
                value={movie}
                onChange={(e) => setMovie(e.target.value)}
                className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ej: Dune"
                />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Premio / Distinción (Opcional)
             </label>
             <input
                type="text"
                value={award}
                onChange={(e) => setAward(e.target.value)}
                className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ej: Ganador Oscar 2025"
             />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
                onClick={handleSave}
                disabled={loading || deleteLoading}
                className="flex-1 py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center transition-all bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Guardar Actor'}
            </button>
            
            {actorToEdit && (
                <>
                    {showDeleteConfirm ? (
                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2"
                        >
                           {deleteLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <AlertTriangle className="h-5 w-5" />}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-3 bg-red-900/30 text-red-500 border border-red-500/30 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors flex items-center justify-center"
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