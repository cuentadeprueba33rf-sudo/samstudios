import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, User, LogOut, MessageSquarePlus, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

interface NavbarProps {
  onAddClick: () => void;
  onHomeClick: () => void;
  onMyListClick: () => void;
  onUserClick: () => void;
  onAdminClick?: () => void;
  onRequestClick?: () => void;
  onNotificationsClick?: () => void;
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
  onNotificationsClick,
  searchTerm, 
  onSearchChange,
  isAdmin,
  isLoggedIn
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !auth.currentUser) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-panel shadow-lg' : 'bg-gradient-to-b from-surface/90 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side: Logo & Menu */}
          <div className={`flex items-center gap-4 md:gap-8 ${mobileSearchActive ? 'hidden sm:flex' : 'flex'}`}>
            <div className="flex items-center cursor-pointer group" onClick={onHomeClick} onDoubleClick={!isAdmin ? onUserClick : undefined}>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-on-surface tracking-[0.2em] uppercase font-headline group-hover:text-primary transition-colors duration-300 drop-shadow-lg">
                AETHER
                </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 text-xs md:text-sm font-label font-medium text-on-surface-variant uppercase tracking-widest">
                <button onClick={onHomeClick} className="text-on-surface font-bold hover:text-primary transition-colors">Inicio</button>
                <button className="hover:text-on-surface transition-colors">Series</button>
                <button className="hover:text-on-surface transition-colors">Películas</button>
                <button className="hover:text-on-surface transition-colors">Novedades</button>
                <button onClick={onMyListClick} className="hover:text-on-surface transition-colors">Mi Lista</button>
            </div>
          </div>

          {/* Right Side: Search & Profile */}
          <div className={`flex items-center gap-2 sm:gap-4 ${mobileSearchActive ? 'w-full' : ''}`}>
            
            {/* AETHER PROTECT BADGE */}
            {!mobileSearchActive && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-variant/50 border border-outline/20 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest transition-all hover:border-primary/30 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm animate-pulse" />
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="group-hover:text-on-surface transition-colors">AETHER PROTECT ACTIVA</span>
                    <div className="h-1 w-1 rounded-full bg-secondary animate-pulse" />
                </div>
            )}

            <div className={`flex items-center transition-all bg-surface-variant/50 border border-outline/20 hover:border-outline/50 rounded-full px-2 py-1 ${mobileSearchActive ? 'w-full' : ''}`}>
                <Search 
                    className={`h-4 w-4 md:h-5 md:w-5 text-on-surface-variant cursor-pointer min-w-[20px]`} 
                    onClick={() => setMobileSearchActive(!mobileSearchActive)} 
                />
                <input
                    type="text"
                    className={`bg-transparent border-none focus:ring-0 text-on-surface text-sm placeholder-on-surface-variant/50 transition-all duration-300 outline-none ml-2 ${searchTerm || mobileSearchActive ? 'w-full sm:w-64' : 'w-0 sm:focus:w-64 focus:w-32'}`}
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => !searchTerm && setMobileSearchActive(false)}
                />
            </div>

            {!mobileSearchActive && (
                <>
                    {/* Request Button */}
                    {onRequestClick && (
                        <button 
                            onClick={onRequestClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-variant/50 border border-outline/20 hover:bg-surface-variant hover:border-outline/50 transition-all text-xs md:text-sm font-medium text-on-surface group uppercase tracking-wider"
                            title="Pedir una película o serie"
                        >
                            <MessageSquarePlus className="h-4 w-4 md:h-5 md:w-5 text-on-surface group-hover:text-primary transition-colors" />
                            <span className="hidden xs:inline">Pedir</span>
                        </button>
                    )}

                    {/* Only show Add button if Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={onAdminClick} 
                          className="text-on-surface hover:text-primary font-medium text-xs md:text-sm flex items-center gap-1 transition-colors bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30 uppercase tracking-wider"
                          title="Panel de Administración"
                        >
                            <LayoutDashboard className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Admin</span>
                        </button>
                        <button onClick={onAddClick} className="text-on-surface hover:text-primary font-medium text-xs md:text-sm flex items-center gap-1 transition-colors bg-surface-variant/50 px-3 py-1.5 rounded-full border border-outline/20 uppercase tracking-wider">
                            <Plus className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Notifications Bell */}
                    {isLoggedIn && onNotificationsClick && (
                        <button 
                            onClick={onNotificationsClick}
                            className="relative p-2 hover:bg-surface-variant/50 rounded-full transition-all text-on-surface-variant hover:text-on-surface"
                            title="Notificaciones"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface animate-in zoom-in duration-300">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    )}

                    <button 
                      onClick={onUserClick}
                      className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all border font-medium text-xs sm:text-sm uppercase tracking-wider
                        ${isLoggedIn 
                          ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' 
                          : 'bg-on-surface text-surface border-on-surface hover:bg-on-surface/90 shadow-[0_0_20px_rgba(182,160,255,0.2)]'
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