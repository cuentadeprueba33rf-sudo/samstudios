import React, { useState } from 'react';
import { X, Lock, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      if (userCredential.user) {
          onLoginSuccess();
          onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-surface border border-outline/10 rounded-2xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
            <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-primary/10 rounded-full mb-3 border border-primary/20">
                <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-black text-on-surface uppercase tracking-tight">Acceso Admin</h2>
            <p className="text-sm text-on-surface-variant mt-1 text-center font-label">
                Inicia sesión con tu cuenta de Google para gestionar el contenido.
            </p>
        </div>

        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm font-label uppercase font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-on-surface hover:bg-on-surface/90 text-surface font-headline font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5 text-surface" /> : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};