import React, { useState, useEffect } from 'react';
import { X, Users, Lock, Unlock, Play, Clock, Radio, Crown, Loader2 } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface GameSession {
  id: string;
  host_user_id?: string;
  host_id?: string;
  game_id: string;
  session_name: string;
  is_public: boolean;
  max_players: number;
  current_players: number;
  status: string;
  created_at: string;
  host?: {
    username: string;
  };
  game?: {
    title: string;
    thumbnail_url: string;
  };
}

interface MultiplayerLobbyProps {
  onClose: () => void;
  onJoinSession: (sessionId: string) => void;
}

const resolveHostId = (session: { host_user_id?: string; host_id?: string }) =>
  session.host_user_id ?? session.host_id ?? null;

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onClose, onJoinSession }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [newSession, setNewSession] = useState({
    game_id: '',
    session_name: '',
    is_public: true,
    max_players: 4
  });
  const [creatingSession, setCreatingSession] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchGames();

    // Atualizar salas a cada 5 segundos
    const refreshInterval = setInterval(() => {
      fetchSessions();
    }, 5000);

    // Listener em tempo real para mudanças nas salas
    const channel = supabase
      .channel('game_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      const sessionsData = data || [];
      const hostIds = Array.from(
        new Set(
          sessionsData
            .map((session) => resolveHostId(session))
            .filter((value): value is string => Boolean(value))
        )
      );
      const gameIds = Array.from(new Set(sessionsData.map((session) => session.game_id).filter(Boolean)));

      let hostMap: Record<string, { username: string }> = {};
      if (hostIds.length > 0) {
        const { data: hosts, error: hostError } = await supabase
          .from('users')
          .select('id, username')
          .in('id', hostIds);

        if (hostError) {
          console.error('Error fetching hosts:', hostError);
        } else if (hosts) {
          hostMap = hosts.reduce((acc, host) => {
            acc[host.id] = { username: host.username };
            return acc;
          }, {} as Record<string, { username: string }>);
        }
      }

      let gamesMap: Record<string, { title: string; thumbnail_url?: string | null }> = {};
      if (gameIds.length > 0) {
        const { data: relatedGames, error: gameError } = await supabase
          .from('games')
          .select('id, title, thumbnail_url, image_url')
          .in('id', gameIds);

        if (gameError) {
          console.error('Error fetching games:', gameError);
        } else if (relatedGames) {
          gamesMap = relatedGames.reduce((acc, game) => {
            acc[game.id] = {
              title: game.title,
              thumbnail_url: game.thumbnail_url ?? game.image_url ?? null
            };
            return acc;
          }, {} as Record<string, { title: string; thumbnail_url?: string | null }>);
        }
      }

      const enrichedSessions = sessionsData.map((session) => {
        const resolvedHostId = resolveHostId(session);

        return {
          ...session,
          host_user_id: resolvedHostId ?? session.host_user_id,
          host: resolvedHostId ? hostMap[resolvedHostId] : undefined,
          game: gamesMap[session.game_id]
        };
      });

      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('title');
    setGames(data || []);
  };

  const createSession = async () => {
    console.log('🎮 Tentando criar sala...');
    console.log('User:', user);
    console.log('Game ID:', newSession.game_id);
    console.log('Session Name:', newSession.session_name);

    if (creatingSession) {
      console.warn('⚠️ Já existe uma criação de sala em andamento. Aguarde.');
      return;
    }

    setCreationError(null);

    if (!user || !user.id) {
      const message = 'Você precisa estar logado para criar uma sala.';
      console.error('❌ Usuário não está logado!');
      setCreationError(message);
      return;
    }
    
    if (!newSession.game_id || newSession.game_id.trim() === '') {
      const message = 'Por favor, selecione um jogo antes de criar a sala.';
      console.error('❌ Nenhum jogo selecionado!');
      setCreationError(message);
      return;
    }
    
    if (!newSession.session_name || newSession.session_name.trim() === '') {
      const message = 'Por favor, digite um nome para a sala.';
      console.error('❌ Nome da sala vazio!');
      setCreationError(message);
      return;
    }

    setCreatingSession(true);

    try {
      console.log('📝 Criando sessão no banco...');
      
      // Validar que o jogo existe primeiro
      const { data: gameCheck, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('id', newSession.game_id)
        .single();

      if (gameError || !gameCheck) {
        console.error('❌ Jogo não encontrado:', gameError);
        throw new Error('O jogo selecionado não existe. Por favor, recarregue a página e tente novamente.');
      }

      const payload = {
        host_user_id: user.id,
        game_id: newSession.game_id,
        session_name: newSession.session_name.trim(),
        is_public: newSession.is_public,
        max_players: newSession.max_players,
        current_players: 1,
        status: 'waiting'
      };

      console.log('📤 Payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro detalhado ao criar sessão:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        throw new Error('Sessão criada mas sem dados retornados.');
      }

      console.log('✅ Sessão criada com sucesso:', data);
      console.log('👥 Adicionando jogador à sessão...');

      const { error: playerError } = await supabase
        .from('session_players')
        .insert({
          session_id: data.id,
          user_id: user.id,
          player_number: 1
        });

      if (playerError) {
        console.error('❌ Erro ao adicionar jogador:', playerError);
        // Não bloquear aqui - a sala foi criada, só não adicionou o player
        console.warn('⚠️ Sala criada mas falhou ao adicionar jogador. Continuando...');
      } else {
        console.log('✅ Jogador adicionado com sucesso!');
      }

      // Limpar formulário
      setNewSession({
        game_id: '',
        session_name: '',
        is_public: true,
        max_players: 4
      });

      // Recarregar lista de salas
      await fetchSessions();

      // Fechar modal
      setShowCreateModal(false);
      
      console.log('🚀 Abrindo sessão:', data.id);
      
      // Abrir a sala
      onJoinSession(data.id);
      
    } catch (error: any) {
      console.error('❌ Erro capturado ao criar sessão:', error);
      const friendlyMessage = getFriendlyErrorMessage(error);
      setCreationError(friendlyMessage);
      console.error('💬 Mensagem amigável:', friendlyMessage);
    } finally {
      setCreatingSession(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      // Verificar se o jogador já está na sessão
      const { data: existingPlayer } = await supabase
        .from('session_players')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      // Se já está na sessão, apenas abre sem adicionar novamente
      if (existingPlayer) {
        onJoinSession(sessionId);
        return;
      }

      // Adicionar jogador à sessão
      await supabase.from('session_players').insert({
        session_id: sessionId,
        user_id: user.id,
        player_number: session.current_players + 1
      });

      await supabase
        .from('game_sessions')
        .update({ current_players: session.current_players + 1 })
        .eq('id', sessionId);

      onJoinSession(sessionId);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getFriendlyErrorMessage = (error: any) => {
    if (!error) return 'Erro desconhecido ao criar sala.';
    const rawMessage = error.message || error.error_description || error.details || 'Erro desconhecido ao criar sala.';
    if (typeof rawMessage !== 'string') {
      return 'Erro ao criar sala. Tente novamente em alguns segundos.';
    }

    const message = rawMessage.toLowerCase();

    if (message.includes('row-level security')) {
      return 'Permissão negada para criar sala. Faça login novamente e tente de novo.';
    }

    if (message.includes('duplicate key value') && message.includes('session_players_session_id_user_id_key')) {
      return 'Você já está participando desta sala.';
    }

    if (message.includes('duplicate key value') && message.includes('session_players_session_id_player_number_key')) {
      return 'Número de jogador já utilizado nessa sala. Tente novamente em alguns segundos.';
    }

    if (message.includes('foreign key violation')) {
      return 'Jogo selecionado não foi encontrado. Recarregue a página e selecione o jogo novamente.';
    }

    if (message.includes('invalid input syntax for type uuid')) {
      return 'ID do jogo inválido. Recarregue a lista de jogos antes de criar a sala.';
    }

    return rawMessage;
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
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-800 rounded-xl transition-colors"
              >
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
                <p className="text-gray-600 text-sm">
                  Como HOST você cria a sala e outros jogadores podem entrar
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => {
                const isFull = session.current_players >= session.max_players;
                const resolvedHostId = resolveHostId(session);
                const isMySession = resolvedHostId === user?.id;
                
                return (
                  <div
                    key={session.id}
                    className={`group relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${
                      isFull ? 'border-red-500/30 opacity-60' : 
                      isMySession ? 'border-purple-500/50 hover:border-purple-400' :
                      'border-gray-700 hover:border-cyan-400/50 hover:scale-105'
                    }`}
                  >
                    {/* Indicador visual de HOST ou CHEIA */}
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
                            {session.is_public ? (
                              <Unlock className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-xs font-bold ${session.is_public ? 'text-green-400' : 'text-red-400'}`}>
                              {session.is_public ? 'PÚBLICA' : 'PRIVADA'}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {session.session_name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {session.game?.title || 'Carregando jogo...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
                            {session.host?.username?.[0]?.toUpperCase() || 'H'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-bold">
                                {session.host?.username || 'Host'}
                              </p>
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
                              {session.current_players}/{session.max_players}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeAgo(session.created_at)}</span>
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
                            onClick={() => joinSession(session.id)}
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
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
              <p className="text-cyan-300 text-sm">
                💡 <strong>Como funciona:</strong><br/>
                1️⃣ Você cria a sala e vira o HOST<br/>
                2️⃣ A sala aparece na lista para outros jogadores<br/>
                3️⃣ Outros jogadores clicam em "Entrar" para jogar com você<br/>
                4️⃣ Quando todos estiverem prontos, o jogo começa!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Nome da Sala</label>
                <input
                  type="text"
                  value={newSession.session_name}
                  onChange={(e) => setNewSession({ ...newSession, session_name: e.target.value })}
                  placeholder="Minha Sala Épica"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Selecionar Jogo</label>
                <select
                  value={newSession.game_id}
                  onChange={(e) => setNewSession({ ...newSession, game_id: e.target.value })}
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
                  value={newSession.max_players}
                  onChange={(e) => setNewSession({ ...newSession, max_players: parseInt(e.target.value) })}
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
                  checked={newSession.is_public}
                  onChange={(e) => setNewSession({ ...newSession, is_public: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500"
                />
                <label htmlFor="is_public" className="text-white font-medium">
                  Sala Pública (qualquer um pode entrar)
                </label>
              </div>

              <button
                onClick={createSession}
                disabled={creatingSession || !newSession.game_id || !newSession.session_name}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={
                  creatingSession ? 'Criando sala...' :
                  !newSession.session_name ? 'Digite um nome para a sala' :
                  !newSession.game_id ? 'Selecione um jogo' :
                  'Clique para criar a sala'
                }
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
              
              {/* Debug info */}
              {(!newSession.game_id || !newSession.session_name) && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <strong>⚠️ Preencha todos os campos:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {!newSession.session_name && <li>Nome da sala</li>}
                    {!newSession.game_id && <li>Selecione um jogo</li>}
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
