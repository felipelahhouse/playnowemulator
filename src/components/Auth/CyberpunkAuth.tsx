import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Gamepad2, Zap, Shield, Sparkles, Trophy, Users, Star } from 'lucide-react';

const CyberpunkAuth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeGame, setActiveGame] = useState(0);

  const retroGames = [
    { name: 'Super Mario World', console: 'SNES', color: 'from-red-500 to-yellow-500' },
    { name: 'Sonic the Hedgehog', console: 'Genesis', color: 'from-blue-500 to-cyan-500' },
    { name: 'Street Fighter II', console: 'Arcade', color: 'from-orange-500 to-red-500' },
    { name: 'The Legend of Zelda', console: 'SNES', color: 'from-green-500 to-emerald-500' },
    { name: 'Mega Man X', console: 'SNES', color: 'from-blue-600 to-indigo-600' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGame((prev) => (prev + 1) % retroGames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timeout. Please check your connection and try again.');
    }, 10000);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await signUp(email, password, username);
      }
      clearTimeout(timeoutId);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Auth error:', err);
      let errorMessage = err.message || 'Authentication failed. Please try again.';

      if (errorMessage.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
        setTimeout(() => setMode('signin'), 2000);
      } else if (errorMessage.includes('Invalid login')) {
        errorMessage = 'Invalid email or password. Please check and try again.';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
      {/* Retro Gaming Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />

        {/* CRT Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)'
          }} />
        </div>

        {/* Pixel Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }} />
        </div>

        {/* Animated retro game showcase */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {retroGames.map((game, index) => (
            <div
              key={game.name}
              className={`absolute transition-all duration-1000 ${
                index === activeGame ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="relative">
                {/* Retro TV Frame */}
                <div className="w-96 h-64 border-8 border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900 to-black shadow-2xl">
                  {/* Screen content */}
                  <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${game.color} opacity-30 flex items-center justify-center relative overflow-hidden`}>
                    {/* Pixel blocks animation */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-4">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white/20 rounded-sm"
                          style={{
                            animationDelay: `${i * 0.05}s`,
                            animation: 'pixelPulse 2s ease-in-out infinite'
                          }}
                        />
                      ))}
                    </div>
                    <Gamepad2 className="w-24 h-24 text-white/40 relative z-10" />
                  </div>
                  {/* TV shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
                </div>
                {/* Game info label */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-400 font-bold text-sm">{game.name}</p>
                    <p className="text-gray-500 text-xs">{game.console}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating pixel particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animation: 'float 8s ease-in-out infinite'
              }}
            />
          ))}
        </div>

        {/* Neon glow lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-4 flex flex-col lg:flex-row items-center gap-16 px-4">

        {/* Left Side - Epic Branding */}
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-xl">
          {/* Logo with arcade cabinet style */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="relative">
                {/* Arcade cabinet top */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-3xl p-6 border-t-4 border-l-4 border-r-4 border-cyan-500">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-2xl opacity-60 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-5 rounded-2xl shadow-2xl">
                        <Gamepad2 className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h1 className="text-6xl font-black tracking-tighter leading-none mb-2">
                      <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" style={{
                        textShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
                      }}>
                        PLAYNOW
                      </span>
                      <span className="block text-white text-5xl" style={{
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                      }}>
                        EMU
                      </span>
                    </h1>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
                      <Star className="w-4 h-4 text-yellow-400" />
                      <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
                    </div>
                  </div>
                </div>
                {/* Arcade cabinet bottom */}
                <div className="bg-gray-900 border-4 border-cyan-500 rounded-b-3xl p-4 shadow-2xl shadow-cyan-500/20">
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white leading-tight">
                Relive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Golden Age</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Play 500+ classic games from NES, SNES, Genesis, and more. No downloads, instant play, with save states and multiplayer.
              </p>
            </div>

            {/* Retro Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: Gamepad2, value: '500+', label: 'RETRO GAMES', color: 'cyan' },
                { icon: Users, value: '50K+', label: 'PLAYERS', color: 'purple' },
                { icon: Trophy, value: '∞', label: 'FUN', color: 'yellow' }
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-gray-900/70 backdrop-blur-sm border-2 border-gray-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-300">
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2 mx-auto lg:mx-0`} />
                    <div className={`text-3xl font-black text-${stat.color}-400 mb-1`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 font-bold tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Zap, text: 'Instant Play' },
                { icon: Shield, text: 'Save States' },
                { icon: Sparkles, text: 'HD Graphics' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group px-4 py-2 bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-gray-800 hover:border-cyan-500/50 rounded-full transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <feature.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-cyan-300 text-sm font-bold">{feature.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Gaming Auth Terminal */}
        <div className="w-full lg:w-auto lg:min-w-[500px]">
          <div className="relative group">
            {/* Holographic glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500" />

            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-cyan-500/40 overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-cyan-500/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse" />
                    </div>
                    <span className="text-cyan-400 font-mono text-sm font-bold">
                      {mode === 'signin' ? '> PLAYER_LOGIN.EXE' : '> NEW_PLAYER.EXE'}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-md">
                    <span className="text-cyan-400 text-xs font-mono font-bold">ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
                    {mode === 'signin' ? (
                      <Shield className="w-10 h-10 text-white" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-4xl font-black text-white mb-2">
                    {mode === 'signin' ? (
                      <>
                        <span className="text-cyan-400">WELCOME</span> BACK
                      </>
                    ) : (
                      <>
                        <span className="text-purple-400">JOIN</span> THE GAME
                      </>
                    )}
                  </h3>
                  <p className="text-gray-400 font-mono text-sm">
                    {mode === 'signin' ? '// Continue your adventure' : '// Start your journey'}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="relative mb-8 p-1.5 bg-gray-950 rounded-2xl border-2 border-gray-800">
                  <div
                    className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/50 transition-transform duration-500 ease-out"
                    style={{
                      transform: mode === 'signin' ? 'translateX(calc(100% + 12px))' : 'translateX(0)'
                    }}
                  />
                  <div className="relative flex">
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`flex-1 py-4 rounded-xl font-black text-base transition-all duration-300 relative z-10 ${
                        mode === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      CREATE PLAYER
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className={`flex-1 py-4 rounded-xl font-black text-base transition-all duration-300 relative z-10 ${
                        mode === 'signin' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      PLAYER LOGIN
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 animate-pulse">
                      <p className="text-red-300 text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-cyan-400 text-xs font-black mb-3 uppercase tracking-wider">
                        <User className="w-3 h-3 inline mr-1" />
                        Player ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose your handle..."
                          required
                          className="w-full px-4 py-4 bg-gray-950 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-purple-400 text-xs font-black mb-3 uppercase tracking-wider">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="player@retro.gg"
                        required
                        className="w-full px-4 py-4 bg-gray-950 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-pink-400 text-xs font-black mb-3 uppercase tracking-wider">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter secure password"
                        required
                        className="w-full px-4 py-4 pr-12 bg-gray-950 border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-pink-400 focus:shadow-lg focus:shadow-pink-500/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-pink-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-black text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group shadow-lg shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>LOADING...</span>
                        </>
                      ) : (
                        <>
                          <span>{mode === 'signin' ? 'START GAME' : 'INSERT COIN'}</span>
                          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t-2 border-gray-900 text-center space-y-2">
                  <p className="text-xs text-gray-600 font-mono">
                    &gt; SECURED CONNECTION • 256-BIT ENCRYPTION
                  </p>
                  <p className="text-xs text-gray-700 font-mono">
                    v2.0.77 | PLAYNOWEMU RETRO GAMING NETWORK
                  </p>
                </div>
              </div>

              {/* Terminal Corner Brackets */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-cyan-400/50 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-purple-400/50 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-purple-400/50 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-pink-400/50 rounded-br-3xl" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pixelPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default CyberpunkAuth;
