import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    // Duración total de la animación (4 segundos aprox)
    const timer = setTimeout(() => {
      setAnimating(false);
      onFinish();
    }, 3800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!animating) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      
      {/* Container de la animación */}
      <div className="relative flex flex-col items-center justify-center w-full h-full animate-intro-sequence">
        
        {/* LOGO */}
        {/* El logo comienza pequeño, crece un poco (tensión) y luego hace un zoom masivo hacia la cámara */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#E50914] select-none scale-100 opacity-0 animate-netflix-pop">
            SAMSTUDIOS
        </h1>

        {/* Sombra/Glow sutil detrás para dar profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E50914]/10 to-transparent opacity-0 animate-glow-pulse pointer-events-none" />

      </div>

      <style>{`
        /* 
           Secuencia estilo Netflix:
           1. (0-20%) Aparece de golpe (Pop) o fade rápido.
           2. (20-70%) Crece muy lentamente (Tensión).
           3. (70-100%) Zoom masivo hacia la cámara (Entrada a la app).
        */
        @keyframes netflix-pop {
            0% {
                opacity: 0;
                transform: scale(0.8);
            }
            20% {
                opacity: 1;
                transform: scale(1);
            }
            70% {
                opacity: 1;
                transform: scale(1.1); /* Crece sutilmente */
            }
            100% {
                opacity: 0;
                transform: scale(30); /* El usuario "atraviesa" el logo */
            }
        }

        /* El contenedor hace fade-out al final para suavizar la transición a la app */
        @keyframes intro-sequence {
            0% { background-color: black; }
            90% { background-color: black; }
            100% { background-color: transparent; }
        }

        /* Un destello sutil en el fondo */
        @keyframes glow-pulse {
            0% { opacity: 0; }
            30% { opacity: 0.3; }
            100% { opacity: 0; }
        }

        .animate-netflix-pop {
            animation: netflix-pop 3.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
        }

        .animate-intro-sequence {
            animation: intro-sequence 3.8s ease-out forwards;
        }

        .animate-glow-pulse {
            animation: glow-pulse 3.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};