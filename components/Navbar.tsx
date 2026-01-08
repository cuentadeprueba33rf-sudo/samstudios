import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, User, LogOut, MessageSquarePlus } from 'lucide-react';

interface NavbarProps {
  onAddClick: () => void;
  onHomeClick: () => void;
  onMyListClick: () => void;
  onUserClick: () => void;
  onRequestClick?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onAddClick, 
  onHomeClick, 
  onMyListClick, 
  onUserClick,
  onRequestClick,
  searchTerm, 
  onSearchChange,
  isAdmin
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#050505]/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side: Logo & Menu */}
          <div className={`flex items-center gap-4 md:gap-8 ${mobileSearchActive ? 'hidden sm:flex' : 'flex'}`}>
            <div className="flex items-center cursor-pointer group" onClick={onHomeClick}>
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-[#E50914] tracking-tighter group-hover:scale-105 transition-transform duration-300 drop-shadow-lg">
                SAMSTUDIOS
                </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 text-xs md:text-sm font-medium text-gray-300">
                <button onClick={onHomeClick} className="text-white font-bold hover:text-gray-300 transition-colors">Inicio</button>
                <button className="hover:text-white transition-colors">Series</button>
                <button className="hover:text-white transition-colors">Películas</button>
                <button className="hover:text-white transition-colors">Novedades</button>
                <button onClick={onMyListClick} className="hover:text-white transition-colors">Mi Lista</button>
            </div>
          </div>

          {/* Right Side: Search & Profile */}
          <div className={`flex items-center gap-2 sm:gap-6 ${mobileSearchActive ? 'w-full' : ''}`}>
            
            <div className={`flex items-center transition-all bg-black/40 border border-white/10 hover:border-white/30 rounded-full px-2 py-1 ${mobileSearchActive ? 'w-full' : ''}`}>
                <Search 
                    className={`h-4 w-4 md:h-5 md:w-5 text-gray-300 cursor-pointer min-w-[20px]`} 
                    onClick={() => setMobileSearchActive(!mobileSearchActive)} 
                />
                <input
                    type="text"
                    className={`bg-transparent border-none focus:ring-0 text-white text-sm placeholder-gray-400 transition-all duration-300 outline-none ml-2 ${searchTerm || mobileSearchActive ? 'w-full sm:w-64' : 'w-0 sm:focus:w-64 focus:w-32'}`}
                    placeholder="Títulos, géneros..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => !searchTerm && setMobileSearchActive(false)}
                />
                {mobileSearchActive && (
                    <button onClick={() => { setMobileSearchActive(false); onSearchChange(''); }} className="sm:hidden p-1">
                         <span className="text-xs text-gray-400">Cancel</span>
                    </button>
                )}
            </div>

            {!mobileSearchActive && (
                <>
                    {/* Request Button */}
                    {onRequestClick && (
                        <button 
                            onClick={onRequestClick}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-xs md:text-sm font-medium text-gray-200"
                            title="Pedir una película o serie"
                        >
                            <MessageSquarePlus className="h-4 w-4 text-brand-500" />
                            <span>Pedir</span>
                        </button>
                    )}

                    {/* Only show Add button if Admin */}
                    {isAdmin && (
                      <button onClick={onAddClick} className="text-gray-200 hover:text-white font-medium text-xs md:text-sm flex items-center gap-1 transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                          <Plus className="h-4 w-4" /> 
                          <span className="hidden sm:inline">Admin Add</span>
                      </button>
                    )}
                    
                    <Bell className="h-5 w-5 text-gray-200 hover:text-white cursor-pointer hidden sm:block" />
                    
                    <div 
                      onClick={onUserClick}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded flex items-center justify-center cursor-pointer transition-colors ${isAdmin ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {isAdmin ? <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};