import React, { useEffect, useRef, useState } from 'react';
import { X, Eye, Heart, MessageCircle, Share2, Radio, Users } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface SpectatorViewProps {
  streamId: string;
  streamTitle: string;
  streamerName: string;
  gameTitle: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

const SpectatorView: React.FC<SpectatorViewProps> = ({
  streamId,
  streamTitle,
  streamerName,
  gameTitle,
  onClose
}) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<any>(null);
  
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const channel = supabase.channel(`stream-${streamId}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewers(count);
      })
      // Frame streaming
      .on('broadcast', { event: 'frame' }, (payload: any) => {
        drawFrame(payload.payload);
      })
      // Chat
      .on('broadcast', { event: 'chat' }, (payload: any) => {
        const msg: ChatMessage = payload.payload;
        setChatMessages(prev => [...prev.slice(-50), msg]);
      })
      // Stream events
      .on('broadcast', { event: 'stream-ended' }, () => {
        setIsLive(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id || 'anonymous',
            username: user?.username || 'Anonymous',
            role: 'spectator',
            joined_at: new Date().toISOString()
          });
        }
      });

    // Atualizar contagem de visualizações no banco
    const updateViews = async () => {
      await supabase
        .from('streams')
        .update({ viewer_count: viewers })
        .eq('id', streamId);
    };

    const viewInterval = setInterval(updateViews, 5000);

    return () => {
      clearInterval(viewInterval);
      channel.unsubscribe();
    };
  }, [streamId, user, viewers]);

  const drawFrame = (frameData: any) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Desenhar frame recebido (base64 ou ImageData)
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
    };
    img.src = frameData.image;
  };

  const sendMessage = (message: string) => {
    if (!channelRef.current || !message.trim() || !user) return;

    const msg: ChatMessage = {
      id: `${user.id}-${Date.now()}`,
      username: user.username,
      message: message.trim(),
      timestamp: Date.now()
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: msg
    });
  };

  const toggleLike = async () => {
    if (!user) return;

    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
      
      await supabase
        .from('stream_likes')
        .delete()
        .eq('stream_id', streamId)
        .eq('user_id', user.id);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      
      await supabase
        .from('stream_likes')
        .insert({
          stream_id: streamId,
          user_id: user.id
        });
    }
  };

  const shareStream = () => {
    const url = `${window.location.origin}/stream/${streamId}`;
    navigator.clipboard.writeText(url);
    // Mostrar toast de copiado
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500 rounded-full">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-red-500 font-bold text-sm">LIVE</span>
                </div>
              )}
              <div>
                <h1 className="text-white font-bold text-lg">{streamTitle}</h1>
                <p className="text-gray-400 text-sm">{streamerName} • {gameTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-bold text-sm">{viewers.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400 font-bold text-sm">{likes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Low Quality</option>
            </select>

            <button
              onClick={toggleLike}
              className={`p-2.5 rounded-lg transition-all ${
                hasLiked
                  ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={shareStream}
              className="p-2.5 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="max-w-full max-h-full"
          />
          
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Stream Ended</h3>
                <p className="text-gray-400">This stream is no longer live</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Stream Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-lg font-bold text-white">
                {streamerName[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{streamerName}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {viewers} watching
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="animate-slide-up">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {msg.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-cyan-400 text-sm font-bold">{msg.username}</p>
                    <p className="text-white text-sm break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={user ? "Send a message..." : "Login to chat"}
                disabled={!user}
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorView;
