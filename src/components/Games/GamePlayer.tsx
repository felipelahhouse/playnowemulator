import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DoorOpen, Download, Info, Keyboard, Loader2, RotateCcw, X } from 'lucide-react';
import JSZip from 'jszip';

interface GamePlayerProps {
  gameTitle: string;
  romPath: string;
  onClose: () => void;
}

type RomSource = {
  url: string;
  size: number;
  fileName: string;
  format: string;
};

const GamePlayer: React.FC<GamePlayerProps> = ({ gameTitle, romPath, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const romUrlRef = useRef<string | null>(null);

  const [romSource, setRomSource] = useState<RomSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Preparando emulador...');
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (romUrlRef.current) {
      URL.revokeObjectURL(romUrlRef.current);
      romUrlRef.current = null;
    }
    setRomSource(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      if (romUrlRef.current) {
        URL.revokeObjectURL(romUrlRef.current);
        romUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', escHandler);
    return () => {
      window.removeEventListener('keydown', escHandler);
    };
  }, [handleClose]);

  const loadRom = useCallback(async () => {
    try {
      setError(null);
      setStatus('Baixando ROM do jogo...');
      setLoading(true);

      if (romUrlRef.current) {
        URL.revokeObjectURL(romUrlRef.current);
        romUrlRef.current = null;
      }

      const response = await fetch(romPath);
      if (!response.ok) {
        throw new Error(`Falha ao carregar ROM (${response.status})`);
      }

      const buffer = await response.arrayBuffer();

      let romBytes = new Uint8Array(buffer);
      let romName = romPath.split('/').pop() ?? 'game.smc';

      if (romPath.toLowerCase().endsWith('.zip')) {
        setStatus('Extraindo ROM do arquivo ZIP...');
        const zip = await JSZip.loadAsync(buffer);
        const romEntry = Object.values(zip.files).find(
          (file) => !file.dir && /(\.smc|\.sfc|\.fig)$/i.test(file.name)
        );

        if (!romEntry) {
          throw new Error('Nenhum arquivo .smc ou .sfc válido encontrado no ZIP');
        }

        romName = romEntry.name.split('/').pop() ?? romEntry.name;
        const romBuffer = await romEntry.async('arraybuffer');
        romBytes = new Uint8Array(romBuffer);
      }

      if (romBytes.length < 1024) {
        throw new Error('Arquivo ROM inválido ou corrompido');
      }

      const blob = new Blob([romBytes], { type: 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      romUrlRef.current = objectUrl;

      setRomSource({
        url: objectUrl,
        size: romBytes.length,
        fileName: romName,
        format: romName.split('.').pop()?.toUpperCase() ?? 'SMC'
      });

      setStatus('Preparando emulador...');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o jogo');
      setLoading(false);
    }
  }, [romPath]);

  useEffect(() => {
    loadRom();
  }, [loadRom]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'emulator-ready') {
        setStatus('Rodando');
        setLoading(false);
      }

      if (event.data?.type === 'emulator-error') {
        setError(event.data.message || 'Erro ao iniciar o emulador');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const iframeSrc = useMemo(() => {
    if (!romSource) {
      return undefined;
    }

    const params = new URLSearchParams({
      rom: romSource.url,
      title: gameTitle
    });

    return `/new-snes-player.html?${params.toString()}`;
  }, [romSource, gameTitle]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      handleClose();
    }
  };

  const handleRetry = () => {
    setError(null);
    loadRom();
  };

  const handleRestart = () => {
    loadRom();
  };

  const downloadHref = useMemo(() => {
    if (!romSource) return undefined;
    return romSource.url;
  }, [romSource]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-6xl bg-gray-950 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at top, rgba(34,211,238,0.12), transparent 55%), radial-gradient(circle at bottom, rgba(147,51,234,0.12), transparent 55%)'
          }}
        />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400/70 font-semibold mb-1">SNES Arcade</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">{gameTitle}</h2>
                {romSource && (
                  <p className="text-sm text-gray-400 mt-2 font-medium">
                    {romSource.fileName} · {romSource.format} · {formatSize(romSource.size)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 hover:border-cyan-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reiniciar
                </button>

                {downloadHref && (
                  <a
                    href={downloadHref}
                    download={romSource?.fileName ?? `${gameTitle}.smc`}
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/25 hover:border-purple-400"
                  >
                    <Download className="h-4 w-4" />
                    Baixar ROM
                  </a>
                )}

                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 hover:border-rose-400"
                >
                  <DoorOpen className="h-4 w-4" />
                  Sair do jogo
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-800 bg-black/80 overflow-hidden">
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-cyan-100">{status}</p>
                    <p className="text-xs text-gray-400">Isso pode levar alguns segundos na primeira vez.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/95">
                  <div className="rounded-full border border-rose-500/30 bg-rose-500/10 p-4">
                    <X className="h-8 w-8 text-rose-400" />
                  </div>
                  <p className="max-w-md text-center text-sm text-gray-300">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 hover:border-cyan-400"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Tentar novamente
                    </button>
                    <button
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700/90"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {iframeSrc && (
                <iframe
                  ref={iframeRef}
                  title={`${gameTitle} SNES Player`}
                  src={iframeSrc}
                  className="relative z-10 h-[60vh] w-full min-h-[420px] bg-black"
                  allow="fullscreen"
                  onLoad={() => setStatus('Iniciando emulador...')}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-2 text-cyan-200 font-semibold text-sm uppercase tracking-wide mb-2">
                  <Keyboard className="h-4 w-4" />
                  Controles padrão
                </div>
                <ul className="space-y-2 text-xs text-cyan-50/80 font-medium">
                  <li><span className="text-cyan-100 font-semibold">Setas</span> · Direção</li>
                  <li><span className="text-cyan-100 font-semibold">A / S</span> · Start / Select</li>
                  <li><span className="text-cyan-100 font-semibold">Z / X / C / D</span> · Botões A · B · Y · X</li>
                  <li><span className="text-cyan-100 font-semibold">Q / W</span> · L / R</li>
                  <li><span className="text-cyan-100 font-semibold">Enter</span> · Menu do emulador</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                <div className="flex items-center gap-2 text-purple-200 font-semibold text-sm uppercase tracking-wide mb-2">
                  <Info className="h-4 w-4" />
                  Emulador SNES Real
                </div>
                <ul className="space-y-2 text-xs text-purple-50/80 font-medium">
                  <li>🎮 Emulação completa de SNES com core SNES9x</li>
                  <li>💾 Suporte a save states (Enter no menu)</li>
                  <li>🔊 Áudio e vídeo sincronizados</li>
                  <li>⚡ Jogabilidade em 60 FPS</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-emerald-200 font-semibold text-sm uppercase tracking-wide mb-2">
                  Status
                </div>
                <dl className="space-y-2 text-xs text-emerald-50/80 font-medium">
                  <div className="flex justify-between">
                    <dt>Emulador</dt>
                    <dd className={`font-semibold ${error ? 'text-rose-200' : loading ? 'text-amber-200' : 'text-emerald-100'}`}>
                      {error ? 'Erro' : loading ? 'Inicializando...' : 'Rodando'}
                    </dd>
                  </div>
                  {romSource && (
                    <>
                      <div className="flex justify-between">
                        <dt>Tamanho da ROM</dt>
                        <dd className="font-semibold text-emerald-100">{formatSize(romSource.size)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Formato</dt>
                        <dd className="font-semibold text-emerald-100">{romSource.format}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <dt>Saída</dt>
                    <dd className="font-semibold text-emerald-100">Esc ou “Sair do jogo”</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
      </div>
    </div>
  );
};

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, power);
  const shouldRound = size >= 10 || Math.abs(size - Math.round(size)) < 1e-6;
  return `${shouldRound ? Math.round(size) : size.toFixed(1)} ${units[power]}`;
}

export default GamePlayer;
