import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Users, Wifi, Eye, Mic, MicOff, Camera, CameraOff, MessageCircle } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface NetPlaySessionProps {
  sessionId: string;
  gameId: string;
  gameTitle?: string;
  romPath: string;
  isHost: boolean;
  onClose?: () => void;
  onLeave?: () => void;
}

interface Player {
  id: string;
  username: string;
  player_number: number;
  is_ready: boolean;
}

interface GameState {
  type: 'input' | 'sync' | 'pause' | 'resume';
  player_id: string;
  data: any;
  frame: number;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

const NetPlaySession: React.FC<NetPlaySessionProps> = ({
  sessionId,
  gameId,
  gameTitle,
  romPath,
  isHost,
  onClose,
  onLeave
}) => {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const channelRef = useRef<any>(null);
  
  const handleClose = () => {
    if (onClose) onClose();
    if (onLeave) onLeave();
  };
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<number>(0);
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Conectar ao canal de realtime
  useEffect(() => {
    const channel = supabase.channel(`netplay-${sessionId}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        
        // Separar players e espectadores
        const playersList: Player[] = [];
        const seenPlayers = new Set<string>();
        let spectatorCount = 0;

        Object.values(state).forEach((presences: any) => {
          const presence = presences[0];
          if (presence.role === 'player' && !seenPlayers.has(presence.user_id)) {
            seenPlayers.add(presence.user_id);
            playersList.push({
              id: presence.user_id,
              username: presence.username,
              player_number: presence.player_number || 1,
              is_ready: presence.is_ready || false
            });
          } else if (presence.role === 'spectator') {
            spectatorCount++;
          }
        });

        setPlayers(playersList);
        setSpectators(spectatorCount);
      })
      .on('broadcast', { event: 'game-input' }, (payload: any) => {
        handleGameInput(payload.payload);
      })
      .on('broadcast', { event: 'game-sync' }, (payload: any) => {
        handleGameSync(payload.payload);
      })
      .on('broadcast', { event: 'chat-message' }, (payload: any) => {
        const msg: ChatMessage = payload.payload;
        setChatMessages(prev => [...prev.slice(-50), msg]);
      })
      .on('broadcast', { event: 'ping' }, (payload: any) => {
        if (payload.payload.to === user?.id) {
          channel.send({
            type: 'broadcast',
            event: 'pong',
            payload: {
              to: payload.payload.from,
              timestamp: payload.payload.timestamp
            }
          });
        }
      })
      .on('broadcast', { event: 'pong' }, (payload: any) => {
        if (payload.payload.to === user?.id) {
          const latencyMs = Date.now() - payload.payload.timestamp;
          setLatency(latencyMs);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            username: user?.username,
            role: 'player',
            player_number: isHost ? 1 : 2,
            is_ready: false,
            joined_at: new Date().toISOString(),
            game_id: gameId
          });
          setConnected(true);
        }
      });

    // Ping periódico para medir latência
    const pingInterval = setInterval(() => {
      if (channel && connected) {
        channel.send({
          type: 'broadcast',
          event: 'ping',
          payload: {
            from: user?.id,
            to: 'all',
            timestamp: Date.now()
          }
        });
      }
    }, 2000);

    return () => {
      clearInterval(pingInterval);
      
      // Remover jogador da sessão ao sair
      const cleanup = async () => {
        try {
          await channel.untrack();
          
          console.log(`[🚪 SAINDO] Jogador ${user?.username} saindo da sessão ${sessionId}`);
          console.log(`[🚪 SAINDO] É host? ${isHost}`);
          
          // Se for o host, deletar a sala inteira
          if (isHost) {
            console.log('[🗑️ HOST SAINDO] Deletando sala e todos os jogadores...');
            
            // Deletar todos os jogadores da sala primeiro
            const { error: playersDeleteError } = await supabase
              .from('session_players')
              .delete()
              .eq('session_id', sessionId);
            
            if (playersDeleteError) {
              console.error('[❌] Erro ao deletar jogadores:', playersDeleteError);
            } else {
              console.log('[✓] Jogadores removidos da sala');
            }
            
            // Deletar a sala
            const { error: sessionDeleteError } = await supabase
              .from('game_sessions')
              .delete()
              .eq('id', sessionId);
            
            if (sessionDeleteError) {
              console.error('[❌] Erro ao deletar sala:', sessionDeleteError);
            } else {
              console.log('[✓] Sala deletada com sucesso!');
            }
            
            return; // Sai aqui pois já deletou tudo
          }
          
          // Se não for host, apenas remover este jogador
          await supabase
            .from('session_players')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', user?.id);
          
          console.log(`[✓] Jogador ${user?.username} removido da sala`);
          
          // Verificar quantos jogadores restaram
          const { count: playerCount } = await supabase
            .from('session_players')
            .select('*', { count: 'exact' })
            .eq('session_id', sessionId);
          
          console.log(`[📊] Jogadores restantes: ${playerCount || 0}`);
          
          // Se não sobrou ninguém, deletar a sala
          if (!playerCount || playerCount === 0) {
            console.log('[🗑️ SALA VAZIA] Não há mais jogadores, deletando sala...');
            
            const { error: sessionDeleteError } = await supabase
              .from('game_sessions')
              .delete()
              .eq('id', sessionId);
            
            if (sessionDeleteError) {
              console.error('[❌] Erro ao deletar sala vazia:', sessionDeleteError);
            } else {
              console.log('[✓] Sala vazia deletada com sucesso!');
            }
          } else {
            // Atualizar contagem de jogadores
            await supabase
              .from('game_sessions')
              .update({ current_players: playerCount })
              .eq('id', sessionId);
            
            console.log(`[✓] Contagem de jogadores atualizada: ${playerCount}`);
          }
        } catch (error) {
          console.error('Error cleaning up session:', error);
        }
      };
      
      cleanup();
      channel.unsubscribe();
    };
  }, [sessionId, user, isHost, connected, gameId]);

  // Comunicação com o emulador via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'emulator-input') {
        broadcastInput(event.data);
      } else if (event.data.type === 'emulator-frame') {
        setCurrentFrame(event.data.frame);
        
        // Host envia sincronização completa a cada 60 frames
        if (isHost && event.data.frame % 60 === 0) {
          broadcastSync(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isHost]);

  const broadcastInput = useCallback((inputData: any) => {
    if (!channelRef.current || !user) return;

    const gameState: GameState = {
      type: 'input',
      player_id: user.id,
      data: inputData,
      frame: currentFrame,
      timestamp: Date.now()
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'game-input',
      payload: gameState
    });
  }, [user, currentFrame]);

  const broadcastSync = useCallback((syncData: any) => {
    if (!channelRef.current || !user || !isHost) return;

    const gameState: GameState = {
      type: 'sync',
      player_id: user.id,
      data: syncData,
      frame: currentFrame,
      timestamp: Date.now()
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'game-sync',
      payload: gameState
    });
  }, [user, isHost, currentFrame]);

  const handleGameInput = (gameState: GameState) => {
    // Não processar nossos próprios inputs
    if (gameState.player_id === user?.id) return;

    // Enviar input para o emulador
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        messageType: 'netplay-input',
        type: gameState.type,
        player_id: gameState.player_id,
        data: gameState.data,
        frame: gameState.frame,
        timestamp: gameState.timestamp
      }, '*');
    }
  };

  const handleGameSync = (gameState: GameState) => {
    // Apenas clients processam sync do host
    if (isHost) return;

    // Enviar estado de sincronização para o emulador
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        messageType: 'netplay-sync',
        type: gameState.type,
        player_id: gameState.player_id,
        data: gameState.data,
        frame: gameState.frame,
        timestamp: gameState.timestamp
      }, '*');
    }
  };

  const sendChatMessage = (message: string) => {
    if (!channelRef.current || !user || !message.trim()) return;

    const chatMsg: ChatMessage = {
      id: `${user.id}-${Date.now()}`,
      username: user.username,
      message: message.trim(),
      timestamp: Date.now()
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: chatMsg
    });

    setChatMessages(prev => [...prev.slice(-50), chatMsg]);
  };

  const toggleReady = async () => {
    if (!channelRef.current) return;

    const currentPlayer = players.find(p => p.id === user?.id);
    const newReadyState = !currentPlayer?.is_ready;

    await channelRef.current.track({
      user_id: user?.id,
      username: user?.username,
      role: 'player',
      player_number: isHost ? 1 : 2,
      is_ready: newReadyState,
      joined_at: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-white font-bold">
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

            <div className="h-6 w-px bg-gray-700" />

            <div className="flex items-center gap-2 text-purple-400">
              <Users className="w-4 h-4" />
              <span className="font-bold">{players.length} Players</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="font-bold">{spectators} Watching</span>
            </div>

            <div className="flex items-center gap-2 text-cyan-400">
              <Wifi className="w-4 h-4" />
              <span className="font-bold">{latency}ms</span>
            </div>

            {isHost && (
              <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full">
                <span className="text-yellow-500 font-bold text-xs">HOST</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`p-2 rounded-lg transition-all ${
                micEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`p-2 rounded-lg transition-all ${
                cameraEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleClose}
              className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <iframe
            ref={iframeRef}
            title={`${gameTitle || 'NetPlay Game'} NetPlay`}
            src={`/new-snes-player.html?rom=${encodeURIComponent(romPath)}&title=${encodeURIComponent(gameTitle || 'Multiplayer Game')}&netplay=true&session=${sessionId}`}
            className="w-full h-full"
            allow="fullscreen"
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900/90 border-l border-gray-800 flex flex-col">
          {/* Players List */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Players
            </h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-sm font-bold text-white">
                      P{player.player_number}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{player.username}</p>
                      <p className="text-gray-500 text-xs">Player {player.player_number}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${player.is_ready ? 'bg-green-500' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>

            <button
              onClick={toggleReady}
              className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              {players.find(p => p.id === user?.id)?.is_ready ? 'Not Ready' : 'Ready'}
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <h3 className="text-white font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Chat
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="animate-slide-up">
                  <p className="text-cyan-400 text-xs font-bold">{msg.username}</p>
                  <p className="text-white text-sm break-words">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-800">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendChatMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frame Counter (Debug) */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 rounded-lg text-xs text-gray-400 font-mono">
        Frame: {currentFrame}
      </div>
    </div>
  );
};

export default NetPlaySession;
