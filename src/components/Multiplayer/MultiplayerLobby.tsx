import { useEffect, useMemo, useState } from 'react';
import { X, Users, Lock, Unlock, Play, Clock, Radio, Crown, Loader2 } from 'lucide-react';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface FirestoreSession {
  hostUserId?: string;
  gameId?: string;
  sessionName?: string;
  isPublic?: boolean;
  maxPlayers?: number;
  currentPlayers?: number;
  status?: string;
  createdAt?: Timestamp | string;
}

interface GameSession {
  id: string;
  hostUserId: string | null;
  gameId: string;
  sessionName: string;
  isPublic: boolean;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  createdAt: string;
  host?: {
    username: string;
  };
  game?: {
    title: string;
    thumbnailUrl?: string | null;
  };
}

interface MultiplayerLobbyProps {
  onClose: () => void;
  onJoinSession: (sessionId: string) => void;
}

interface GameOption {
  id: string;
  title: string;
}

const normalizeTimestamp = (value?: Timestamp | string | Date | null): string => {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  if (typeof (value as any)?.toDate === 'function') {
    try {
      return (value as any).toDate().toISOString();
    } catch (error) {
      console.warn('Failed to normalize timestamp', error);
    }
  }
  return new Date().toISOString();
};

const getTimeAgo = (isoDate: string) => {
  const created = new Date(isoDate).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - created) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onClose, onJoinSession }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [games, setGames] = useState<GameOption[]>([]);
  const [creatingSession, setCreatingSession] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const [newSession, setNewSession] = useState({
    gameId: '',
    sessionName: '',
    isPublic: true,
    maxPlayers: 4
  });

  const sessionsQuery = useMemo(() => {
    return query(
      collection(db, 'game_sessions'),
      where('status', '==', 'waiting'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        (async () => {
          const rawSessions = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as FirestoreSession)
          }));

          if (!active) return;

          const hostIds = Array.from(
            new Set(
              rawSessions
                .map((session) => session.hostUserId ?? null)
                .filter((value): value is string => Boolean(value))
            )
          );

          const gameIds = Array.from(
            new Set(
              rawSessions
                .map((session) => session.gameId ?? null)
                .filter((value): value is string => Boolean(value))
            )
          );

          const hostMap = new Map<string, { username: string }>();
          await Promise.all(
            hostIds.map(async (hostId) => {
              try {
                const hostDoc = await getDoc(doc(db, 'users', hostId));
                if (hostDoc.exists()) {
                  const data = hostDoc.data() as any;
                  hostMap.set(hostId, { username: data.username ?? 'Host' });
                }
              } catch (error) {
                console.warn('Failed to load host', hostId, error);
              }
            })
          );

          const gameMap = new Map<string, { title: string; thumbnailUrl?: string | null }>();
          await Promise.all(
            gameIds.map(async (gameId) => {
              try {
                const gameDoc = await getDoc(doc(db, 'games', gameId));
                if (gameDoc.exists()) {
                  const data = gameDoc.data() as any;
                  gameMap.set(gameId, {
                    title: data.title ?? 'Game',
                    thumbnailUrl: data.thumbnailUrl ?? data.imageUrl ?? data.image_url ?? null
                  });
                }
              } catch (error) {
                console.warn('Failed to load game', gameId, error);
              }
            })
          );

          const enrichedSessions: GameSession[] = rawSessions.map((session) => {
            const hostUserId = session.hostUserId ?? null;
            const gameId = session.gameId ?? '';

            return {
              id: session.id,
              hostUserId,
              gameId,
              sessionName: session.sessionName ?? 'Sala sem nome',
              isPublic: session.isPublic !== false,
              maxPlayers: session.maxPlayers ?? 4,
              currentPlayers: session.currentPlayers ?? 0,
              status: session.status ?? 'waiting',
              createdAt: normalizeTimestamp(session.createdAt),
              host: hostUserId ? hostMap.get(hostUserId) : undefined,
              game: gameId ? gameMap.get(gameId) : undefined
            } satisfies GameSession;
          });

          if (active) {
            setSessions(enrichedSessions);
            setLoading(false);
          }
        })().catch((error) => {
          console.error('Failed to process sessions', error);
          if (active) {
            setSessions([]);
            setLoading(false);
          }
        });
      },
      (error) => {
        console.error('Failed to subscribe to sessions', error);
        if (active) {
          setSessions([]);
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [sessionsQuery]);

  useEffect(() => {
    let active = true;

    const loadGames = async () => {
      try {
        const gamesQuery = query(collection(db, 'games'), orderBy('title'));
        const gamesSnapshot = await getDocs(gamesQuery);
        if (!active) return;
        const options: GameOption[] = gamesSnapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            title: data.title ?? 'Game'
          } satisfies GameOption;
        });
        setGames(options);
      } catch (error) {
        console.warn('Failed to load games list', error);
        if (active) {
          setGames([]);
        }
      }
    };

    loadGames();
    return () => {
      active = false;
    };
  }, []);

  const createSession = async () => {
    if (!user?.id) {
      setCreationError('Você precisa estar logado para criar uma sala.');
      return;
    }

    if (!newSession.gameId) {
      setCreationError('Selecione um jogo antes de criar a sala.');
      return;
    }

    if (!newSession.sessionName.trim()) {
      setCreationError('Digite um nome para a sala.');
      return;
    }

    if (creatingSession) {
      return;
    }

    setCreatingSession(true);
    setCreationError(null);

    try {
      const gameDoc = await getDoc(doc(db, 'games', newSession.gameId));
      if (!gameDoc.exists()) {
        throw new Error('Jogo selecionado não encontrado. Recarregue a lista e tente novamente.');
      }

      const sessionRef = doc(collection(db, 'game_sessions'));

      const batch = writeBatch(db);
      batch.set(sessionRef, {
        host_user_id: user.id,
        hostUserId: user.id, // Compatibilidade
        game_id: newSession.gameId,
        gameId: newSession.gameId, // Compatibilidade
        sessionName: newSession.sessionName.trim(),
        isPublic: newSession.isPublic,
        maxPlayers: newSession.maxPlayers,
        currentPlayers: 1,
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      batch.set(doc(sessionRef, 'players', user.id), {
        userId: user.id,
        username: user.username,
        playerNumber: 1,
        isReady: false,
        joinedAt: serverTimestamp()
      });

      await batch.commit();

      setNewSession({
        gameId: '',
        sessionName: '',
        isPublic: true,
        maxPlayers: 4
      });

      setShowCreateModal(false);

      setTimeout(() => {
        onJoinSession(sessionRef.id);
      }, 300);
    } catch (error: any) {
      console.error('Failed to create session', error);
      setCreationError(error?.message ?? 'Erro ao criar sala. Tente novamente.');
    } finally {
      setCreatingSession(false);
    }
  };

  const joinSession = async (session: GameSession) => {
    if (!user?.id) {
      return;
    }

    try {
      const sessionRef = doc(db, 'game_sessions', session.id);
      const playerRef = doc(sessionRef, 'players', user.id);

      await runTransaction(db, async (transaction) => {
        const sessionSnapshot = await transaction.get(sessionRef);
        if (!sessionSnapshot.exists()) {
          throw new Error('Sala não encontrada ou já foi encerrada.');
        }

        const sessionData = sessionSnapshot.data() as FirestoreSession;
        const maxPlayers = sessionData.maxPlayers ?? session.maxPlayers;
        const currentPlayers = sessionData.currentPlayers ?? session.currentPlayers;

        if (currentPlayers >= maxPlayers) {
          throw new Error('Sala está cheia.');
        }

        const existingPlayer = await transaction.get(playerRef);
        if (!existingPlayer.exists()) {
          transaction.set(playerRef, {
            userId: user.id,
            username: user.username,
            playerNumber: Math.min(maxPlayers, currentPlayers + 1),
            isReady: false,
            joinedAt: serverTimestamp()
          });

          transaction.update(sessionRef, {
            currentPlayers: increment(1),
            updatedAt: serverTimestamp()
          });
        }
      });

      onJoinSession(session.id);
    } catch (error: any) {
      console.error('Failed to join session', error);
      alert(error?.message ?? 'Erro ao entrar na sala. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl bg-gray-900 rounded-3xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">Salas Multiplayer</h2>
              <p className="text-cyan-400 font-mono text-sm">// Crie sua sala ou entre em uma existente</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <Crown className="w-5 h-5" />
                <span>Criar Sala (HOST)</span>
              </button>
              <button onClick={onClose} className="p-3 hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded-xl h-48" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Nenhuma Sala Ativa</h3>
              <p className="text-gray-500 mb-6">Seja o primeiro a criar uma sala multiplayer!</p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  <span>Criar Sala como HOST</span>
                </button>
                <p className="text-gray-600 text-sm">Como HOST você cria a sala e outros jogadores podem entrar</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => {
                const isFull = session.currentPlayers >= session.maxPlayers;
                const isMySession = session.hostUserId === user?.id;

                return (
                  <div
                    key={session.id}
                    className={`group relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${
                      isFull
                        ? 'border-red-500/30 opacity-60'
                        : isMySession
                        ? 'border-purple-500/50 hover:border-purple-400'
                        : 'border-gray-700 hover:border-cyan-400/50 hover:scale-105'
                    }`}
                  >
                    {isMySession && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/90 backdrop-blur-sm border border-purple-400 rounded-full shadow-lg shadow-purple-500/50">
                          <Crown className="w-4 h-4 text-yellow-300" />
                          <span className="text-white text-xs font-bold">MINHA SALA</span>
                        </span>
                      </div>
                    )}
                    {isFull && !isMySession && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm border border-red-400 rounded-full text-white text-xs font-bold">
                          CHEIA
                        </span>
                      </div>
                    )}

                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />

                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {session.isPublic ? (
                              <Unlock className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-xs font-bold ${session.isPublic ? 'text-green-400' : 'text-red-400'}`}>
                              {session.isPublic ? 'PÚBLICA' : 'PRIVADA'}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {session.sessionName}
                          </h3>
                          <p className="text-gray-400 text-sm">{session.game?.title || 'Carregando jogo...'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
                            {session.host?.username?.[0]?.toUpperCase() || 'H'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-bold">{session.host?.username || 'Host'}</p>
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                                <Crown className="w-3 h-3 text-yellow-400" />
                                <span className="text-yellow-400 text-xs font-bold">HOST</span>
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs">Criador da sala</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${
                            isFull ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/10 border-cyan-500/30'
                          }`}>
                            <Users className={`w-4 h-4 ${isFull ? 'text-red-400' : 'text-cyan-400'}`} />
                            <span className={`font-bold text-sm ${isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                              {session.currentPlayers}/{session.maxPlayers}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeAgo(session.createdAt)}</span>
                        </div>

                        {isMySession ? (
                          <button
                            onClick={() => onJoinSession(session.id)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Abrir Sala</span>
                          </button>
                        ) : isFull ? (
                          <button
                            disabled
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 rounded-lg font-bold opacity-50 cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            <span>Cheia</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => joinSession(session)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                          >
                            <Play className="w-4 h-4" />
                            <span>Entrar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl border-2 border-cyan-500/30 p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Criar Sala Multiplayer
                </h3>
                <p className="text-cyan-400 text-sm mt-1">
                  ✨ Você será o <strong>HOST</strong> - Outros jogadores poderão entrar na sua sala
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
              <p className="text-cyan-300 text-sm">
                💡 <strong>Como funciona:</strong><br />1️⃣ Você cria a sala e vira o HOST<br />2️⃣ A sala aparece na lista para outros jogadores<br />3️⃣ Outros jogadores clicam em "Entrar" para jogar com você<br />4️⃣ Quando todos estiverem prontos, o jogo começa!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Nome da Sala</label>
                <input
                  type="text"
                  value={newSession.sessionName}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, sessionName: e.target.value }))}
                  placeholder="Minha Sala Épica"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Selecionar Jogo</label>
                <select
                  value={newSession.gameId}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, gameId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Escolha um jogo...</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Máximo de Jogadores</label>
                <select
                  value={newSession.maxPlayers}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, maxPlayers: parseInt(e.target.value, 10) }))}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} Jogadores
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newSession.isPublic}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-5 h-5 accent-cyan-500"
                />
                <label htmlFor="is_public" className="text-white font-medium">
                  Sala Pública (qualquer um pode entrar)
                </label>
              </div>

              <button
                onClick={createSession}
                disabled={creatingSession || !newSession.gameId || !newSession.sessionName.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingSession ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Criando sala...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Criar Sala como HOST</span>
                  </>
                )}
              </button>

              {(!newSession.sessionName.trim() || !newSession.gameId) && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <strong>⚠️ Preencha todos os campos:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {!newSession.sessionName.trim() && <li>Nome da sala</li>}
                    {!newSession.gameId && <li>Selecione um jogo</li>}
                  </ul>
                </div>
              )}

              {creationError && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <strong>❌ Erro ao criar sala:</strong>
                  <span className="ml-1">{creationError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerLobby;
