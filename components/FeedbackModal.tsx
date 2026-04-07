import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, X, Send, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';

interface FeedbackModalProps {
  movie: Movie;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ movie, onClose, onSubmit }) => {
  const isSeries = movie.genre.includes('Serie');
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [progress, setProgress] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      movieId: movie.id,
      rating,
      progress: isSeries ? progress : undefined,
      comment
    });
    setStep(2); // Show success message
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="relative h-32 w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10" />
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 relative z-20 -mt-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-white">¿Qué te pareció?</h2>
                  <p className="text-gray-400 text-sm">Acabas de ver <span className="text-white font-medium">{movie.title}</span></p>
                </div>

                {!isSeries ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300 text-center">
                      ¿Te gustó la película?
                    </label>
                    <div className="flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setRating('like')}
                        className={`p-4 rounded-full border-2 transition-all ${rating === 'like' ? 'border-green-500 bg-green-500/20 text-green-500' : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white'}`}
                      >
                        <ThumbsUp className="w-8 h-8" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRating('dislike')}
                        className={`p-4 rounded-full border-2 transition-all ${rating === 'dislike' ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white'}`}
                      >
                        <ThumbsDown className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        ¿Por dónde quedaste?
                      </label>
                      <input
                        type="text"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        placeholder="Ej: Temporada 1, Episodio 3"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        ¿Qué te pareció hasta ahora? (Opcional)
                      </label>
                      <div className="flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setRating('like')}
                          className={`p-3 rounded-full border-2 transition-all ${rating === 'like' ? 'border-green-500 bg-green-500/20 text-green-500' : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white'}`}
                        >
                          <ThumbsUp className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRating('dislike')}
                          className={`p-3 rounded-full border-2 transition-all ${rating === 'dislike' ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white'}`}
                        >
                          <ThumbsDown className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isSeries && !rating}
                  className="w-full py-3.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Respuesta
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">¡Gracias por tu opinión!</h3>
                  <p className="text-gray-400 mt-1">Esperamos que la hayas disfrutado.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
