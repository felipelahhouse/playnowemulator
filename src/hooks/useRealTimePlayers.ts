import { useState, useEffect, useRef } from 'react';
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
  const heartbeatInitialized = useRef(false);

  useEffect(() => {
    // GUARD: Previne múltiplas inicializações do heartbeat
    if (!user || heartbeatInitialized.current) {
      return;
    }
    
    console.log('🔄 Inicializando heartbeat para:', user.email);
    heartbeatInitialized.current = true;
    
    // Atualizar status online do usuário atual (SEM aguardar)
    updateUserOnlineStatus(true);
    
    // Atualizar last_seen a cada 60 segundos (reduzido de 30s)
    const heartbeatInterval = setInterval(() => {
      updateUserOnlineStatus(true);
    }, 60000);

    // Ao sair, marcar como offline
    const handleBeforeUnload = () => {
      // Tentar marcar como offline (melhor esforço)
      updateUserOnlineStatus(false);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('🧹 Cleanup heartbeat');
      heartbeatInitialized.current = false;
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateUserOnlineStatus(false);
    };
  }, [user?.id]); // Só depende do user.id (não do objeto completo)

  useEffect(() => {
    console.log('🔄 Inicializando subscriptions de players...');
    
    // Buscar players inicial
    fetchOnlinePlayers();

    // Atualizar a cada 10 segundos (aumentado de 5s para reduzir carga)
    const interval = setInterval(fetchOnlinePlayers, 10000);

    // Subscription em tempo real - APENAS para detectar mudanças
    // NÃO chamar fetchOnlinePlayers aqui para evitar loop!
    const usersChannel = supabase
      .channel('users_online')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          console.log('👤 User atualizado:', payload.new);
          // Atualizar localmente sem refetch completo
          setAllPlayers(prev => {
            const updated = prev.map(p => 
              p.id === (payload.new as any).id ? { ...p, ...(payload.new as any) } : p
            );
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleanup subscriptions');
      clearInterval(interval);
      supabase.removeChannel(usersChannel);
    };
  }, []); // Array vazio - só inicializa 1x

  const updateUserOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      // Silenciar para não poluir console
      await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      // Log apenas em mudança de estado, não no heartbeat
      if (!isOnline) {
        console.log(`✅ Marcado como offline`);
      }
    } catch (error) {
      // Silenciar erros de heartbeat para não poluir
      if (!isOnline) {
        console.error('Error updating offline status:', error);
      }
    }
  };

  const fetchOnlinePlayers = async () => {
    try {
      // Buscar todos os usuários online (últimos 3 minutos - mais tempo para mobile)
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, last_seen, is_online')
        .eq('is_online', true)
        .gte('last_seen', threeMinutesAgo)
        .order('last_seen', { ascending: false });

      if (usersError) {
        // Silenciar erros repetidos
        return;
      }

      // Buscar sessões ativas para saber em qual jogo cada jogador está
      const { data: sessions } = await supabase
        .from('session_players')
        .select(`
          user_id,
          session:game_sessions!session_players_session_id_fkey(
            game_id,
            status
          )
        `)
        .in('user_id', users?.map(u => u.id) || []);

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
      
      // Log apenas se houver mudanças significativas
      if (playersWithGames.length > 0 || Object.keys(grouped).length > 0) {
        console.log('📊 Players online:', playersWithGames.length);
      }
      
    } catch (error) {
      // Silenciar para não poluir console
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
