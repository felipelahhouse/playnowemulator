# 🚀 GUIA RÁPIDO: Aplicar Migration SQL

## ⚠️ PROBLEMA

O dashboard está mostrando este aviso amarelo:
```
⚠️ Sistema de XP e Conquistas Desativado
```

**Motivo**: As tabelas SQL ainda não foram criadas no Supabase.

---

## ✅ SOLUÇÃO EM 5 MINUTOS

### 1️⃣ Abrir Arquivo SQL
No VS Code, abra o arquivo:
```
/supabase/migrations/20251009110000_add_user_features.sql
```

### 2️⃣ Copiar TODO o Conteúdo
- Pressione `Cmd+A` (Mac) ou `Ctrl+A` (Windows) para selecionar tudo
- Pressione `Cmd+C` (Mac) ou `Ctrl+C` (Windows) para copiar

### 3️⃣ Abrir Supabase Dashboard
Clique aqui: https://ffmyoutiutemmrmvxzig.supabase.co

- Faça login se necessário

### 4️⃣ Ir para SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor**
- Ou use o atalho: `Cmd+K` e digite "sql"

### 5️⃣ Criar Nova Query
- Clique no botão **+ New Query** (canto superior direito)
- Cole o conteúdo copiado (Step 2)

### 6️⃣ Executar Migration
- Clique no botão **RUN** (canto inferior direito, botão verde)
- Aguarde mensagem: `Success. No rows returned`

### 7️⃣ Verificar Criação
Execute esta query no SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver estas novas tabelas:
- ✅ achievements
- ✅ friendships  
- ✅ notifications
- ✅ play_history
- ✅ user_achievements
- ✅ user_favorites
- ✅ user_stats

---

## 🎉 PRONTO!

Agora:
1. Recarregue o site (`Cmd+R` ou `Ctrl+R`)
2. Faça logout
3. Faça login novamente
4. Acesse seu dashboard

**Você verá:**
- ✅ Level 1 com 50 XP
- ✅ Conquista "Bem-vindo" desbloqueada
- ✅ Sistema de estatísticas ativo
- ❌ Aviso amarelo sumiu

---

## ❓ Problemas?

### Erro: "relation already exists"
✅ **Normal!** Significa que você já aplicou a migration antes.

### Erro: "permission denied"
❌ Verifique se você está logado como **owner** do projeto Supabase.

### Tabelas não aparecem
1. Recarregue a página do Supabase
2. Verifique se selecionou o schema **public**
3. Execute novamente a query de verificação (Step 7)

### Dashboard ainda mostra aviso
1. Limpe o cache do browser (`Cmd+Shift+R`)
2. Faça logout e login novamente
3. Aguarde 30 segundos para o Supabase processar

---

## 📚 O Que Foi Criado

### Sistema de XP
- Ganhe XP fazendo ações
- Suba de nível automaticamente
- Fórmula: `Level = √(XP/100) + 1`

### 25 Conquistas
Categorias:
- 🎮 Jogos (Explorador, Colecionador, Veterano)
- ⏰ Tempo (Dedicado, Hardcore Gamer, Lenda)
- 👥 Multiplayer (Host, Jogador Social, Mestre)
- 📺 Streaming (Streamer Novato, Regular, Estrela)
- 🤝 Social (Amigos, Popular, Influencer)
- ⭐ Especiais (Coruja Noturna, Halloween, Completista)

### Recursos Adicionais
- 📊 Histórico de jogos
- ⭐ Sistema de favoritos
- 🤝 Base para amizades
- 🔔 Sistema de notificações
- 🔒 Segurança RLS (cada usuário vê só seus dados)

---

## 🔧 Para Desenvolvedores

### Funções SQL Disponíveis

```sql
-- Adicionar XP
SELECT add_user_xp('user_id_aqui', 100);

-- Desbloquear conquista
SELECT unlock_achievement('user_id_aqui', 'first_game');

-- Calcular nível
SELECT calculate_level(500); -- Retorna nível baseado em 500 XP
```

### Triggers Automáticos
- ✅ Novo usuário → cria `user_stats`
- ✅ Novo usuário → desbloqueia "Bem-vindo" + 50 XP
- ✅ Conquista → adiciona XP
- ✅ Subiu de nível → notificação

### Estrutura das Tabelas
Veja detalhes completos em: **ERRO_SQL_SUPABASE.md**

---

**Tempo estimado**: ⏱️ **5 minutos**  
**Dificuldade**: 🟢 **Fácil** (copiar e colar)

---

Feito com 💜 por PlayNowEmu Team
