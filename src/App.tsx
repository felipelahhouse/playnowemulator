import { useState } from 'react';
import { AuthProvider, useAuth, supabase } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HeroSection from './components/Hero/HeroSection';
import GameLibrary from './components/Games/GameLibrary';
import CyberpunkAuth from './components/Auth/CyberpunkAuth';
import LiveStreamGrid from './components/Streaming/LiveStreamGrid';
import MultiplayerLobby from './components/Multiplayer/MultiplayerLobby';
import NetPlaySession from './components/Multiplayer/NetPlaySession';
import StreamerView from './components/Streaming/StreamerView';
import StreamSetupModal, { StreamConfig } from './components/Streaming/StreamSetupModal';
import type { Game } from './types';

interface NetPlaySessionData {
  sessionId: string;
  gameId: string;
  gameTitle?: string;
  romPath: string;
  isHost: boolean;
}

interface StreamingData {
  gameId: string;
  romPath: string;
  gameTitle?: string;
}

interface StreamSetupData {
  game: Game;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'streams' | 'games' | 'multiplayer'>('games');
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [netPlaySession, setNetPlaySession] = useState<NetPlaySessionData | null>(null);
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [streamSetupData, setStreamSetupData] = useState<StreamSetupData | null>(null);

  const handleStartStream = (game: Game) => {
    // Abrir modal de configuração primeiro
    setStreamSetupData({ game });
  };

  const handleConfirmStreamSetup = (config: StreamConfig) => {
    if (!streamSetupData) return;
    
    // Agora sim inicia a stream com as configurações
    setStreamingData({
      gameId: streamSetupData.game.id,
      romPath: streamSetupData.game.rom_url,
      gameTitle: config.title, // Usa o título personalizado
      ...config // Passa todas as configurações
    } as any);
    
    setStreamSetupData(null);
  };

  const handleCreateMultiplayer = (game: Game) => {
    console.log('🎮 Criar multiplayer para:', game.title);
    // Abre o lobby de multiplayer direto para criar sala com esse jogo
    setShowMultiplayerLobby(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-400 rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-b-pink-400 border-l-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
              PLAYNOWEMU
            </h1>
            <p className="text-gray-500 text-sm font-mono tracking-wider">// INITIALIZING GAMING MATRIX</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <CyberpunkAuth />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main>
        <HeroSection />

        <div className="bg-black border-t border-gray-800">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-4 py-6">
              <button
                onClick={() => setCurrentView('streams')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentView === 'streams'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Live Streams
              </button>
              <button
                onClick={() => setCurrentView('games')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentView === 'games'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Game Library
              </button>
              <button
                onClick={() => setShowMultiplayerLobby(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
              >
                Multiplayer Lobbies
              </button>
            </div>
          </div>
        </div>

        {currentView === 'streams' && (
          <LiveStreamGrid />
        )}

        {currentView === 'games' && (
          <GameLibrary 
            onStartStream={handleStartStream}
            onCreateMultiplayer={handleCreateMultiplayer}
          />
        )}
      </main>

      {showMultiplayerLobby && (
        <MultiplayerLobby
          onClose={() => setShowMultiplayerLobby(false)}
          onJoinSession={(sessionId) => {
            console.log('🚀 Abrindo sessão:', sessionId);
            setShowMultiplayerLobby(false);
            
            // Buscar dados da sessão para abrir o jogo
            supabase
              .from('game_sessions')
              .select(`
                *,
                game:games!game_sessions_game_id_fkey(title, rom_url)
              `)
              .eq('id', sessionId)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error('❌ Erro ao buscar sessão:', error);
                  alert('Erro ao entrar na sala. Tente novamente.');
                  return;
                }
                
                if (data && data.game) {
                  console.log('✅ Sessão encontrada:', data);
                  setNetPlaySession({
                    sessionId: data.id,
                    gameId: data.game_id,
                    gameTitle: data.game.title,
                    romPath: data.game.rom_url,
                    isHost: data.host_id === user?.id
                  });
                } else {
                  console.error('❌ Dados da sessão incompletos');
                  alert('Erro: Dados da sala incompletos.');
                }
              });
          }}
        />
      )}

      {netPlaySession && (
        <NetPlaySession
          sessionId={netPlaySession.sessionId}
          gameId={netPlaySession.gameId}
          gameTitle={netPlaySession.gameTitle}
          romPath={netPlaySession.romPath}
          isHost={netPlaySession.isHost}
          onLeave={() => setNetPlaySession(null)}
        />
      )}

      {streamingData && (
        <StreamerView
          gameId={streamingData.gameId}
          romPath={streamingData.romPath}
          gameTitle={streamingData.gameTitle}
          onEndStream={() => setStreamingData(null)}
        />
      )}

      {streamSetupData && (
        <StreamSetupModal
          gameTitle={streamSetupData.game.title}
          onStartStream={handleConfirmStreamSetup}
          onCancel={() => setStreamSetupData(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
