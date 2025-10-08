import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Lock, Unlock, Play, Clock, Radio } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface GameSession {
  id: string;
  host_id: string;
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

  useEffect(() => {
    fetchSessions();
    fetchGames();

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
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          host:host_id(username),
          game:game_id(title, thumbnail_url)
        `)
        .eq('status', 'waiting')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
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
    if (!user || !newSession.game_id || !newSession.session_name) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          host_id: user.id,
          game_id: newSession.game_id,
          session_name: newSession.session_name,
          is_public: newSession.is_public,
          max_players: newSession.max_players,
          current_players: 1,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('session_players').insert({
        session_id: data.id,
        user_id: user.id,
        player_number: 1
      });

      setShowCreateModal(false);
      onJoinSession(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl bg-gray-900 rounded-3xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">Multiplayer Lobbies</h2>
              <p className="text-cyan-400 font-mono text-sm">// Join or create a game session</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Create Session</span>
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
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No Active Sessions</h3>
              <p className="text-gray-500 mb-6">Be the first to create a multiplayer session!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Create Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
                >
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
                            {session.is_public ? 'PUBLIC' : 'PRIVATE'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">
                          {session.session_name}
                        </h3>
                        <p className="text-gray-400 text-sm">{session.game?.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
                          {session.host?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">{session.host?.username}</p>
                          <p className="text-gray-500 text-xs">Host</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-bold text-sm">
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

                      <button
                        onClick={() => joinSession(session.id)}
                        disabled={session.current_players >= session.max_players}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl border-2 border-cyan-500/30 p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">Create Game Session</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Session Name</label>
                <input
                  type="text"
                  value={newSession.session_name}
                  onChange={(e) => setNewSession({ ...newSession, session_name: e.target.value })}
                  placeholder="My Awesome Game"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Select Game</label>
                <select
                  value={newSession.game_id}
                  onChange={(e) => setNewSession({ ...newSession, game_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Choose a game...</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Max Players</label>
                <select
                  value={newSession.max_players}
                  onChange={(e) => setNewSession({ ...newSession, max_players: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} Players
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
                  Public Session (anyone can join)
                </label>
              </div>

              <button
                onClick={createSession}
                disabled={!newSession.game_id || !newSession.session_name}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerLobby;
