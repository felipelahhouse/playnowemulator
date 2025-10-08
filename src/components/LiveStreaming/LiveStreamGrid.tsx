import React, { useEffect, useState } from 'react';
import { Eye, Play, Radio, Clock, Gamepad2 } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import StreamViewer from './StreamViewer';

interface LiveStream {
  id: string;
  user_id: string;
  game_id: string;
  title: string;
  viewer_count: number;
  is_live: boolean;
  started_at: string;
  streamer?: {
    username: string;
  };
  game?: {
    title: string;
    image_url?: string;
  };
}

interface LiveStreamGridProps {
  onStreamClick?: (stream: LiveStream) => void;
}

const LiveStreamGrid: React.FC<LiveStreamGridProps> = ({ onStreamClick }) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  useEffect(() => {
    fetchLiveStreams();

    // Realtime para detectar mudanças automaticamente
    const channel = supabase
      .channel('streams_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'streams' },
        (payload) => {
          console.log('🔴 Stream update detected:', payload);
          fetchLiveStreams();
        }
      )
      .subscribe();

    // Atualizar viewer count a cada 5 segundos
    const interval = setInterval(fetchLiveStreams, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          streamer:user_id(username),
          game:game_id(title, image_url)
        `)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (error) {
        console.error('Error fetching streams:', error);
        return;
      }
      
      console.log('✅ Streams loaded:', data?.length || 0);
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-xl mb-4" />
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
                  LIVE
                </span>{' '}
                NOW
              </h2>
              <p className="text-gray-400 font-mono">// {streams.length} streams online</p>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-400 font-bold text-lg">
                {streams.reduce((sum, s) => sum + s.viewer_count, 0)} watching
              </span>
            </div>
          </div>

          {streams.length === 0 ? (
            <div className="text-center py-20">
              <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No Live Streams</h3>
              <p className="text-gray-500">Be the first to go live!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  onClick={() => onStreamClick?.(stream)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-900">
                    {stream.game?.image_url ? (
                      <img
                        src={stream.game.image_url}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-purple-900 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-xs font-bold uppercase">LIVE</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-full">
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-xs font-bold">
                        {stream.viewer_count}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {stream.title}
                      </h3>
                    </div>

                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/50 rounded-xl transition-all duration-300" />
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center font-bold text-white">
                      {stream.streamer?.username?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                        {stream.streamer?.username || 'Unknown'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {stream.game?.title || 'Unknown Game'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500 text-xs">
                          {getTimeAgo(stream.started_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamGrid;
