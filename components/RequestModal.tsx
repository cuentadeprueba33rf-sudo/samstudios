import React, { useState, useEffect } from 'react';
import { Send, X, MessageSquarePlus, Film, Tv, Loader2, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface RequestModalProps {
  onClose: () => void;
  onLoginClick?: () => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export const RequestModal: React.FC<RequestModalProps> = ({ onClose, onLoginClick }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Película');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleSend = async () => {
    if (!title) return;
    
    if (!auth.currentUser) {
        if (onLoginClick) onLoginClick();
        return;
    }

    setLoading(true);
    try {
        await addDoc(collection(db, 'requests'), {
            title,
            type,
            note,
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'requests');
    } finally {
        setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#1a1c22] rounded-2xl w-full max-w-md border border-white/10 p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Solicitud Enviada!</h2>
                <p className="text-gray-400">El administrador revisará tu petición pronto.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1a1c22] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 to-[#1a1c22] p-6 border-b border-white/5 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquarePlus className="h-6 w-6 text-brand-500" />
                    Solicitar Contenido
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    ¿No encuentras lo que buscas? Pídelo aquí.
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
            </button>
        </div>

        <div className="p-6 space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Título de la Película / Serie</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-600 transition-all"
                    placeholder="Ej: Breaking Bad"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Tipo de Contenido</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setType('Película')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${type === 'Película' ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-[#0f1014] text-gray-400 border-white/10 hover:border-white/30'}`}
                    >
                        <Film className="h-4 w-4" /> Película
                    </button>
                    <button 
                        onClick={() => setType('Serie')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${type === 'Serie' ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-[#0f1014] text-gray-400 border-white/10 hover:border-white/30'}`}
                    >
                        <Tv className="h-4 w-4" /> Serie
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Nota Adicional (Opcional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#0f1014] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none placeholder-gray-600 transition-all"
                    placeholder="Año, Temporada específica, idioma..."
                />
            </div>

            {!user && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                        <p className="text-xs text-yellow-200">
                            Debes iniciar sesión para poder enviar solicitudes.
                        </p>
                    </div>
                    <button 
                        onClick={onLoginClick}
                        className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
                    >
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión para Pedir
                    </button>
                </div>
            )}

            <button 
                onClick={handleSend}
                disabled={!title || loading || !user}
                className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-2
                    ${title && !loading && user ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                `}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Enviando...' : user ? 'Enviar Solicitud' : 'Inicia sesión primero'}
            </button>
            
            <p className="text-[10px] text-center text-gray-500">
                Tu solicitud será enviada directamente al panel del administrador.
            </p>
        </div>
      </div>
    </div>
  );
};