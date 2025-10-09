import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const HalloweenEffects: React.FC = () => {
  const { theme } = useTheme();
  const [bats, setBats] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [ghosts, setGhosts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (theme !== 'halloween') return;

    // Generate bats
    const batArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10
    }));
    setBats(batArray);

    // Generate ghosts
    const ghostArray = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15
    }));
    setGhosts(ghostArray);
  }, [theme]);

  if (theme !== 'halloween') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Spooky Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/5 via-purple-900/10 to-black/20" />
      
      {/* Pumpkins in corners */}
      <div className="absolute top-4 left-4 text-6xl animate-bounce-slow opacity-70">
        🎃
      </div>
      <div className="absolute top-4 right-4 text-6xl animate-bounce-slow opacity-70" style={{ animationDelay: '1s' }}>
        🎃
      </div>
      
      {/* Flying Bats */}
      {bats.map((bat) => (
        <div
          key={`bat-${bat.id}`}
          className="absolute text-2xl animate-fly-across"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            animationDelay: `${bat.delay}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        >
          🦇
        </div>
      ))}
      
      {/* Floating Ghosts */}
      {ghosts.map((ghost) => (
        <div
          key={`ghost-${ghost.id}`}
          className="absolute text-4xl animate-float-up opacity-60"
          style={{
            left: `${ghost.x}%`,
            bottom: '-10%',
            animationDelay: `${ghost.delay}s`,
            animationDuration: `${20 + Math.random() * 10}s`
          }}
        >
          👻
        </div>
      ))}
      
      {/* Spiderwebs */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 85 15 L 15 85" 
                stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="10" stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="#fff" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transform scale-x-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 85 15 L 15 85" 
                stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="10" stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="#fff" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="#fff" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>
      
      {/* Falling Leaves */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`leaf-${i}`}
          className="absolute text-xl animate-fall opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 5}s`
          }}
        >
          🍂
        </div>
      ))}
      
      {/* Jack-o'-lanterns with flickering light */}
      <div className="absolute bottom-20 left-10 text-5xl">
        <div className="animate-flicker">🎃</div>
        <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 text-5xl">
        <div className="animate-flicker" style={{ animationDelay: '0.5s' }}>🎃</div>
        <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default HalloweenEffects;
