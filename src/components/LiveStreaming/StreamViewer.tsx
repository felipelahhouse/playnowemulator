import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Heart, Share2, Eye, Gamepad2, Settings, Volume2, VolumeX, Maximize, Minimize, Clock, Pause } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import LiveChat from '../Chat/LiveChat';

interface StreamViewerProps {
  streamId: string;
  onClose: () => void;
}

interface LiveStream {
  id: string;
  streamer_id: string;
  game_id: string;
  title: string;
  description: string;
  viewer_count: number;
  is_live: boolean;
  started_at: string;
  streamer?: {
    username: string;
    avatar_url?: string;
  };
  game?: {
    title: string;
    thumbnail_url: string;
    rom_url: string;
  };
}

const StreamViewer: React.FC<StreamViewerProps> = ({ streamId, onClose }) => {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'loading'>('loading');
  const [viewerCount, setViewerCount] = useState(0);
  const { user } = useAuth();
  const videoRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchStreamDetails();
    joinAsViewer();
    
    // Simulate game state changes for demo
    const gameStateInterval = setInterval(() => {
      setGameState(prev => {
        if (prev === 'loading') return 'playing';
        return Math.random() > 0.95 ? (prev === 'playing' ? 'paused' : 'playing') : prev;
      });
    }, 3000);

    // Simulate viewer count updates
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 6) - 2; // -2 to +3
        return Math.max(1, prev + change);
      });
    }, 5000);

    const channel = supabase
      .channel(`stream_${streamId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'live_streams',
          filter: `id=eq.${streamId}`
        },
        (payload) => {
          setStream(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      leaveAsViewer();
      supabase.removeChannel(channel);
      clearInterval(gameStateInterval);
      clearInterval(viewerInterval);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [streamId]);

  const joinAsViewer = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('stream_viewers')
        .insert({ 
          stream_id: streamId, 
          user_id: user.id,
          joined_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error joining as viewer:', error);
    }
  };

  const leaveAsViewer = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('stream_viewers')
        .update({ left_at: new Date().toISOString() })
        .eq('stream_id', streamId)
        .eq('user_id', user.id)
        .is('left_at', null);
    } catch (error) {
      console.error('Error leaving as viewer:', error);
    }
  };

  const fetchStreamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          streamer:streamer_id(username, avatar_url),
          game:game_id(title, thumbnail_url, rom_url)
        `)
        .eq('id', streamId)
        .single();

      if (error) throw error;
      setStream(data);
      setViewerCount(data?.viewer_count || Math.floor(Math.random() * 500) + 50);
    } catch (error) {
      console.error('Error fetching stream:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLike = async () => {
    if (!user || !stream) return;
    
    try {
      // TODO: Implement like functionality in database
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking stream:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: stream?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getStreamDuration = () => {
    if (!stream?.started_at) return '0:00';
    const now = new Date();
    const start = new Date(stream.started_at);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-400 rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-b-pink-400 border-l-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-cyan-400 font-bold">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Stream not found</h3>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" onMouseMove={handleMouseMove}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ${
        isFullscreen && !showControls ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center font-bold text-white">
                {stream.streamer?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            <div>
              <h1 className="text-white font-bold">{stream.title}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">{stream.streamer?.username}</span>
                <span className="text-gray-600">•</span>
                <span className="text-purple-400">{stream.game?.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-bold">LIVE</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-mono">{getStreamDuration()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="font-bold">{viewerCount.toLocaleString()}</span>
          </div>

          <button
            onClick={handleLike}
            className={`p-2 rounded-lg transition-all ${
              liked 
                ? 'bg-red-500/20 text-red-400 scale-110' 
                : 'hover:bg-gray-800 text-gray-400 hover:scale-105'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors hover:scale-105"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors lg:hidden"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div 
          ref={videoRef}
          className={`flex-1 bg-black flex items-center justify-center relative ${showChat ? 'lg:mr-80' : ''}`}
        >
          {/* Game Screen Simulation */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-5xl max-h-full aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden border-4 border-gray-800">
              {/* Simulated Game Screen */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
                {stream.game?.thumbnail_url ? (
                  <img
                    src={stream.game.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-32 h-32 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Simulated Game UI Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Health Bar */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full" />
                    </div>
                    <span className="text-white text-sm font-bold">HP</span>
                  </div>
                  <div className="text-cyan-400 text-xs font-mono">SCORE: 12,450</div>
                </div>

                {/* Lives */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Heart key={i} className="w-4 h-4 text-red-500 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Game State Indicator */}
                {gameState === 'paused' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Pause className="w-16 h-16 text-white mx-auto mb-4" />
                      <div className="text-white text-xl font-bold">PAUSED</div>
                    </div>
                  </div>
                )}

                {gameState === 'loading' && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                      <div className="text-white text-lg font-bold">Loading...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stream Info Overlay */}
            <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
              isFullscreen && !showControls ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                      {stream.game?.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{stream.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5 text-white" />
                      ) : (
                        <Maximize className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Viewer Actions Floating */}
            <div className={`absolute top-4 right-4 transition-all duration-300 ${
              isFullscreen && !showControls ? 'translate-y-[-100px] opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <div className="flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 text-center">
                  <Eye className="w-5 h-5 text-white mx-auto mb-1" />
                  <div className="text-white text-xs font-bold">{viewerCount}</div>
                </div>
                
                <button
                  onClick={handleLike}
                  className={`bg-black/60 backdrop-blur-sm rounded-full p-3 transition-all ${
                    liked ? 'bg-red-500/20' : 'hover:bg-black/80'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-current' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className={`hidden lg:block w-80 border-l border-gray-800 bg-gray-900 transition-all duration-300 ${
            isFullscreen && !showControls ? 'translate-x-full' : 'translate-x-0'
          }`}>
            <LiveChat streamId={streamId} />
          </div>
        )}
      </div>

      {/* Mobile Chat Overlay */}
      {showChat && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-20 bg-gray-900 border-t border-gray-800">
          <LiveChat streamId={streamId} />
        </div>
      )}
    </div>
  );
};

export default StreamViewer;
