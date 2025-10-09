# 🎬 Guia de Configuração de Live Stream

## 📋 Visão Geral

Agora o sistema possui um **modal de configuração completo** antes de iniciar qualquer live stream!

---

## 🚀 Como Usar

### Passo 1: Iniciar Configuração
1. Na biblioteca de jogos, clique no botão **LIVE** (vermelho/rosa)
2. O modal de configuração aparecerá automaticamente

### Passo 2: Configurar Stream

#### 📝 Título da Stream
- **Campo obrigatório**
- Máximo de 100 caracteres
- Exemplo: "Speedrun 100% - Super Mario World"
- Dica: Use títulos descritivos e atraentes!

#### ⚡ FPS da Stream
Opções disponíveis:
- **5 FPS** - Econômico (menor uso de dados)
- **10 FPS** - Recomendado (melhor custo-benefício) ⭐
- **15 FPS** - Bom (mais fluido)
- **20 FPS** - Pesado (máxima qualidade, alto uso)

**Recomendação:** Use 10 FPS para melhor experiência

#### 🎨 Qualidade de Vídeo
- **Low (50%)** - Rápido, menor qualidade
- **Medium (75%)** - Balanceado ⭐
- **High (100%)** - Máxima qualidade, mais pesado

**Recomendação:** Use Medium para equilíbrio perfeito

---

## 📹 Configuração de Câmera

### Ativar Câmera
1. **Toggle ON** - Liga/desliga a câmera
2. **Selecionar dispositivo** - Escolha qual câmera usar
3. **Testar Câmera** - Veja preview em tempo real

### Preview da Câmera
- Preview aparece em tempo real
- Efeito espelho automático (mirror)
- Badge verde "Câmera OK" quando funcionando
- Resolução: 320x240 (otimizado)

### Mensagens de Erro
- "Erro ao acessar câmera" - Verifique permissões
- Certifique-se de permitir acesso no navegador

---

## 🎤 Configuração de Microfone

### Ativar Microfone
1. **Toggle ON** - Liga/desliga o microfone
2. **Selecionar dispositivo** - Escolha qual microfone usar
3. **Medidor de áudio** - Veja nível em tempo real

### Medidor de Nível de Áudio
- Barra visual de 0% a 100%
- Gradiente verde → amarelo → vermelho
- Atualizações em tempo real
- **Teste:** Fale algo e veja a barra reagir!

### Processamento de Áudio
Automaticamente aplicados:
- ✅ Echo Cancellation (cancelamento de eco)
- ✅ Noise Suppression (redução de ruído)
- ✅ Auto Gain Control (ganho automático)

---

## 🎯 Começando a Live

### Validações
Antes de ir ao vivo:
- ✅ Título preenchido (obrigatório)
- ✅ Câmera testada (se ativada)
- ✅ Microfone testado (se ativado)

### Botão "Ir ao Vivo!"
- **Clique** - Inicia stream imediatamente
- Dispositivos configurados já estarão ativos
- Stream começa com todas as configurações aplicadas

---

## 🔧 Configurações Técnicas Detalhadas

### Dispositivos Múltiplos
O sistema detecta automaticamente:
- 📹 Todas câmeras disponíveis (webcam, externa, etc)
- 🎤 Todos microfones disponíveis (integrado, USB, etc)
- 🎧 Labels completos dos dispositivos

### Device ID Específico
- Cada dispositivo selecionado usa `deviceId` específico
- Garante que o dispositivo correto seja usado
- Evita conflitos com múltiplos dispositivos

### Resolução da Câmera
```javascript
width: 320px
height: 240px
facingMode: 'user' (câmera frontal)
```

### Qualidade de Áudio
```javascript
echoCancellation: true
noiseSuppression: true
autoGainControl: true
```

---

## 💡 Dicas de Performance

### Configuração Recomendada
```
FPS: 10
Qualidade: Medium (75%)
Câmera: ON (320x240)
Microfone: ON (com processamento)
```

**Resultado:**
- ✅ Qualidade excelente
- ✅ Performance estável
- ✅ Baixo uso de CPU
- ✅ Stream fluida

### Configuração Econômica
```
FPS: 5
Qualidade: Low (50%)
Câmera: OFF
Microfone: ON
```

**Ideal para:**
- Internet lenta
- Computadores mais fracos
- Streams focadas em áudio

### Configuração Premium
```
FPS: 15-20
Qualidade: High (100%)
Câmera: ON
Microfone: ON
```

**Requer:**
- Internet boa (5+ Mbps upload)
- Computador moderno
- Navegador atualizado

