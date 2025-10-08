# 🎮 INSTRUÇÕES FINAIS - Adicionar Jogos ao Site

## ✅ O que já foi feito:

1. **29 ROMs copiadas** para `/project/public/roms/`
2. **22 capas de jogos** copiadas para `/project/public/`
3. **Código atualizado** para mapear automaticamente as capas aos jogos
4. **Servidor rodando** em http://localhost:5173

## 📝 O que você precisa fazer agora:

### Opção 1: SQL Editor (MAIS FÁCIL) ⭐ RECOMENDADO

1. Acesse seu projeto no Supabase: https://app.supabase.com
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"**
4. Abra o arquivo **`games-insert.sql`** que criei
5. Copie TODO o conteúdo do arquivo
6. Cole no SQL Editor do Supabase
7. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)
8. ✅ Pronto! Todos os 29 jogos serão adicionados de uma vez!

### Opção 2: Table Editor (Manual)

1. Acesse seu projeto no Supabase
2. Vá em **"Table Editor"** → Selecione **"games"**
3. Clique em **"Insert"** → **"Insert row"**
4. Preencha cada campo manualmente com os dados do arquivo `add-games.js`
5. Repita para cada um dos 29 jogos

### Opção 3: Script Node.js (Avançado)

1. Abra o arquivo `add-games.js`
2. Na linha 4, substitua `YOUR_SUPABASE_URL` pela URL do seu projeto
3. Na linha 5, substitua `YOUR_SUPABASE_ANON_KEY` pela sua chave anônima
4. Execute: `node add-games.js`

## 🎯 Encontrar suas credenciais do Supabase:

1. Vá em https://app.supabase.com
2. Selecione seu projeto
3. Clique em **"Settings"** (⚙️) no menu lateral
4. Clique em **"API"**
5. Você verá:
   - **Project URL**: Este é o `SUPABASE_URL`
   - **anon/public**: Esta é a `SUPABASE_ANON_KEY`

## 📊 Lista de Jogos que serão adicionados:

### Plataforma (9 jogos)
- Aladdin ⭐ 4.5
- Donkey Kong Country ⭐ 4.9
- Super Mario World ⭐ 5.0
- Joe & Mac 2 ⭐ 4.1
- Prehistorik Man ⭐ 4.0
- The Magical Quest Starring Mickey Mouse ⭐ 4.5
- Mickey to Donald: Magical Adventure 3 ⭐ 4.2
- Mega Man X ⭐ 4.9
- Super Star Wars: Empire Strikes Back ⭐ 4.5

### Luta (7 jogos)
- Dragon Ball Z: Super Butouden 2 ⭐ 4.5
- Fatal Fury 2 ⭐ 4.2
- Fatal Fury Special ⭐ 4.4
- Killer Instinct ⭐ 4.8
- Street Fighter Alpha 2 ⭐ 4.7
- Super Street Fighter II ⭐ 4.8
- TMNT: Tournament Fighters ⭐ 4.4

### Ação (10 jogos)
- Battletoads & Double Dragon ⭐ 4.3
- Battletoads in Battlemaniacs ⭐ 4.4
- Castlevania: Dracula X ⭐ 4.6
- Mighty Morphin Power Rangers ⭐ 4.1
- Mighty Morphin Power Rangers: The Movie ⭐ 4.0
- Mutant Chronicles: Doom Troopers ⭐ 3.9
- Sparkster ⭐ 4.3
- Super Double Dragon ⭐ 4.2
- TMNT IV: Turtles in Time ⭐ 4.8

### Corrida (2 jogos)
- Super Mario Kart ⭐ 4.9
- Top Gear ⭐ 4.6

### Outros
- Goof Troop (Puzzle) ⭐ 4.0
- International Superstar Soccer Deluxe (Sports) ⭐ 4.7

## 🎨 Capas Mapeadas:

✅ Com capa própria (19 jogos):
- Aladdin
- Battletoads & Double Dragon
- Battletoads in Battlemaniacs
- Castlevania: Dracula X
- Donkey Kong Country
- Dragon Ball Z
- Fatal Fury 2
- Fatal Fury Special
- Goof Troop
- International Superstar Soccer Deluxe
- Joe & Mac 2
- Killer Instinct
- The Magical Quest Starring Mickey Mouse
- Mickey to Donald: Magical Adventure 3
- Mighty Morphin Power Rangers (ambas versões)
- Street Fighter Alpha 2
- Super Double Dragon
- Super Mario Kart
- Super Mario World
- Super Star Wars
- Top Gear

⚠️ Usando capa placeholder (10 jogos):
- Mega Man X
- Mutant Chronicles
- Prehistorik Man
- Sparkster
- Super Street Fighter II
- TMNT: Tournament Fighters
- TMNT IV: Turtles in Time

## 🚀 Depois de adicionar os jogos:

1. Acesse: http://localhost:5173
2. Role até a seção "RETRO GAME LIBRARY"
3. Você verá todos os 29 jogos com suas capas!
4. Clique em qualquer jogo para jogar instantaneamente

## 🎮 Recursos do Site:

- ✅ Emulador SNES funcional
- ✅ 29 jogos prontos para jogar
- ✅ Capas em alta qualidade
- ✅ Busca e filtros por gênero
- ✅ Sistema de ratings
- ✅ Contador de plays
- ✅ Modal player com controles
- ✅ Design cyberpunk moderno

## 📁 Arquivos Importantes:

- `games-insert.sql` - SQL para inserir todos os jogos (USE ESTE!)
- `add-games.js` - Script Node.js alternativo
- `ADICIONAR-JOGOS.md` - Documentação detalhada
- `/public/roms/` - Pasta com todas as ROMs
- `/public/*.jpg|png|webp` - Capas dos jogos

---

**Pronto para jogar!** 🎮✨

Depois de executar o SQL, atualize a página e todos os jogos aparecerão automaticamente!
