import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
         // Sign Up Logic
         const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
         });
         if (signUpError) throw signUpError;
         if (data.user) {
             alert("Cuenta creada. Por favor inicia sesión.");
             setIsSignUp(false); // Switch to login
         }
      } else {
         // Login Logic
         const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
         });
         if (signInError) throw signInError;
         if (data.user) {
             onLoginSuccess();
             onClose();
         }
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#0f1014] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
            <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-brand-900 rounded-full mb-3 border border-brand-500/20">
                <Lock className="h-6 w-6 text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">{isSignUp ? 'Crear Cuenta Admin' : 'Acceso Admin'}</h2>
            <p className="text-sm text-gray-400 mt-1">
                {isSignUp ? 'Solo personal autorizado.' : 'Inicia sesión para gestionar el contenido.'}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                        placeholder="admin@samstudios.com"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#E50914] hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Registrar' : 'Entrar')}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-500 hover:text-white transition-colors underline decoration-dotted"
            >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crear una'}
            </button>
        </div>
      </div>
    </div>
  );
};