---

## 🎬 Durante a Live

### O que acontece?
1. **Título** - Usado na stream (visível para espectadores)
2. **FPS** - Define taxa de atualização dos frames
3. **Qualidade** - Define compressão do vídeo (JPEG quality)
4. **Câmera** - Preview no canto inferior direito
5. **Microfone** - Badge "ON AIR" no canto superior esquerdo

### Visual na Tela
```
┌─────────────────────────────────┐
│ [ON AIR] 🔴 (se mic ligado)     │
│                                  │
│        GAMEPLAY AQUI             │
│                                  │
│                    ┌──────┐      │
│                    │CAMERA│      │
│                    └──────┘      │
└─────────────────────────────────┘
```

---

## ⚙️ Alterações Durante Stream

### Pode alterar:
- ✅ FPS (sem resetar stream)
- ✅ Qualidade (sem resetar stream)
- ✅ Ligar/desligar câmera
- ✅ Ligar/desligar microfone

### NÃO pode alterar:
- ❌ Título (definido no início)
- ❌ Dispositivos (depois de iniciar)

**Solução:** Pare a stream e reinicie com novas configurações

---

## 🐛 Troubleshooting

### "Erro ao acessar câmera"
**Soluções:**
1. Permitir acesso no navegador
2. Verificar se outra app está usando
3. Testar outro dispositivo
4. Reiniciar navegador

### "Erro ao acessar microfone"
**Soluções:**
1. Permitir acesso no navegador
2. Verificar configurações do sistema
3. Testar outro microfone
4. Fechar apps de vídeo/áudio

### "Câmera sem preview"
**Soluções:**
1. Clique em "Testar Câmera"
2. Verifique iluminação
3. Teste outro navegador
4. Atualize drivers da webcam

### "Medidor de áudio não funciona"
**Soluções:**
1. Certifique-se que toggle está ON
2. Fale mais alto
3. Verifique volume do sistema
4. Teste outro microfone

---

## 📊 Comparação: Antes vs Agora

### ❌ Antes (Sem Configuração)
- Iniciava direto sem opções
- Sem preview de câmera
- Sem teste de microfone
- Configurações fixas
- Sem seleção de dispositivos

### ✅ Agora (Com Modal)
- Modal completo de setup
- Preview em tempo real da câmera
- Medidor de nível de áudio
- Todas configurações ajustáveis
- Seleção específica de dispositivos
- Validação antes de iniciar
- Título personalizado
- Otimizações automáticas

---

## 🎯 Checklist para Live Perfeita

Antes de clicar "Ir ao Vivo":

- [ ] Título criativo e descritivo
- [ ] FPS configurado (recomendado: 10)
- [ ] Qualidade selecionada (recomendado: Medium)
- [ ] Câmera testada (preview funcionando)
- [ ] Microfone testado (barra de áudio reagindo)
- [ ] Dispositivos corretos selecionados
- [ ] Permissões do navegador concedidas
- [ ] Internet estável

---

## 🚀 Próximas Features

Futuras melhorias planejadas:

- [ ] Filtros de câmera (blur, beauty, etc)
- [ ] Overlays personalizados
- [ ] Chat preview no modal
- [ ] Estatísticas de conexão
- [ ] Modo "Só Áudio"
- [ ] Gravação local
- [ ] Agendamento de streams
- [ ] Templates de configuração

---

## 📝 Notas Técnicas

### Implementação
- **Modal:** `StreamSetupModal.tsx`
- **Integração:** `App.tsx` → passa config para `StreamerView.tsx`
- **Device Selection:** `navigator.mediaDevices.enumerateDevices()`
- **Audio Level:** Web Audio API com `AnalyserNode`

### Estados
```typescript
interface StreamConfig {
  title: string;                  // Título da stream
  fps: number;                    // 5, 10, 15, 20
  quality: 'high'|'medium'|'low'; // Qualidade
  enableCamera: boolean;          // Câmera ON/OFF
  enableMic: boolean;             // Mic ON/OFF
  cameraDeviceId?: string;        // ID do dispositivo
  micDeviceId?: string;           // ID do dispositivo
}
```

### Fluxo
1. User clica LIVE → `handleStartStream(game)`
2. `setStreamSetupData({ game })` → Abre modal
3. User configura tudo → Clica "Ir ao Vivo"
4. `handleConfirmStreamSetup(config)` → Passa config
5. `StreamerView` recebe config → Inicia com tudo configurado

---

**🎮 Agora suas lives estão profissionais! 🚀**

Divirta-se streamando! 🎉
