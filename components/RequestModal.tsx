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
        const docRef = await addDoc(collection(db, 'requests'), {
            title,
            type,
            note,
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        
        // Save to local storage for tracking real status
        localStorage.setItem('samstudios_pending_request', JSON.stringify({
            id: docRef.id,
            title,
            timestamp: Date.now(),
            status: 'reviewing'
        }));
        window.dispatchEvent(new Event('samstudios_request_added'));

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
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl w-full max-w-md border border-outline/10 p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-secondary" />
                </div>
                <h2 className="text-2xl font-headline font-black text-on-surface mb-2 uppercase tracking-tight">¡Solicitud Enviada!</h2>
                <p className="text-on-surface-variant font-label">El administrador revisará tu petición pronto.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-2xl w-full max-w-md border border-outline/10 shadow-2xl flex flex-col animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-outline/10 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-headline font-black text-on-surface flex items-center gap-2 uppercase italic">
                    <MessageSquarePlus className="h-6 w-6 text-primary" />
                    Solicitar Contenido
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 font-label uppercase tracking-wider">
                    ¿No encuentras lo que buscas? Pídelo aquí.
                </p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="h-6 w-6" />
            </button>
        </div>

        <div className="p-6 space-y-5">
            <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-1.5 uppercase tracking-widest">Título de la Película / Serie</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none placeholder-on-surface-variant/30 transition-all font-bold"
                    placeholder="Ej: Breaking Bad"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-2 uppercase tracking-widest">Tipo de Contenido</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setType('Película')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-label font-bold uppercase tracking-wider text-xs ${type === 'Película' ? 'bg-primary text-on-primary border-primary shadow-lg' : 'bg-surface-variant/50 text-on-surface-variant border-outline/10 hover:border-outline/30'}`}
                    >
                        <Film className="h-4 w-4" /> Película
                    </button>
                    <button 
                        onClick={() => setType('Serie')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-label font-bold uppercase tracking-wider text-xs ${type === 'Serie' ? 'bg-primary text-on-primary border-primary shadow-lg' : 'bg-surface-variant/50 text-on-surface-variant border-outline/10 hover:border-outline/30'}`}
                    >
                        <Tv className="h-4 w-4" /> Serie
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-label font-black text-on-surface-variant mb-1.5 uppercase tracking-widest">Nota Adicional (Opcional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-outline/10 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none h-24 resize-none placeholder-on-surface-variant/30 transition-all text-sm"
                    placeholder="Año, Temporada específica, idioma..."
                />
            </div>

            {!user && (
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-secondary shrink-0" />
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-tight">
                            Debes iniciar sesión para poder enviar solicitudes.
                        </p>
                    </div>
                    <button 
                        onClick={onLoginClick}
                        className="w-full py-2 bg-secondary hover:bg-secondary/80 text-on-secondary font-headline font-black rounded-lg text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                    >
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión
                    </button>
                </div>
            )}

            <button 
                onClick={handleSend}
                disabled={!title || loading || !user}
                className={`w-full py-4 rounded-xl font-headline font-black text-on-surface shadow-lg flex items-center justify-center gap-2 transition-all mt-2 uppercase tracking-widest
                    ${title && !loading && user ? 'bg-on-surface text-surface hover:brightness-110 hover:scale-[1.02]' : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'}
                `}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Enviando...' : user ? 'Enviar Solicitud' : 'Inicia sesión primero'}
            </button>
            
            <p className="text-[9px] text-center text-on-surface-variant font-label uppercase tracking-widest font-medium">
                Tu solicitud será enviada directamente al panel del administrador.
            </p>
        </div>
      </div>
    </div>
  );
};