import { useState, useEffect } from 'react';
import { supabase } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

interface Player {
  id: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
  current_game_id?: string;
}

interface GamePlayers {
  [gameId: string]: Player[];
}

export const useRealTimePlayers = () => {
  const { user } = useAuth();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playersByGame, setPlayersByGame] = useState<GamePlayers>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Atualizar status online do usuário atual
    if (user) {
      updateUserOnlineStatus(true);
      
      // Atualizar last_seen a cada 30 segundos
      const heartbeatInterval = setInterval(() => {
        updateUserOnlineStatus(true);
      }, 30000);

      // Ao sair, marcar como offline
      const handleBeforeUnload = () => {
        updateUserOnlineStatus(false);
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateUserOnlineStatus(false);
      };
    }
  }, [user]);

  useEffect(() => {
    fetchOnlinePlayers();

    // Atualizar a cada 5 segundos
    const interval = setInterval(fetchOnlinePlayers, 5000);

    // Subscription em tempo real para mudanças de usuários
    const usersChannel = supabase
      .channel('users_online')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('👤 User change:', payload);
          fetchOnlinePlayers();
        }
      )
      .subscribe();

    // Subscription para mudanças em sessões de jogo
    const sessionsChannel = supabase
      .channel('game_sessions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        (payload) => {
          console.log('🎮 Session change:', payload);
          fetchOnlinePlayers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  const updateUserOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating online status:', error);
      } else {
        console.log(`✅ Status atualizado: ${isOnline ? 'Online' : 'Offline'}`);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const fetchOnlinePlayers = async () => {
    try {
      // Buscar todos os usuários online (últimos 2 minutos)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, last_seen, is_online')
        .eq('is_online', true)
        .gte('last_seen', twoMinutesAgo)
        .order('last_seen', { ascending: false });

      if (usersError) {
        console.error('Error fetching online users:', usersError);
        return;
      }

      // Buscar sessões ativas para saber em qual jogo cada jogador está
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_players')
        .select(`
          user_id,
          session:game_sessions!session_players_session_id_fkey(
            game_id,
            status
          )
        `)
        .in('user_id', users?.map(u => u.id) || []);

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      }

      // Mapear jogadores com seus jogos atuais
      const playersWithGames: Player[] = (users || []).map(user => {
        const userSession = sessions?.find((s: any) => s.user_id === user.id);
        const sessionData = userSession?.session as any;
        return {
          ...user,
          current_game_id: sessionData?.game_id || undefined
        };
      });

      setAllPlayers(playersWithGames);

      // Agrupar jogadores por jogo
      const grouped: GamePlayers = {};
      playersWithGames.forEach(player => {
        if (player.current_game_id) {
          if (!grouped[player.current_game_id]) {
            grouped[player.current_game_id] = [];
          }
          grouped[player.current_game_id].push(player);
        }
      });

      setPlayersByGame(grouped);
      console.log('📊 Players online:', playersWithGames.length);
      console.log('🎮 Players por jogo:', grouped);
      
    } catch (error) {
      console.error('Error fetching online players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayersForGame = (gameId: string): Player[] => {
    return playersByGame[gameId] || [];
  };

  const getTotalOnlinePlayers = (): number => {
    return allPlayers.length;
  };

  return {
    allPlayers,
    playersByGame,
    loading,
    getPlayersForGame,
    getTotalOnlinePlayers
  };
};
