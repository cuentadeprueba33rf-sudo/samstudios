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
  Trash2
} from 'lucide-react';
import { Movie } from '../types';
import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface AdminPanelProps {
  onBack: () => void;
  initialMovies: Movie[];
  onSyncComplete: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, initialMovies, onSyncComplete }) => {
  const [syncLoading, setSyncLoading] = useState(false);
  const [dbMovies, setDbMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    fetchDbMovies();
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
                <p className="text-gray-400 text-sm">Gestiona el catálogo y sincroniza datos</p>
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
              <Database className="h-8 w-8 text-green-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total DB</span>
            </div>
            <div className="text-3xl font-black">{dbMovies.length}</div>
            <p className="text-xs text-gray-500 mt-1">Registros totales</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="h-8 w-8 text-brand-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</span>
            </div>
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Conectado
            </div>
            <p className="text-xs text-gray-500 mt-1">Firebase Firestore</p>
          </div>
        </div>

        {/* Catalog Management */}
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

      </div>
    </div>
  );
};
