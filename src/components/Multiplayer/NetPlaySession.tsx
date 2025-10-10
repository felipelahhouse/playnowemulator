import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Users, Wifi, Eye, Mic, MicOff, Camera, CameraOff, MessageCircle } from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useSessionManager } from '../../hooks/useSessionManager';

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
  const presenceRef = useRef<string | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  
  // Usar hook de gestão de sessão
  const { closeSession, leaveSession } = useSessionManager({
    sessionId,
    userId: user?.id || '',
    isHost,
    onSessionClosed: () => {
      console.log('⚠️ Sessão foi fechada');
      if (onClose) onClose();
      if (onLeave) onLeave();
    }
  });
  
  const handleClose = () => {
    if (isHost) {
      closeSession();
    } else {
      leaveSession();
    }
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
  const [gameLoaded, setGameLoaded] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  // Gerenciar presença e real-time com Firestore
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSession = async () => {
      try {
        // Criar documento de presença do jogador
        const playerPresenceRef = doc(db, 'game_sessions', sessionId, 'presence', user.id);
        presenceRef.current = user.id;

        await setDoc(playerPresenceRef, {
          userId: user.id,
          username: user.username,
          role: 'player',
          playerNumber: isHost ? 1 : 2,
          isReady: false,
          joinedAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
          gameId: gameId
        });

        // Listener para presença dos jogadores
        const presenceQuery = collection(db, 'game_sessions', sessionId, 'presence');
        const unsubPresence = onSnapshot(presenceQuery, (snapshot) => {
          const playersList: Player[] = [];
          let spectatorCount = 0;

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.role === 'player') {
              playersList.push({
                id: data.userId,
                username: data.username,
                player_number: data.playerNumber || 1,
                is_ready: data.isReady || false
              });
            } else if (data.role === 'spectator') {
              spectatorCount++;
            }
          });

          setPlayers(playersList);
          setSpectators(spectatorCount);
        });

        // Listener para inputs do jogo
        const gameInputsQuery = query(
          collection(db, 'game_sessions', sessionId, 'game_inputs'),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const unsubInputs = onSnapshot(gameInputsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              handleGameInput(data as GameState);
            }
          });
        });

        // Listener para sincronização do jogo
        const gameSyncQuery = query(
          collection(db, 'game_sessions', sessionId, 'game_sync'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        
        const unsubSync = onSnapshot(gameSyncQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              handleGameSync(data as GameState);
            }
          });
        });

        // Listener para chat
        const chatQuery = query(
          collection(db, 'game_sessions', sessionId, 'chat'),
          orderBy('timestamp', 'asc'),
          limit(100)
        );
        
        const unsubChat = onSnapshot(chatQuery, (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            messages.push({
              id: docSnap.id,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp?.toMillis() || Date.now()
            });
          });
          setChatMessages(messages.slice(-50));
        });

        unsubscribersRef.current = [unsubPresence, unsubInputs, unsubSync, unsubChat];
        setConnected(true);

        // Atualizar lastSeen periodicamente
        const heartbeatInterval = setInterval(async () => {
          if (presenceRef.current) {
            await updateDoc(playerPresenceRef, {
              lastSeen: serverTimestamp()
            });
          }
        }, 3000);

        // Medir latência periodicamente
        const pingInterval = setInterval(() => {
          const start = Date.now();
          // Simular ping usando tempo de resposta do Firestore
          updateDoc(playerPresenceRef, { lastSeen: serverTimestamp() })
            .then(() => {
              setLatency(Date.now() - start);
            })
            .catch(() => setLatency(999));
        }, 5000);

        return () => {
          clearInterval(heartbeatInterval);
          clearInterval(pingInterval);
        };
      } catch (error) {
        console.error('Error setting up realtime session:', error);
        setConnected(false);
      }
    };

    setupRealtimeSession();

    return () => {
      // Cleanup: remover presença e listeners
      const cleanup = async () => {
        try {
          // Unsubscribe de todos os listeners
          unsubscribersRef.current.forEach(unsub => unsub());
          unsubscribersRef.current = [];

          if (!user?.id) return;

          console.log(`[🚪 SAINDO] Jogador ${user.username} saindo da sessão ${sessionId}`);
          console.log(`[🚪 SAINDO] É host? ${isHost}`);

          // Remover documento de presença
          if (presenceRef.current) {
            await deleteDoc(doc(db, 'game_sessions', sessionId, 'presence', presenceRef.current));
          }

          // Se for o host, deletar a sala inteira
          if (isHost) {
            console.log('[🗑️ HOST SAINDO] Deletando sala e todos os dados...');

            const batch = writeBatch(db);

            // Deletar subcoleções
            const subcollections = ['presence', 'players', 'game_inputs', 'game_sync', 'chat'];
            
            for (const subcol of subcollections) {
              const snapshot = await getDocs(collection(db, 'game_sessions', sessionId, subcol));
              snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
              });
            }

            // Deletar a sessão principal
            batch.delete(doc(db, 'game_sessions', sessionId));

            await batch.commit();
            console.log('[✓] Sala e todos os dados deletados com sucesso!');
            return;
          }

          // Se não for host, apenas remover este jogador
          const playerDocRef = doc(db, 'game_sessions', sessionId, 'players', user.id);
          await deleteDoc(playerDocRef);

          console.log(`[✓] Jogador ${user.username} removido da sala`);

          // Verificar quantos jogadores restaram
          const playersSnapshot = await getDocs(collection(db, 'game_sessions', sessionId, 'players'));
          const playerCount = playersSnapshot.size;

          console.log(`[📊] Jogadores restantes: ${playerCount}`);

          // Se não sobrou ninguém, deletar a sala
          if (playerCount === 0) {
            console.log('[🗑️ SALA VAZIA] Não há mais jogadores, deletando sala...');

            const batch = writeBatch(db);

            // Deletar subcoleções
            const subcollections = ['presence', 'game_inputs', 'game_sync', 'chat'];
            
            for (const subcol of subcollections) {
              const snapshot = await getDocs(collection(db, 'game_sessions', sessionId, subcol));
              snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
              });
            }

            batch.delete(doc(db, 'game_sessions', sessionId));
            await batch.commit();

            console.log('[✓] Sala vazia deletada com sucesso!');
          } else {
            // Atualizar contagem de jogadores
            await updateDoc(doc(db, 'game_sessions', sessionId), {
              currentPlayers: playerCount
            });

            console.log(`[✓] Contagem de jogadores atualizada: ${playerCount}`);
          }
        } catch (error) {
          console.error('Error cleaning up session:', error);
        }
      };

      cleanup();
    };
  }, [sessionId, user, isHost, gameId]);

  // Comunicação com o emulador via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Detectar quando o jogo carregar
      if (event.data.type === 'emulator-ready' || event.data.type === 'game-loaded') {
        setGameLoaded(true);
        setConnected(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
      
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

  const broadcastInput = useCallback(async (inputData: any) => {
    if (!user) return;

    const gameState: GameState = {
      type: 'input',
      player_id: user.id,
      data: inputData,
      frame: currentFrame,
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, 'game_sessions', sessionId, 'game_inputs'), {
        ...gameState,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error broadcasting input:', error);
    }
  }, [user, currentFrame, sessionId]);

  const broadcastSync = useCallback(async (syncData: any) => {
    if (!user || !isHost) return;

    const gameState: GameState = {
      type: 'sync',
      player_id: user.id,
      data: syncData,
      frame: currentFrame,
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, 'game_sessions', sessionId, 'game_sync'), {
        ...gameState,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error broadcasting sync:', error);
    }
  }, [user, isHost, currentFrame, sessionId]);

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

  const sendChatMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    try {
      await addDoc(collection(db, 'game_sessions', sessionId, 'chat'), {
        userId: user.id,
        username: user.username,
        message: message.trim(),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const toggleReady = async () => {
    if (!user?.id || !presenceRef.current) return;

    const currentPlayer = players.find(p => p.id === user.id);
    const newReadyState = !currentPlayer?.is_ready;

    try {
      await updateDoc(doc(db, 'game_sessions', sessionId, 'presence', presenceRef.current), {
        isReady: newReadyState,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling ready state:', error);
    }
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
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {/* Mensagem de aviso que aparece inicialmente */}
          {showWarning && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900/95 px-6 py-4 rounded-xl border border-cyan-500 max-w-2xl animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎮</div>
                <div>
                  <h4 className="text-white font-bold mb-2">Sala Multiplayer Criada!</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    O jogo está carregando... Enquanto isso:
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1 ml-4">
                    <li>✅ Compartilhe o link da sala com seus amigos</li>
                    <li>✅ Use o chat para se comunicar</li>
                    <li>✅ {isHost ? 'Você é o HOST - o jogo rodará na sua tela' : 'Aguarde o host iniciar o jogo'}</li>
                  </ul>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="mt-3 text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                  >
                    Entendi, fechar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Indicador de carregamento do jogo */}
          {!gameLoaded && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-cyan-400 font-bold">Carregando jogo...</p>
              <p className="text-gray-500 text-sm mt-2">
                {players.length} jogador(es) na sala
              </p>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            title={`${gameTitle || 'NetPlay Game'} NetPlay`}
            src={`/new-snes-player.html?rom=${encodeURIComponent(romPath)}&title=${encodeURIComponent(gameTitle || 'Multiplayer Game')}`}
            className="w-full h-full"
            allow="fullscreen"
            onLoad={() => {
              console.log('🎮 Iframe carregado');
              // Dar tempo para o emulador inicializar
              setTimeout(() => {
                if (!gameLoaded) {
                  setGameLoaded(true);
                  setConnected(true);
                }
              }, 5000);
            }}
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
