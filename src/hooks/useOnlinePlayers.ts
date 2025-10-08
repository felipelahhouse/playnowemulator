import { useState, useEffect } from 'react';
import { supabase } from '../contexts/AuthContext';

interface OnlinePlayer {
  id: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
}

export const useOnlinePlayers = () => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlinePlayers();

    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchOnlinePlayers, 10000);

    // Subscription em tempo real
    const channel = supabase
      .channel('online_players')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchOnlinePlayers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOnlinePlayers = async () => {
    try {
      // Buscar usuários online (últimos 5 minutos)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, last_seen')
        .eq('is_online', true)
        .gte('last_seen', fiveMinutesAgo)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching online players:', error);
      } else {
        setOnlinePlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching online players:', error);
    } finally {
      setLoading(false);
    }
  };

  return { onlinePlayers, loading };
};
