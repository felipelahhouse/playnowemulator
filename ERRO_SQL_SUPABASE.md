# 🔴 ERRO CRÍTICO: Tabelas SQL Não Aplicadas no Supabase

## 📋 Problema Identificado

O código React está tentando acessar tabelas SQL que **AINDA NÃO EXISTEM** no banco de dados Supabase:

### ❌ Tabelas Faltando:
1. `user_stats` - Estatísticas do usuário (XP, level, tempo jogado)
2. `user_achievements` - Conquistas desbloqueadas
3. `achievements` - Lista de conquistas disponíveis
4. `user_favorites` - Jogos favoritos
5. `play_history` - Histórico de jogos
6. `friendships` - Sistema de amizades
7. `notifications` - Notificações

### 🐛 Onde o Erro Aparece:
- **UserDashboard.tsx** (linhas 55-95): Tenta buscar `user_stats`, `user_achievements`, `play_history`
- **Quando**: Usuário acessa o dashboard/perfil
- **Resultado**: Erros 404 no console, dados não carregam

## 🔧 SOLUÇÃO: Aplicar Migration no Supabase

### Passo 1: Abrir Supabase Dashboard
1. Acesse: https://ffmyoutiutemmrmvxzig.supabase.co
2. Login com sua conta
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar a Migration
1. Clique em **+ New Query**
2. **COPIE TODO O CONTEÚDO** do arquivo:
   ```
   /supabase/migrations/20251009110000_add_user_features.sql
   ```
3. Cole no editor SQL
4. Clique em **RUN** (botão verde no canto inferior direito)
5. Aguarde mensagem de sucesso ✅

### Passo 3: Verificar Criação das Tabelas
No SQL Editor, execute:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- ✅ achievements
- ✅ friendships
- ✅ notifications
- ✅ play_history
- ✅ user_achievements
- ✅ user_favorites
- ✅ user_stats
- (+ as tabelas antigas: users, games, game_sessions, etc)

### Passo 4: Testar no Website
1. Faça logout do site
2. Faça login novamente
3. Acesse seu perfil/dashboard
4. Você deve ver:
   - ✅ Level 1, 50 XP (conquista "Bem-vindo" desbloqueada automaticamente)
   - ✅ Estatísticas zeradas mas funcionando
   - ✅ Conquistas disponíveis para desbloquear

## 🎯 O Que Essa Migration Faz

### 1. Cria Sistema de XP e Levels
- Usuários ganham XP fazendo ações
- Level calculado automaticamente: Level = √(XP/100) + 1
- Exemplo: 0 XP = Level 1, 100 XP = Level 2, 400 XP = Level 3

### 2. Cria 25 Conquistas
Categorias:
- **Primeiros Passos**: Bem-vindo, Primeiro Jogo, Foto de Perfil
- **Jogos**: Explorador, Colecionador, Veterano, Dedicado, Hardcore Gamer, Lenda
- **Multiplayer**: Host Iniciante, Jogador Social, Mestre do Multiplayer
- **Streaming**: Streamer Novato, Streamer Regular, Estrela Nascente
- **Social**: Fazendo Amigos, Popular, Influencer
- **Especiais**: Coruja Noturna, Madrugador, Halloween 2024, Velocista, Completista, Jogador Lendário

### 3. Triggers Automáticos
- ✅ Quando usuário cria conta → cria `user_stats` automaticamente
- ✅ Quando usuário cria conta → desbloqueia conquista "Bem-vindo" + 50 XP
- ✅ Quando desbloqueia conquista → adiciona XP automaticamente
- ✅ Quando sobe de level → cria notificação

### 4. Funções SQL Prontas
```sql
-- Adicionar XP (atualiza level automaticamente)
SELECT add_user_xp('user_id_aqui', 100);

-- Desbloquear conquista (adiciona XP automaticamente)
SELECT unlock_achievement('user_id_aqui', 'first_game');
```

## 📊 Estrutura das Tabelas

### user_stats
```
id, user_id, total_playtime, games_played, 
multiplayer_sessions, streams_created, 
level, experience, created_at, updated_at
```

### achievements
```
id, key, title, description, icon (emoji), 
xp_reward, rarity, created_at
```

### user_achievements
```
id, user_id, achievement_id, unlocked_at
```

### play_history
```
id, user_id, game_id, playtime, 
last_played, times_played, created_at
```

### user_favorites
```
id, user_id, game_id, created_at
```

### friendships
```
id, user_id, friend_id, status, 
created_at, updated_at
```

### notifications
```
id, user_id, type, title, message, 
data (jsonb), read, created_at
```

## 🔒 Segurança (RLS Policies)

Todas as tabelas têm **Row Level Security (RLS)** ativado:
- ✅ Usuários só veem seus próprios dados
- ✅ Conquistas são públicas (todos podem ver a lista)
- ✅ Sistema pode criar notificações para qualquer usuário
- ✅ Amizades são visíveis para ambos os usuários

## 🚀 Após Aplicar a Migration

### O que vai funcionar:
1. ✅ Dashboard mostrará XP, Level, Stats
2. ✅ Conquistas aparecerão no perfil
3. ✅ Histórico de jogos será rastreado
4. ✅ Favoritos funcionarão
5. ✅ Sistema de notificações ativo
6. ✅ Base para sistema de amizades

### Próximos Passos (Opcional):
- Integrar desbloquear conquistas no código React
- Adicionar contador de tempo jogado
- Criar UI para notificações
- Implementar sistema de amizades
- Adicionar favoritos na biblioteca de jogos

## ⚠️ IMPORTANTE

**NÃO DELETE ESTA MIGRATION!** 
- Ela é essencial para o funcionamento do sistema de usuários
- Sem ela, o dashboard ficará quebrado
- Todos os usuários novos precisam dessas tabelas

## 🔍 Como Debugar Problemas

Se ainda houver erros após aplicar a migration:

### 1. Verificar no Console do Browser (F12)
```javascript
// Erros comuns:
❌ "relation 'user_stats' does not exist" → Migration não foi aplicada
❌ "new row violates row-level security" → Problema com policies RLS
✅ Sem erros → Funcionando!
```

### 2. Testar Manualmente no SQL Editor
```sql
-- Ver suas stats (substitua USER_ID)
SELECT * FROM user_stats WHERE user_id = 'SEU_USER_ID_AQUI';

-- Ver conquistas desbloqueadas
SELECT ua.*, a.title, a.icon 
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'SEU_USER_ID_AQUI';

-- Desbloquear conquista manualmente (teste)
SELECT unlock_achievement('SEU_USER_ID_AQUI', 'first_game');
```

### 3. Verificar Logs do Supabase
- Dashboard → Logs → SQL Logs
- Procure por erros relacionados a policies ou permissions

---

## 📞 Resumo da Solução

**EM 3 PASSOS:**
1. 🔗 Abrir https://ffmyoutiutemmrmvxzig.supabase.co
2. 📝 SQL Editor → Cole todo conteúdo de `20251009110000_add_user_features.sql`
3. ▶️ Clicar **RUN**

**PRONTO!** 🎉 O dashboard vai funcionar corretamente.
