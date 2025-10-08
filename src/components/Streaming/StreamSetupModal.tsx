import React, { useState, useRef, useEffect } from 'react';
import { X, Radio, Video, Mic, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSettings } from '../Settings/SettingsModal';

interface StreamSetupModalProps {
  gameTitle: string;
  onStartStream: (config: StreamConfig) => void;
  onCancel: () => void;
}

export interface StreamConfig {
  title: string;
  fps: number;
  quality: 'high' | 'medium' | 'low';
  enableCamera: boolean;
  enableMic: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
}

const StreamSetupModal: React.FC<StreamSetupModalProps> = ({
  gameTitle,
  onStartStream,
  onCancel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Carregar configurações salvas
  const savedSettings = getSettings();

  const [title, setTitle] = useState(`Playing ${gameTitle}`);
  const [fps, setFps] = useState(savedSettings.defaultStreamFPS);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>(savedSettings.defaultStreamQuality);
  const [enableCamera, setEnableCamera] = useState(savedSettings.autoEnableCamera);
  const [enableMic, setEnableMic] = useState(savedSettings.autoEnableMic);
  
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  
  const [cameraPreview, setCameraPreview] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isTestingDevices, setIsTestingDevices] = useState(false);

  // Listar dispositivos disponíveis
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      setCameras(videoDevices);
      setMicrophones(audioDevices);
      
      // Usar dispositivo padrão salvo nas configurações, ou o primeiro disponível
      if (videoDevices.length > 0) {
        const defaultCam = savedSettings.defaultCameraId 
          ? videoDevices.find(d => d.deviceId === savedSettings.defaultCameraId)
          : null;
        setSelectedCamera(defaultCam ? defaultCam.deviceId : videoDevices[0].deviceId);
      }
      
      if (audioDevices.length > 0) {
        const defaultMic = savedSettings.defaultMicId 
          ? audioDevices.find(d => d.deviceId === savedSettings.defaultMicId)
          : null;
        setSelectedMic(defaultMic ? defaultMic.deviceId : audioDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
    }
  };

  // Testar câmera
  const testCamera = async () => {
    if (cameraPreview) {
      // Parar preview
      stopMediaStream();
      setCameraPreview(false);
      return;
    }

    setIsTestingDevices(true);
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setCameraPreview(true);
      setPermissionError(null);
    } catch (error: any) {
      console.error('Erro ao testar câmera:', error);
      setPermissionError('Erro ao acessar câmera. Verifique as permissões.');
      setCameraPreview(false);
    } finally {
      setIsTestingDevices(false);
    }
  };

  // Testar microfone (mostrar nível de áudio)
  const testMicrophone = async () => {
    setIsTestingDevices(true);
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Criar analisador de áudio
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(Math.min(100, average));
        
        if (enableMic) {
          requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();

      // Salvar para limpar depois
      mediaStreamRef.current = stream;
      
      setPermissionError(null);
    } catch (error: any) {
      console.error('Erro ao testar microfone:', error);
      setPermissionError('Erro ao acessar microfone. Verifique as permissões.');
      setMicLevel(0);
    } finally {
      setIsTestingDevices(false);
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraPreview(false);
    setMicLevel(0);
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  // Testar microfone quando habilitado
  useEffect(() => {
    if (enableMic) {
      testMicrophone();
    } else {
      stopMediaStream();
      setMicLevel(0);
    }
  }, [enableMic, selectedMic]);

  const handleStartStream = () => {
    if (!title.trim()) {
      setPermissionError('Digite um título para a stream!');
      return;
    }

    const config: StreamConfig = {
      title: title.trim(),
      fps,
      quality,
      enableCamera,
      enableMic,
      cameraDeviceId: enableCamera ? selectedCamera : undefined,
      micDeviceId: enableMic ? selectedMic : undefined
    };

    // Parar preview antes de iniciar
    stopMediaStream();
    
    onStartStream(config);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-900 rounded-2xl border-2 border-cyan-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-b border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Stream Setup</h2>
                <p className="text-gray-400">{gameTitle}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">{/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📝 Título da Stream *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Speedrun 100% - Super Mario World"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  maxLength={100}
                />
                <p className="text-gray-500 text-xs mt-1">{title.length}/100 caracteres</p>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ⚡ FPS da Stream
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value={5}>5 FPS (Econômico)</option>
                    <option value={10}>10 FPS (Recomendado)</option>
                    <option value={15}>15 FPS (Bom)</option>
                    <option value={20}>20 FPS (Pesado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🎨 Qualidade de Vídeo
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="low">Low (50% - Rápido)</option>
                    <option value="medium">Medium (75% - Balanceado)</option>
                    <option value="high">High (100% - Qualidade)</option>
                  </select>
                </div>
              </div>

              {/* Câmera */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-white font-bold">Câmera</h3>
                      <p className="text-gray-400 text-sm">Mostre seu rosto na stream</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnableCamera(!enableCamera)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enableCamera ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableCamera ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {enableCamera && (
                  <div className="space-y-3">
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                    >
                      {cameras.map(cam => (
                        <option key={cam.deviceId} value={cam.deviceId}>
                          {cam.label || `Câmera ${cameras.indexOf(cam) + 1}`}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={testCamera}
                        disabled={isTestingDevices}
                        className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium text-sm"
                      >
                        {isTestingDevices ? 'Testando...' : cameraPreview ? 'Parar Preview' : 'Testar Câmera'}
                      </button>
                    </div>

                    {cameraPreview && (
                      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-cyan-500">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-full object-cover mirror-video"
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 rounded text-white text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Câmera OK
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Microfone */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-pink-400" />
                    <div>
                      <h3 className="text-white font-bold">Microfone</h3>
                      <p className="text-gray-400 text-sm">Comente durante o jogo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnableMic(!enableMic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enableMic ? 'bg-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableMic ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {enableMic && (
                  <div className="space-y-3">
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    >
                      {microphones.map(mic => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || `Microfone ${microphones.indexOf(mic) + 1}`}
                        </option>
                      ))}
                    </select>

                    {/* Medidor de nível de áudio */}
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Nível de Áudio:</span>
                        <span className="text-pink-400 text-sm font-bold">{Math.round(micLevel)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                          style={{ width: `${micLevel}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">Fale algo para testar o microfone</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alertas */}
              {permissionError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-bold">Erro</p>
                    <p className="text-red-300 text-sm">{permissionError}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-500 text-2xl">⚡</div>
                  <div>
                    <h4 className="text-yellow-500 font-bold mb-1">Dica de Performance</h4>
                    <p className="text-yellow-200/80 text-sm">
                      Use <strong>10 FPS + Medium Quality</strong> para melhor experiência.
                      Câmera e microfone quase não afetam o desempenho do jogo!
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleStartStream}
              disabled={!title.trim()}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Radio className="w-5 h-5" />
              <span>Ir ao Vivo!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamSetupModal;
