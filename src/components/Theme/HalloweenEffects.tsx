import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const HalloweenEffects: React.FC = () => {
  const { theme } = useTheme();
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [ghosts, setGhosts] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const [spiders, setSpiders] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (theme !== 'halloween') return;

    // Generate MORE bats
    const batArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      delay: Math.random() * 20
    }));
    setBats(batArray);

    // Generate MORE ghosts
    const ghostArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 20
    }));
    setGhosts(ghostArray);

    // Generate spiders
    const spiderArray = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15
    }));
    setSpiders(spiderArray);
  }, [theme]);

  if (theme !== 'halloween') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {/* Spooky Background Glow - MUITO MAIS VISÍVEL */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-600/20 via-purple-700/25 to-black/10" />
      
      {/* Pumpkins in corners - MAIORES E BRILHANTES */}
      <div className="absolute top-8 left-8 text-8xl animate-bounce-slow drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]">
        🎃
      </div>
      <div className="absolute top-8 right-8 text-8xl animate-bounce-slow drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]" style={{ animationDelay: '1s' }}>
        🎃
      </div>
      <div className="absolute bottom-8 left-8 text-8xl animate-bounce-slow drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]" style={{ animationDelay: '2s' }}>
        🎃
      </div>
      <div className="absolute bottom-8 right-8 text-8xl animate-bounce-slow drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]" style={{ animationDelay: '3s' }}>
        🎃
      </div>
      
      {/* Flying Bats - MAIORES E MAIS VISÍVEIS */}
      {bats.map((bat) => (
        <div
          key={`bat-${bat.id}`}
          className="absolute text-4xl animate-fly-across drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            animationDelay: `${bat.delay}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
            filter: 'brightness(1.2)'
          }}
        >
          🦇
        </div>
      ))}
      
      {/* Floating Ghosts - MAIORES COM BRILHO */}
      {ghosts.map((ghost) => (
        <div
          key={`ghost-${ghost.id}`}
          className="absolute text-6xl animate-float-up drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]"
          style={{
            left: `${ghost.x}%`,
            bottom: '-10%',
            animationDelay: `${ghost.delay}s`,
            animationDuration: `${15 + Math.random() * 8}s`,
            opacity: 0.85,
            filter: 'brightness(1.3)'
          }}
        >
          👻
        </div>
      ))}
      
      {/* Spiders Dropping - NOVO! */}
      {spiders.map((spider) => (
        <div
          key={`spider-${spider.id}`}
          className="absolute text-3xl animate-spider-drop"
          style={{
            left: `${spider.x}%`,
            top: '-5%',
            animationDelay: `${spider.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))'
          }}
        >
          �️
        </div>
      ))}
      
      {/* Spiderwebs - MAIORES E MAIS VISÍVEIS */}
      <div className="absolute top-0 left-0 w-56 h-56 opacity-60 animate-sway drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 85 15 L 15 85" 
                stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="10" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="40" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-56 h-56 opacity-60 animate-sway transform scale-x-[-1] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 85 15 L 15 85" 
                stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="10" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="40" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-1/4 w-48 h-48 opacity-50 animate-sway drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 85 15 L 15 85" 
                stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="15" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      
      {/* Falling Leaves - MAIORES E MAIS VISÍVEIS */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`leaf-${i}`}
          className="absolute text-3xl animate-fall drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            opacity: 0.7
          }}
        >
          🍂
        </div>
      ))}
      
      {/* Skulls - NOVO! */}
      <div className="absolute top-1/4 left-1/4 text-7xl animate-skull-rotate drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]">
        💀
      </div>
      <div className="absolute top-1/3 right-1/4 text-7xl animate-skull-rotate drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]" style={{ animationDelay: '2s' }}>
        💀
      </div>
      
      {/* Jack-o'-lanterns with flickering light - MUITO MAIORES E BRILHANTES */}
      <div className="absolute bottom-24 left-16 text-8xl">
        <div className="animate-flicker drop-shadow-[0_0_40px_rgba(249,115,22,1)]">🎃</div>
        <div className="absolute inset-0 bg-orange-500/50 blur-3xl rounded-full animate-pulse scale-150" />
      </div>
      <div className="absolute bottom-24 right-16 text-8xl">
        <div className="animate-flicker drop-shadow-[0_0_40px_rgba(249,115,22,1)]" style={{ animationDelay: '0.5s' }}>🎃</div>
        <div className="absolute inset-0 bg-orange-500/50 blur-3xl rounded-full animate-pulse scale-150" />
      </div>
      
      {/* Witches Hat - NOVO! */}
      <div className="absolute top-1/2 left-10 text-6xl animate-witch-float drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
        🧙
      </div>
      
      {/* Moon - NOVO! */}
      <div className="absolute top-20 right-1/4 text-9xl drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] animate-moon-glow">
        🌕
      </div>
      
      {/* Candy - NOVO! */}
      <div className="absolute bottom-1/3 right-20 text-5xl animate-candy-spin drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]">
        🍬
      </div>
      <div className="absolute bottom-1/2 left-20 text-5xl animate-candy-spin drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]" style={{ animationDelay: '1.5s' }}>
        🍭
      </div>
    </div>
  );
};

export default HalloweenEffects;
