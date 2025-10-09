# 🔧 GUIA: RESET COMPLETO DO BANCO DE DADOS SUPABASE

## ⚠️ ATENÇÃO - LEIA ANTES DE EXECUTAR!

Este script vai **DELETAR TUDO** e recriar do zero:
- ❌ Todos os dados serão perdidos
- ❌ Todos os usuários serão removidos
- ❌ Todas as sessões serão deletadas

**FAÇA BACKUP se tiver dados importantes!**

---

## 📋 O QUE O SCRIPT FAZ?

✅ **Remove TUDO:**
- Deleta todas as políticas RLS antigas
- Remove todos os triggers
- Apaga todas as funções
- Deleta todas as tabelas

✅ **Recria DO ZERO:**
- 11 tabelas principais
- RLS habilitado em todas
- Políticas de acesso corretas
- Triggers automáticos
- Funções auxiliares
- 5 conquistas iniciais

✅ **Tabelas criadas:**
1. `users` - Perfis de usuários
2. `games` - Catálogo de jogos
3. `game_sessions` - Salas multiplayer
4. `streams` - Transmissões ao vivo
5. `stream_viewers` - Espectadores
6. `user_stats` - Estatísticas (XP, level, etc)
7. `achievements` - Conquistas disponíveis
8. `user_achievements` - Conquistas desbloqueadas
9. `play_history` - Histórico de jogatina
10. `friendships` - Sistema de amigos
11. `notifications` - Notificações

---

## 🚀 COMO APLICAR (5 MINUTOS)

### **OPÇÃO 1: Copiar e Colar no Supabase**

1. **Abra o Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Login com sua conta
   - Selecione seu projeto: `ffmyoutiutemmrmvxzig`

2. **Vá para o SQL Editor:**
   - No menu lateral esquerdo, clique em **"SQL Editor"**
   - Clique em **"+ New query"**

3. **Cole o script:**
   - Abra o arquivo: `RESET_DATABASE_COMPLETO.sql`
   - Selecione TUDO (Cmd+A ou Ctrl+A)
   - Copie (Cmd+C ou Ctrl+C)
   - Cole no SQL Editor do Supabase

4. **Execute:**
   - Clique no botão **"Run"** (ou pressione Cmd+Enter)
   - Aguarde 30-60 segundos
   - Deve aparecer mensagem de sucesso

5. **Verifique:**
   - Vá em **"Table Editor"** no menu lateral
   - Verifique se todas as 11 tabelas foram criadas
   - Deve ver: users, games, game_sessions, streams, etc.

---

### **OPÇÃO 2: Upload do arquivo SQL**

1. Acesse Supabase Dashboard
2. Vá em **"SQL Editor"**
3. Clique em **"Upload SQL file"**
4. Selecione: `RESET_DATABASE_COMPLETO.sql`
5. Clique em **"Run"**

---

## ✅ VERIFICAÇÃO

Após executar, verifique:

### 1️⃣ **Tabelas criadas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deve mostrar: achievements, friendships, game_sessions, games, notifications, play_history, stream_viewers, streams, user_achievements, user_stats, users

### 2️⃣ **RLS habilitado:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Todos devem ter `rowsecurity = true`

### 3️⃣ **Políticas criadas:**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deve mostrar várias políticas para cada tabela

### 4️⃣ **Conquistas inseridas:**
```sql
SELECT * FROM achievements;
```

Deve mostrar 5 conquistas

---

## 🔄 APÓS EXECUTAR

1. **Teste criar uma conta nova:**
   - Vá no seu site
   - Crie uma conta
   - Deve funcionar sem erros

2. **Verifique se o perfil foi criado:**
   ```sql
   SELECT * FROM users;
   ```
   Deve mostrar o usuário que você acabou de criar

3. **Verifique se as stats foram criadas:**
   ```sql
   SELECT * FROM user_stats;
   ```
   Deve ter um registro para o novo usuário

---

## 🐛 SE DER ERRO

### **Erro: "permission denied"**
- Você precisa estar logado como Owner do projeto
- Vá em Settings → Database → Reset Database (se necessário)

### **Erro: "relation already exists"**
- Algumas tabelas não foram deletadas
- Execute primeiro só a parte de DROP (linhas 12-80)
- Depois execute o resto

### **Erro: "function does not exist"**
- Ignore, é normal
- O script vai recriar tudo

---

## 📊 FEATURES INCLUÍDAS

### 🎮 **Sistema de Jogos:**
- Catálogo de jogos com multiplayer support
- ROMs armazenadas
- Metadados (ano, gênero, publisher)

### 👥 **Sistema Multiplayer:**
- Salas públicas e privadas
- Códigos de sala únicos
- Controle de jogadores (max/current)
- Status (waiting, playing, finished)

### 📺 **Sistema de Streaming:**
- Streams ao vivo
- Contador de viewers
- Stream keys únicos
- Thumbnails e metadados

### 🏆 **Sistema de Conquistas:**
- XP e níveis
- Moedas virtuais
- Conquistas raras e lendárias
- Histórico de jogatina

### 👫 **Sistema Social:**
- Amizades (pending, accepted, blocked)
- Notificações
- Perfis públicos

### 🔒 **Segurança:**
- RLS habilitado em tudo
- Políticas granulares
- Triggers seguros (SECURITY DEFINER)
- Funções com search_path fixo

---

## 🎯 PRÓXIMOS PASSOS

Após aplicar o script:

1. ✅ Teste criar conta nova
2. ✅ Teste fazer login
3. ✅ Teste jogar um jogo
4. ✅ Verifique se stats são atualizadas
5. ✅ Teste criar sala multiplayer

Se tudo funcionar: **🎉 BANCO LIMPO E FUNCIONANDO!**

---

## 📝 NOTAS TÉCNICAS

**Triggers Automáticos:**
- `on_auth_user_created` - Cria perfil + stats quando usuário se registra
- `update_updated_at` - Atualiza timestamps automaticamente
- `update_user_stats_on_play` - Atualiza stats quando termina jogatina

**Funções Auxiliares:**
- `handle_new_user()` - Cria perfil e stats
- `cleanup_old_sessions()` - Limpa sessões antigas (24h)
- `get_user_rank(uuid)` - Retorna ranking do usuário
- `get_leaderboard(limit)` - Retorna top players

**Índices para Performance:**
- Username, email, online status
- Game platform e genre
- Session status
- XP para leaderboard

---

**Criado em:** October 9, 2025  
**Versão:** 1.0.0  
**Testado:** ✅ Sim, funcionando 100%
