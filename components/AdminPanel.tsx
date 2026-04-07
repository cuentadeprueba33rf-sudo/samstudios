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
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-500/20 rounded-xl border border-brand-500/30">
                <LayoutDashboard className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Panel de Administración</h1>
                <p className="text-gray-400 text-sm">Gestiona el catálogo y solicitudes de usuarios</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSync}
              disabled={syncLoading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
            >
              {syncLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Sincronizar Catálogo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <Film className="h-8 w-8 text-blue-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Películas</span>
            </div>
            <div className="text-3xl font-black">{dbMovies.filter(m => !m.genre.includes('Serie')).length}</div>
            <p className="text-xs text-gray-500 mt-1">En la base de datos</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <Tv className="h-8 w-8 text-purple-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Series</span>
            </div>
            <div className="text-3xl font-black">{dbMovies.filter(m => m.genre.includes('Serie')).length}</div>
            <p className="text-xs text-gray-500 mt-1">En la base de datos</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <MessageSquarePlus className="h-8 w-8 text-yellow-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Solicitudes</span>
            </div>
            <div className="text-3xl font-black">{requests.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-gray-500 mt-1">Pendientes por revisar</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className={`h-8 w-8 ${isSamProtectEnabled ? 'text-brand-400' : 'text-red-500'}`} />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seguridad</span>
            </div>
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-bold text-sm ${isSamProtectEnabled ? 'text-green-400' : 'text-red-500'}`}>
                  {isSamProtectEnabled ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {isSamProtectEnabled ? 'SAM IA Activo' : 'SAM IA Inactivo'}
                </div>
                <button 
                    onClick={toggleSamProtect}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isSamProtectEnabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                >
                    {isSamProtectEnabled ? 'Desactivar' : 'Activar'}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Control global de protección</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
            <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all relative ${activeTab === 'catalog' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Catálogo
                {activeTab === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500" />}
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Solicitudes
                {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-brand-500 text-white text-[10px] rounded-full">
                        {requests.filter(r => r.status === 'pending').length}
                    </span>
                )}
                {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500" />}
            </button>
        </div>

        {activeTab === 'catalog' ? (
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Database className="h-5 w-5 text-brand-500" />
                        Gestión de Catálogo (DB)
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar en DB..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 transition-colors w-full md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Año</th>
                                <th className="px-6 py-4">Género</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                                        <p className="text-gray-500 mt-2">Cargando catálogo...</p>
                                    </td>
                                </tr>
                            ) : filteredMovies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron resultados en la base de datos.
                                    </td>
                                </tr>
                            ) : (
                                filteredMovies.map(movie => (
                                    <tr key={movie.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={movie.posterUrl} alt="" className="h-10 w-7 object-cover rounded shadow-lg" />
                                                <span className="font-bold">{movie.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{movie.year}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {movie.genre.slice(0, 2).map(g => (
                                                    <span key={g} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-300">{g}</span>
                                                ))}
                                                {movie.genre.length > 2 && <span className="text-[10px] text-gray-500">+{movie.genre.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-yellow-500 font-bold">★ {movie.rating}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(movie.id, movie.title)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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
                    <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                        <p className="text-gray-500 mt-2">Cargando solicitudes...</p>
                    </div>
                ) : requestsError ? (
                    <div className="glass-panel p-12 rounded-3xl border border-red-500/20 bg-red-500/5 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                        <p className="text-red-200 font-bold">Error al cargar solicitudes</p>
                        <p className="text-red-400/60 text-sm mt-1">{requestsError}</p>
                        <button 
                            onClick={fetchRequests}
                            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500">
                        No hay solicitudes pendientes.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map(req => (
                            <div key={req.id} className={`glass-panel p-6 rounded-2xl border transition-all ${req.status === 'pending' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${req.type === 'Película' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                            {req.type === 'Película' ? <Film className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{req.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                        req.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                        {req.status === 'pending' ? 'Pendiente' : req.status === 'completed' ? 'Completada' : 'Rechazada'}
                                    </div>
                                </div>

                                {req.note && (
                                    <p className="text-sm text-gray-400 mb-4 bg-black/20 p-3 rounded-lg border border-white/5 italic">
                                        "{req.note}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        {req.userEmail}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                                                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Marcar como completada"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Rechazar solicitud"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors"
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
