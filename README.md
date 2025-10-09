# 🎮 PlayNow Emulator - Retro Gaming Platform

> Plataforma completa de jogos retro com autenticação Firebase, multiplayer e streaming

---

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Backend:** Firebase (Authentication, Firestore, Storage, Hosting)
- **Emuladores:** EmulatorJS (SNES, NES, Genesis, GBA, etc)

---

## ✨ Recursos

### 🔐 Autenticação Completa
- ✅ Login com Email/Password
- ✅ Login com Google OAuth
- ✅ Cadastro de usuários
- ✅ Reset de senha por email
- ✅ Perfis automáticos no Firestore

### 🎮 Emulador de Jogos
- ✅ Suporte a múltiplos consoles
- ✅ Save states
- ✅ Controles personalizáveis
- ✅ Fullscreen
- ✅ Upload de ROMs

### 👥 Multiplayer
- ✅ Salas de jogo em tempo real
- ✅ Chat integrado
- ✅ Sincronização de estado
- ✅ Presença de jogadores

### 📺 Live Streaming
- ✅ Streaming de gameplay
- ✅ Chat ao vivo
- ✅ Likes e viewers
- ✅ Grade de streams

---

## 🔧 Configuração

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Firebase
Arquivo `.env`:
```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

### 3️⃣ Ativar Serviços no Firebase Console

#### Authentication:
🔗 https://console.firebase.google.com/project/SEU-PROJETO/authentication/providers

- ✅ Ativar **Email/Password**
- ✅ Ativar **Google**
- ✅ Configurar email de suporte

#### Firestore:
🔗 https://console.firebase.google.com/project/SEU-PROJETO/firestore

- ✅ Criar banco de dados
- ✅ Deploy das regras: `npm run deploy:firestore`

#### Storage:
🔗 https://console.firebase.google.com/project/SEU-PROJETO/storage

- ✅ Ativar Storage
- ✅ Deploy das regras: `npm run deploy:storage`

---

## 🏃‍♂️ Comandos

### Desenvolvimento Local
```bash
npm run dev
```
Abre em: http://localhost:5173

### Build de Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

### Deploy para Firebase
```bash
npm run deploy
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Auth/           # Autenticação
│   ├── Games/          # Jogos e emulador
│   ├── Multiplayer/    # Salas multiplayer
│   ├── LiveStreaming/  # Streaming ao vivo
│   ├── Chat/           # Chat em tempo real
│   └── Layout/         # Header, Footer
├── contexts/           # Context API
│   └── AuthContext.tsx # Autenticação Firebase
├── lib/                # Utilitários
│   ├── firebase.ts     # Config Firebase
│   └── snesEmulator.ts # Emulador SNES
├── types/              # TypeScript types
└── App.tsx             # App principal
```

---

## 🔒 Segurança

### Firestore Rules
```javascript
// Usuários
- Read: Público
- Create: Autenticado (próprio perfil)
- Update/Delete: Apenas próprio perfil

// Games
- Read: Público
- Write: Autenticado

// Game Sessions & Live Streams
- Read: Público
- Write: Autenticado
```

### Storage Rules
```javascript
// Avatares e imagens
- Upload: Apenas autenticado
- Download: Público
- Limite: 5MB por arquivo
```

---

## 🌐 Deploy

### Firebase Hosting
```bash
# Build + Deploy
npm run build
npm run deploy

# Ou comando direto
npx firebase-tools deploy
```

### URL de Produção
https://planowemulator.web.app

---

## 📊 Coleções Firestore

### `users/{userId}`
```typescript
{
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  is_online: boolean
  last_seen: string
}
```

### `games/{gameId}`
```typescript
{
  id: string
  title: string
  console: string
  rom_url: string
  cover_url: string
  description: string
  release_year: number
  players: number
}
```

### `game_sessions/{sessionId}`
```typescript
{
  id: string
  game_id: string
  host_id: string
  max_players: number
  current_players: number
  status: 'waiting' | 'playing' | 'finished'
  created_at: string
}
```

Subcoleções:
- `players/{playerId}` - Jogadores na sala
- `presence/{userId}` - Presença em tempo real
- `game_inputs/{inputId}` - Inputs do jogo
- `game_sync/{syncId}` - Sincronização de estado
- `chat/{messageId}` - Chat da sala

### `live_streams/{streamId}`
```typescript
{
  id: string
  streamer_id: string
  game_id: string
  title: string
  viewers_count: number
  is_live: boolean
  started_at: string
}
```

Subcoleções:
- `chat/{messageId}` - Chat do stream
- `likes/{userId}` - Likes
- `viewers/{userId}` - Viewers ativos
- `frames/{frameId}` - Frames do stream

---

## 🐛 Troubleshooting

### Erros Comuns

#### ❌ "Pop-up blocked" (Google Sign-In)
**Solução:** Permitir pop-ups no navegador

#### ❌ "Unauthorized domain"
**Solução:** Adicionar domínio em Authentication > Settings > Authorized domains

#### ❌ "Permission denied" (Firestore)
**Solução:** Deploy das regras: `npx firebase-tools deploy --only firestore:rules`

#### ❌ Build muito grande
**Solução:** Code splitting está na lista de melhorias futuras

---

## 📝 TODO / Melhorias Futuras

- [ ] Code splitting para reduzir bundle size
- [ ] PWA support
- [ ] Notificações push
- [ ] Ranking de jogadores
- [ ] Achievements/Trophies
- [ ] Torneios online
- [ ] Voice chat
- [ ] Gravação de gameplay
- [ ] Compartilhamento social

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja LICENSE para detalhes

---

## 👨‍💻 Desenvolvedor

**Felipe Andrade**
- GitHub: [@felipelahhouse](https://github.com/felipelahhouse)
- Projeto: [playnowemulator](https://github.com/felipelahhouse/playnowemulator)

---

## 🎯 Status do Projeto

✅ **EM PRODUÇÃO** - https://planowemulator.web.app

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
