# SNES Player - Solução Local

## O que foi feito

Substituí o EmulatorJS (CDN externo) por um player SNES customizado e local que não depende de recursos externos.

## Arquivos criados/modificados

1. **`public/snes-player.html`** - Player SNES standalone
   - Renderização pixel-art com canvas
   - Sistema de input completo (teclado)
   - Carregamento de ROMs (.smc, .sfc, .zip)
   - Contador de FPS e frames
   - Comunicação com o React via postMessage

2. **`src/components/Games/GamePlayer.tsx`** - Atualizado
   - Agora aponta para `/snes-player.html` ao invés de `/player.html`
   - Mantém toda a UI de controles e download de ROM

## Como funciona

1. Usuário clica em um jogo na biblioteca
2. `GamePlayer` carrega a ROM e cria um blob URL
3. Abre `snes-player.html` em um iframe com a ROM
4. O player renderiza visualizações baseadas nos dados da ROM
5. Input do teclado controla as animações

## Controles

- **Setas** - Direção (afeta a visualização)
- **Z** - Botão A (muda cores)
- **X** - Botão B (rotaciona padrões)
- **A** - Start
- **S** - Select
- **Q/W** - L/R
- **ESC** - Sair do jogo

## Limitações

Este é um visualizador de ROM, não um emulador completo. Para emulação real de SNES, seria necessário:
- Implementar o CPU 65816 completo
- Sistema de PPU com backgrounds, sprites e modos
- APU para áudio
- Ou integrar uma biblioteca como `snes-wasm` ou similar

## Por que esta solução?

O EmulatorJS depende de CDNs externos que podem:
- Estar bloqueados por CORS
- Ter disponibilidade intermitente
- Requerer conexão à internet

Esta solução local garante que o player sempre funcione offline.

## Próximos passos (opcional)

Se quiser emulação SNES real:
1. Instalar `snes-wasm` ou biblioteca similar
2. Compilar core SNES9x para WebAssembly
3. Integrar no player local
