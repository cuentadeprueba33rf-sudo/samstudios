import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, User, LogOut, MessageSquarePlus, ShieldCheck, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onAddClick: () => void;
  onHomeClick: () => void;
  onMyListClick: () => void;
  onUserClick: () => void;
  onAdminClick?: () => void;
  onRequestClick?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onAddClick, 
  onHomeClick, 
  onMyListClick, 
  onUserClick,
  onAdminClick,
  onRequestClick,
  searchTerm, 
  onSearchChange,
  isAdmin,
  isLoggedIn
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-panel shadow-lg' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side: Logo & Menu */}
          <div className={`flex items-center gap-4 md:gap-8 ${mobileSearchActive ? 'hidden sm:flex' : 'flex'}`}>
            <div className="flex items-center cursor-pointer group" onClick={onHomeClick} onDoubleClick={!isAdmin ? onUserClick : undefined}>
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-widest uppercase font-display group-hover:opacity-80 transition-opacity duration-300 drop-shadow-lg">
                SAMSTUDIOS
                </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
                <button onClick={onHomeClick} className="text-white font-bold hover:text-gray-300 transition-colors">Inicio</button>
                <button className="hover:text-white transition-colors">Series</button>
                <button className="hover:text-white transition-colors">Películas</button>
                <button className="hover:text-white transition-colors">Novedades</button>
                <button onClick={onMyListClick} className="hover:text-white transition-colors">Mi Lista</button>
            </div>
          </div>

          {/* Right Side: Search & Profile */}
          <div className={`flex items-center gap-2 sm:gap-4 ${mobileSearchActive ? 'w-full' : ''}`}>
            
            {/* SAM IA PROTECT BADGE */}
            {!mobileSearchActive && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-[10px] font-black text-brand-400 uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    SAM IA PROTECT
                </div>
            )}

            <div className={`flex items-center transition-all bg-white/5 border border-white/10 hover:border-white/30 rounded-full px-2 py-1 ${mobileSearchActive ? 'w-full' : ''}`}>
                <Search 
                    className={`h-4 w-4 md:h-5 md:w-5 text-gray-300 cursor-pointer min-w-[20px]`} 
                    onClick={() => setMobileSearchActive(!mobileSearchActive)} 
                />
                <input
                    type="text"
                    className={`bg-transparent border-none focus:ring-0 text-white text-sm placeholder-gray-500 transition-all duration-300 outline-none ml-2 ${searchTerm || mobileSearchActive ? 'w-full sm:w-64' : 'w-0 sm:focus:w-64 focus:w-32'}`}
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => !searchTerm && setMobileSearchActive(false)}
                />
                {mobileSearchActive && (
                    <button onClick={() => { setMobileSearchActive(false); onSearchChange(''); }} className="sm:hidden p-1">
                         <span className="text-xs text-gray-400">X</span>
                    </button>
                )}
            </div>

            {!mobileSearchActive && (
                <>
                    {/* Request Button - Now visible on mobile too */}
                    {onRequestClick && (
                        <button 
                            onClick={onRequestClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-xs md:text-sm font-medium text-gray-200 group uppercase tracking-wider"
                            title="Pedir una película o serie"
                        >
                            <MessageSquarePlus className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:scale-110 transition-transform" />
                            <span className="hidden xs:inline">Pedir</span>
                        </button>
                    )}

                    {/* Only show Add button if Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={onAdminClick} 
                          className="text-gray-200 hover:text-white font-medium text-xs md:text-sm flex items-center gap-1 transition-colors bg-brand-500/20 px-3 py-1.5 rounded-full border border-brand-500/30 uppercase tracking-wider"
                          title="Panel de Administración"
                        >
                            <LayoutDashboard className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Admin</span>
                        </button>
                        <button onClick={onAddClick} className="text-gray-200 hover:text-white font-medium text-xs md:text-sm flex items-center gap-1 transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-wider">
                            <Plus className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    )}
                    
                    <button 
                      onClick={onUserClick}
                      className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all border font-medium text-xs sm:text-sm uppercase tracking-wider
                        ${isLoggedIn 
                          ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20' 
                          : 'bg-white text-black border-white hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        }`}
                      title={isLoggedIn ? "Cerrar Sesión" : "Iniciar Sesión"}
                    >
                        {isLoggedIn ? (
                            <>
                                <LogOut className="h-4 w-4" />
                                <span className="hidden xs:inline">Salir</span>
                            </>
                        ) : (
                            <>
                                <User className="h-4 w-4" />
                                <span>Entrar</span>
                            </>
                        )}
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};