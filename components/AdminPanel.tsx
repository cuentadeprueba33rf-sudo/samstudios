import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Film,
  Tv,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Trash2,
  MessageSquarePlus,
  Clock,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { Movie } from '../types';
import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';

interface Request {
    id: string;
    title: string;
    type: string;
    note: string;
    userEmail: string;
    userId: string;
    status: 'pending' | 'completed' | 'rejected';
    created_at: string;
}

interface AdminPanelProps {
  onBack: () => void;
  initialMovies: Movie[];
  onSyncComplete: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, initialMovies, onSyncComplete }) => {
  const [syncLoading, setSyncLoading] = useState(false);
  const [dbMovies, setDbMovies] = useState<Movie[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [isSamProtectEnabled, setIsSamProtectEnabled] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'security'), (docSnap) => {
      if (docSnap.exists()) {
        setIsSamProtectEnabled(docSnap.data().samProtectEnabled !== false);
      }
    });
    return () => unsub();
  }, []);

  const toggleSamProtect = async () => {
    try {
      await setDoc(doc(db, 'settings', 'security'), {
        samProtectEnabled: !isSamProtectEnabled
      }, { merge: true });
    } catch (e) {
      console.error("Error toggling SAM Protect:", e);
    }
  };

  const fetchDbMovies = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'movies'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as Movie);
      setDbMovies(data);
    } catch (error) {
      console.error("Error fetching movies from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const q = query(collection(db, 'requests'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
      } as Request));
      setRequests(data);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      setRequestsError(error.message || "Error al cargar las solicitudes");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbMovies();
    fetchRequests();
  }, []);

  const handleSync = async () => {
    const confirmMsg = "Esto subirá todas las películas y series del código a la base de datos. Si ya existen, se actualizarán. ¿Continuar?";
    if (!confirm(confirmMsg)) return;

    setSyncLoading(true);
    try {
      const moviesToUpload = initialMovies.map(m => {
        const movieObj: any = {
          ...m,
          genre: m.genre || [],
          actors: m.actors || []
        };
        
        // Remove undefined fields
        Object.keys(movieObj).forEach(key => {
          if (movieObj[key] === undefined) {
            delete movieObj[key];
          }
        });
        
        return movieObj;
      });

      let count = 0;
      for (const movie of moviesToUpload) {
        const movieRef = doc(db, 'movies', movie.id);
        await setDoc(movieRef, { 
          ...movie, 
          created_at: movie.created_at || new Date().toISOString() 
        }, { merge: true });
        count++;
      }
      
      alert(`¡Sincronización completada! Se procesaron ${count} elementos.`);
      fetchDbMovies();
      onSyncComplete();
    } catch (e: any) {
      alert("Error sincronizando: " + e.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}" de la base de datos?`)) return;
    
    try {
      await deleteDoc(doc(db, 'movies', id));
      setDbMovies(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      alert("Error eliminando: " + e.message);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: 'completed' | 'rejected') => {
      try {
          const requestToUpdate = requests.find(r => r.id === requestId);
          
          await updateDoc(doc(db, 'requests', requestId), {
              status: newStatus
          });

          // Create notification for the user
          if (requestToUpdate) {
              const message = newStatus === 'completed' 
                ? `¡Tu solicitud de "${requestToUpdate.title}" fue aceptada por SAM IA! Ya está disponible en el catálogo.`
                : `Tu solicitud de "${requestToUpdate.title}" no pudo ser procesada en este momento.`;
              
              await addDoc(collection(db, 'notifications'), {
                  userId: requestToUpdate.userId,
                  message,
                  type: newStatus === 'completed' ? 'request_accepted' : 'info',
                  read: false,
                  created_at: new Date().toISOString()
              });
          }

          setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      } catch (error) {
          console.error("Error updating request:", error);
          alert("Error al actualizar la solicitud.");
      }
  };

  const handleDeleteRequest = async (requestId: string) => {
      if (!confirm("¿Eliminar esta solicitud definitivamente?")) return;
      try {
          await deleteDoc(doc(db, 'requests', requestId));
          setRequests(prev => prev.filter(r => r.id !== requestId));
      } catch (error) {
          console.error("Error deleting request:", error);
      }
  };

  const filteredMovies = dbMovies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tighter">Panel de Administración</h1>
                <p className="text-on-surface-variant text-sm font-label">Gestiona el catálogo y solicitudes de usuarios</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSync}
              disabled={syncLoading}
              className="flex items-center gap-2 px-6 py-3 bg-on-surface text-surface rounded-xl font-headline font-black hover:brightness-110 transition-all disabled:opacity-50 shadow-xl shadow-on-surface/5 uppercase tracking-widest text-sm"
            >
              {syncLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Sincronizar
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-outline/10">
            <div className="flex items-center justify-between mb-4">
              <Film className="h-8 w-8 text-secondary" />
              <span className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest">Películas</span>
            </div>
            <div className="text-3xl font-headline font-black">{dbMovies.filter(m => !m.genre.includes('Serie')).length}</div>
            <p className="text-[10px] text-on-surface-variant mt-1 font-label uppercase">En la base de datos</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-outline/10">
            <div className="flex items-center justify-between mb-4">
              <Tv className="h-8 w-8 text-primary" />
              <span className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest">Series</span>
            </div>
            <div className="text-3xl font-headline font-black">{dbMovies.filter(m => m.genre.includes('Serie')).length}</div>
            <p className="text-[10px] text-on-surface-variant mt-1 font-label uppercase">En la base de datos</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-outline/10">
            <div className="flex items-center justify-between mb-4">
              <MessageSquarePlus className="h-8 w-8 text-secondary" />
              <span className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest">Solicitudes</span>
            </div>
            <div className="text-3xl font-headline font-black">{requests.filter(r => r.status === 'pending').length}</div>
            <p className="text-[10px] text-on-surface-variant mt-1 font-label uppercase">Pendientes</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-outline/10">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className={`h-8 w-8 ${isSamProtectEnabled ? 'text-primary' : 'text-error'}`} />
              <span className="text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest">Seguridad</span>
            </div>
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-headline font-black text-xs uppercase italic ${isSamProtectEnabled ? 'text-secondary' : 'text-error'}`}>
                  {isSamProtectEnabled ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {isSamProtectEnabled ? 'AETHER Activo' : 'AETHER Inactivo'}
                </div>
                <button 
                    onClick={toggleSamProtect}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-label font-black uppercase tracking-widest transition-colors ${isSamProtectEnabled ? 'bg-error-container/20 text-error hover:bg-error-container/30' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'}`}
                >
                    {isSamProtectEnabled ? 'OFF' : 'ON'}
                </button>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 font-label uppercase">Control global</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline/10">
            <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-8 py-4 font-label font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === 'catalog' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
                Catálogo
                {activeTab === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`px-8 py-4 font-label font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
                Solicitudes
                {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary text-on-primary text-[10px] rounded-full">
                        {requests.filter(r => r.status === 'pending').length}
                    </span>
                )}
                {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
            </button>
        </div>

        {activeTab === 'catalog' ? (
            <div className="glass-panel rounded-3xl border border-outline/10 overflow-hidden">
                <div className="p-6 border-b border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-headline font-black flex items-center gap-2 uppercase italic">
                        <Database className="h-5 w-5 text-primary" />
                        Gestión de Catálogo
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                        <input 
                            type="text" 
                            placeholder="Buscar en DB..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface-variant/50 border border-outline/10 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors w-full md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-variant/30 text-[10px] font-label font-black text-on-surface-variant uppercase tracking-widest">
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Año</th>
                                <th className="px-6 py-4">Género</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                        <p className="text-on-surface-variant mt-2 font-label uppercase text-xs">Cargando catálogo...</p>
                                    </td>
                                </tr>
                            ) : filteredMovies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-label uppercase text-xs">
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            ) : (
                                filteredMovies.map(movie => (
                                    <tr key={movie.id} className="hover:bg-surface-variant/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={movie.posterUrl} alt="" className="h-10 w-7 object-cover rounded shadow-lg" />
                                                <span className="font-bold text-on-surface">{movie.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant font-label text-xs">{movie.year}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {movie.genre.slice(0, 2).map(g => (
                                                    <span key={g} className="text-[9px] px-1.5 py-0.5 bg-primary/10 rounded text-primary font-bold uppercase tracking-tighter">{g}</span>
                                                ))}
                                                {movie.genre.length > 2 && <span className="text-[9px] text-on-surface-variant">+{movie.genre.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-secondary font-headline font-black">★ {movie.rating}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(movie.id, movie.title)}
                                                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                {requestsLoading ? (
                    <div className="glass-panel p-12 rounded-3xl border border-outline/10 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-on-surface-variant mt-2 font-label uppercase text-xs">Cargando solicitudes...</p>
                    </div>
                ) : requestsError ? (
                    <div className="glass-panel p-12 rounded-3xl border border-error/20 bg-error-container/5 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-error mb-2" />
                        <p className="text-error font-headline font-black uppercase tracking-tight">Error al cargar solicitudes</p>
                        <p className="text-error/60 text-xs mt-1 font-label">{requestsError}</p>
                        <button 
                            onClick={fetchRequests}
                            className="mt-4 px-4 py-2 bg-surface-variant/50 hover:bg-surface-variant rounded-lg text-[10px] font-label font-black uppercase tracking-widest transition-all"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-outline/10 text-center text-on-surface-variant font-label uppercase text-xs">
                        No hay solicitudes pendientes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map(req => (
                            <div key={req.id} className={`glass-panel p-6 rounded-2xl border transition-all ${req.status === 'pending' ? 'border-secondary/20 bg-secondary/5' : 'border-outline/10'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${req.type === 'Película' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                            {req.type === 'Película' ? <Film className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-headline font-black text-on-surface uppercase tracking-tight">{req.title}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-label uppercase tracking-wider">
                                                <Clock className="h-3 w-3" />
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[9px] font-label font-black uppercase tracking-widest ${
                                        req.status === 'pending' ? 'bg-secondary/20 text-secondary' :
                                        req.status === 'completed' ? 'bg-primary/20 text-primary' :
                                        'bg-error-container/20 text-error'
                                    }`}>
                                        {req.status === 'pending' ? 'Pendiente' : req.status === 'completed' ? 'Completada' : 'Rechazada'}
                                    </div>
                                </div>

                                {req.note && (
                                    <p className="text-xs text-on-surface-variant mb-4 bg-surface-variant/30 p-3 rounded-lg border border-outline/10 italic font-label">
                                        "{req.note}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-outline/10">
                                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-label uppercase tracking-widest font-bold">
                                        <User className="h-3 w-3" />
                                        {req.userEmail}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                                                    className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                                                    title="Marcar como completada"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                                    className="p-2 text-error hover:bg-error-container/10 rounded-lg transition-colors"
                                                    title="Rechazar solicitud"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};
