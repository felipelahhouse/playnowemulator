import React, { useEffect, useRef, useState } from 'react';
import { Radio, Eye, Heart, MessageCircle, Video, Mic, Settings } from 'lucide-react';
import { supabase } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface StreamerViewProps {
  gameId: string;
  romPath: string;
  gameTitle?: string;
  onEndStream: () => void;
  // Configurações vindas do modal
  title?: string;
  fps?: number;
  quality?: 'high' | 'medium' | 'low';
  enableCamera?: boolean;
  enableMic?: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

const StreamerView: React.FC<StreamerViewProps> = ({
  gameId,
  romPath,
  gameTitle,
  onEndStream,
  title: initialTitle,
  fps: initialFps = 10,
  quality: initialQuality = 'medium',
  enableCamera = false,
  enableMic = false,
  cameraDeviceId,
  micDeviceId
}) => {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const channelRef = useRef<any>(null);
  const streamIdRef = useRef<string>(crypto.randomUUID());
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [viewers, setViewers] = useState(0);
  const [likes] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState(initialTitle || (gameTitle ? `Playing ${gameTitle}` : ''));
  const [fps, setFps] = useState(initialFps);
  const [bitrate, setBitrate] = useState<'high' | 'medium' | 'low'>(initialQuality);
  const [isCameraOn, setIsCameraOn] = useState(enableCamera);
  const [isMicOn, setIsMicOn] = useState(enableMic);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Função para ligar/desligar câmera
  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        // Desligar câmera
        if (mediaStreamRef.current) {
          const videoTracks = mediaStreamRef.current.getVideoTracks();
          videoTracks.forEach(track => track.stop());
        }
        setIsCameraOn(false);
        setPermissionError(null);
      } else {
        // Ligar câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            deviceId: cameraDeviceId ? { exact: cameraDeviceId } : undefined,
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false 
        });
        
        mediaStreamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        setIsCameraOn(true);
        setPermissionError(null);
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      setPermissionError('Câmera bloqueada ou não disponível');
      setIsCameraOn(false);
    }
  };

  // Função para ligar/desligar microfone
  const toggleMic = async () => {
    try {
      if (isMicOn) {
        // Desligar microfone
        if (mediaStreamRef.current) {
          const audioTracks = mediaStreamRef.current.getAudioTracks();
          audioTracks.forEach(track => track.stop());
        }
        setIsMicOn(false);
        setPermissionError(null);
      } else {
        // Ligar microfone
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: false,
          audio: {
            deviceId: micDeviceId ? { exact: micDeviceId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Se já tem câmera, adiciona o áudio ao stream existente
        if (mediaStreamRef.current && isCameraOn) {
          const audioTrack = stream.getAudioTracks()[0];
          mediaStreamRef.current.addTrack(audioTrack);
        } else {
          mediaStreamRef.current = stream;
        }
        
        setIsMicOn(true);
        setPermissionError(null);
      }
    } catch (error: any) {
      console.error('Erro ao acessar microfone:', error);
      setPermissionError('Microfone bloqueado ou não disponível');
      setIsMicOn(false);
    }
  };

  // Limpar streams quando desmontar ou parar stream
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-iniciar câmera e microfone se foram configurados
  useEffect(() => {
    if (enableCamera && !isCameraOn) {
      toggleCamera();
    }
    if (enableMic && !isMicOn) {
      toggleMic();
    }
  }, []); // Só roda uma vez ao montar

  useEffect(() => {
    if (!isStreaming) return;

    const channel = supabase.channel(`stream-${streamIdRef.current}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Contar espectadores (excluir o streamer)
        const spectators = Object.values(state).filter((p: any) => 
          p[0]?.role === 'spectator'
        );
        setViewers(spectators.length);
      })
      .on('broadcast', { event: 'chat' }, (payload: any) => {
        const msg: ChatMessage = payload.payload;
        setChatMessages(prev => [...prev.slice(-50), msg]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            username: user?.username,
            role: 'streamer',
            stream_id: streamIdRef.current,
            started_at: new Date().toISOString()
          });
        }
      });

    // Criar registro de stream no banco
    const createStreamRecord = async () => {
      await supabase.from('live_streams').insert({
        id: streamIdRef.current,
        streamer_id: user?.id,
        game_id: gameId,
        title: streamTitle || 'Untitled Stream',
        description: '',
        is_live: true,
        viewer_count: 0,
        started_at: new Date().toISOString()
      });
    };

    createStreamRecord();

    return () => {
      endStream();
      channel.unsubscribe();
    };
  }, [isStreaming, user, gameId, streamTitle]);

  useEffect(() => {
    if (!isStreaming) return;

    // OTIMIZAÇÃO: Capturar frames com requestAnimationFrame ao invés de interval
    // Isso é muito mais eficiente e sincronizado com o navegador
    let animationFrameId: number;
    let lastCaptureTime = 0;
    const captureInterval = 1000 / fps; // Intervalo entre capturas

    const captureLoop = (timestamp: number) => {
      if (!isStreaming) return;

      // Só captura se passou o intervalo necessário (controle de FPS)
      if (timestamp - lastCaptureTime >= captureInterval) {
        captureFrame();
        lastCaptureTime = timestamp;
      }

      // Continua o loop
      animationFrameId = requestAnimationFrame(captureLoop);
    };

    // Inicia o loop
    animationFrameId = requestAnimationFrame(captureLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isStreaming, fps]);

  const captureFrame = () => {
    if (!iframeRef.current || !channelRef.current) return;

    try {
      const iframe = iframeRef.current;
      const canvas = iframe.contentDocument?.querySelector('canvas');
      
      if (!canvas) return;

      // OTIMIZAÇÃO 1: Redimensionar canvas antes de capturar (menor = mais rápido)
      const scale = bitrate === 'high' ? 1 : bitrate === 'medium' ? 0.75 : 0.5;
      const width = canvas.width * scale;
      const height = canvas.height * scale;

      // OTIMIZAÇÃO 2: Usar um canvas temporário menor
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d', { 
        alpha: false, // Sem transparência = mais rápido
        willReadFrequently: true 
      });

      if (!ctx) return;

      // Desenha versão redimensionada
      ctx.drawImage(canvas, 0, 0, width, height);

      // OTIMIZAÇÃO 3: Qualidade JPEG mais baixa para streaming
      const quality = bitrate === 'high' ? 0.7 : bitrate === 'medium' ? 0.5 : 0.3;
      const imageData = tempCanvas.toDataURL('image/jpeg', quality);

      // OTIMIZAÇÃO 4: Enviar sem await (não bloqueia)
      channelRef.current.send({
        type: 'broadcast',
        event: 'frame',
        payload: {
          image: imageData,
          timestamp: Date.now()
        }
      }).catch((error: Error) => {
        console.error('Error sending frame:', error);
      });

      // Limpa canvas temporário
      tempCanvas.remove();
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  };

  const startStream = () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }
    setIsStreaming(true);
  };

  const endStream = async () => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'stream-ended',
        payload: {}
      });
    }

    // Atualizar registro no banco
    await supabase
      .from('live_streams')
      .update({
        is_live: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', streamIdRef.current);

    setIsStreaming(false);
    onEndStream();
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

    setChatMessages(prev => [...prev.slice(-50), msg]);
  };

  if (!isStreaming) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-gray-900 rounded-2xl border-2 border-cyan-500/30 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Start Live Stream</h2>
            <p className="text-gray-400">Share your gameplay with the world</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stream Title
              </label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Enter an exciting stream title..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream FPS (Recomendado: 10-15)
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value={5}>5 FPS (Super Smooth)</option>
                  <option value={10}>10 FPS (Recomendado)</option>
                  <option value={15}>15 FPS (Good)</option>
                  <option value={20}>20 FPS (Heavy)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality (Resolução)
                </label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="low">Low 50% (Super Fast)</option>
                  <option value="medium">Medium 75% (Recomendado)</option>
                  <option value="high">High 100% (Slow)</option>
                </select>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-500 text-2xl">⚡</div>
                <div>
                  <h4 className="text-yellow-500 font-bold mb-1">Dica de Performance</h4>
                  <p className="text-yellow-200/80 text-sm">
                    Use <strong>10 FPS + Medium Quality</strong> para melhor experiência.
                    FPS alto pode deixar o jogo lento!
                  </p>
                </div>
              </div>
            </div>

            {permissionError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm text-center">⚠️ {permissionError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={toggleCamera}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  isCameraOn
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500'
                    : 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                }`}
              >
                <Video className="w-5 h-5" />
                {isCameraOn ? 'Câmera Ligada' : 'Ligar Câmera'}
              </button>

              <button
                onClick={toggleMic}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  isMicOn
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500'
                    : 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                }`}
              >
                <Mic className="w-5 h-5" />
                {isMicOn ? 'Mic Ligado' : 'Ligar Mic'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onEndStream}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={startStream}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
              >
                Go Live
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Streamer Header */}
      <div className="bg-gray-900/95 border-b border-red-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500 rounded-full">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-red-500 font-bold">STREAMING LIVE</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-bold">{viewers} viewers</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400 font-bold">{likes} likes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-2.5 rounded-lg transition-all ${
                isCameraOn ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Video className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2.5 rounded-lg transition-all ${
                isMicOn ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

            <button className="p-2.5 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-all">
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={endStream}
              className="px-4 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-bold transition-all border border-red-500/50"
            >
              End Stream
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <iframe
            ref={iframeRef}
            src={`/new-snes-player.html?rom=${encodeURIComponent(romPath)}`}
            className="w-full h-full border-0"
            title="SNES Emulator Stream"
          />

          {/* Webcam Overlay */}
          {isCameraOn && (
            <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover mirror-video"
              />
            </div>
          )}

          {/* Mic Indicator */}
          {isMicOn && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-red-500/90 backdrop-blur-sm rounded-full border border-red-400">
              <Mic className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">ON AIR</span>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              Live Chat
            </h3>
          </div>

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

          <div className="p-4 border-t border-gray-800">
            <input
              type="text"
              placeholder="Send a message..."
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
  );
};

export default StreamerView;
