import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Gamepad2, Users, Tv, TrendingUp, Zap, Crown, X } from 'lucide-react';
import { supabase, useAuth } from '../../contexts/AuthContext';

interface UserStats {
  level: number;
  experience: number;
  total_playtime: number;
  games_played: number;
  multiplayer_sessions: number;
  streams_created: number;
}

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  rarity: string;
  unlocked_at?: string;
}

interface RecentGame {
  game_title: string;
  last_played: string;
  playtime: number;
  times_played: number;
}

interface UserDashboardProps {
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Buscar stats do usuário
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError) {
        console.error('Error fetching stats:', statsError);
      } else if (statsData) {
        setStats(statsData);
      }

      // Buscar conquistas desbloqueadas
      const { data: achievementsData, error: achError } = await supabase
        .from('user_achievements')
        .select(`
          unlocked_at,
          achievement_id,
          achievements (
            id,
            key,
            title,
            description,
            icon,
            xp_reward,
            rarity
          )
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(6);

      if (achError) {
        console.error('Error fetching achievements:', achError);
      } else if (achievementsData) {
        const formatted = achievementsData
          .filter((item: any) => item.achievements)
          .map((item: any) => ({
            ...item.achievements,
            unlocked_at: item.unlocked_at
          }));
        setAchievements(formatted);
      }

      // Buscar jogos recentes
      const { data: historyData, error: histError } = await supabase
        .from('play_history')
        .select(`
          playtime,
          last_played,
          times_played,
          game_id,
          games (
            title
          )
        `)
        .eq('user_id', user.id)
        .order('last_played', { ascending: false })
        .limit(5);

      if (histError) {
        console.error('Error fetching history:', histError);
      } else if (historyData) {
        const formatted = historyData
          .filter((item: any) => item.games)
          .map((item: any) => ({
            game_title: item.games?.title || 'Unknown Game',
            last_played: item.last_played,
            playtime: item.playtime,
            times_played: item.times_played
          }));
        setRecentGames(formatted);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPProgress = (currentXP: number, level: number) => {
    const xpForCurrentLevel = ((level - 1) * (level - 1)) * 100;
    const xpForNextLevel = (level * level) * 100;
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return (xpInCurrentLevel / xpNeededForLevel) * 100;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatPlaytime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'agora mesmo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const xpProgress = getXPProgress(stats.experience, stats.level);
  const xpCurrent = stats.experience - ((stats.level - 1) * (stats.level - 1)) * 100;
  const xpNeeded = (stats.level * stats.level) * 100 - ((stats.level - 1) * (stats.level - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            Meu Dashboard
          </h1>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Player Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{user?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-gray-900">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-white mb-2">{user?.username}</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">Nível {stats.level}</span>
                </div>
                <div className="text-gray-400 text-sm">
                  {stats.experience.toLocaleString()} XP Total
                </div>
              </div>

              {/* Barra de Progresso XP */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>{xpCurrent} / {xpNeeded} XP</span>
                  <span>Próximo nível: {stats.level + 1}</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Tempo Jogado"
            value={formatPlaytime(stats.total_playtime)}
            gradient="from-cyan-500 to-blue-500"
          />
          <StatCard
            icon={<Gamepad2 className="w-6 h-6" />}
            label="Jogos Diferentes"
            value={stats.games_played.toString()}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Sessões Multiplayer"
            value={stats.multiplayer_sessions.toString()}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Tv className="w-6 h-6" />}
            label="Lives Criadas"
            value={stats.streams_created.toString()}
            gradient="from-red-500 to-pink-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conquistas Recentes */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-black text-white">Conquistas Recentes</h2>
              <span className="ml-auto text-gray-400 text-sm">{achievements.length} desbloqueadas</span>
            </div>

            <div className="space-y-3">
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma conquista ainda</p>
                  <p className="text-gray-600 text-sm mt-1">Continue jogando para desbloquear!</p>
                </div>
              ) : (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative p-4 rounded-xl border bg-gradient-to-r ${getRarityColor(achievement.rarity)} bg-opacity-10 border-opacity-30 hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{achievement.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                            +{achievement.xp_reward} XP
                          </span>
                          <span className="text-gray-500">
                            {achievement.unlocked_at && getTimeAgo(achievement.unlocked_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Jogos Recentes */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-black text-white">Jogos Recentes</h2>
            </div>

            <div className="space-y-3">
              {recentGames.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum jogo jogado ainda</p>
                  <p className="text-gray-600 text-sm mt-1">Comece a jogar para ver seu histórico!</p>
                </div>
              ) : (
                recentGames.map((game, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold">{game.game_title}</h3>
                      <span className="text-gray-400 text-xs">{getTimeAgo(game.last_played)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatPlaytime(game.playtime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{game.times_played}x jogado</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient }) => {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 group-hover:border-gray-700 p-6 transition-all duration-300">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10 text-white mb-4`}>
          {icon}
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  );
};

export default UserDashboard;
