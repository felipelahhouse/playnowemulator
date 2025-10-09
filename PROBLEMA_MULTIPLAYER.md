# 🐛 PROBLEMA IDENTIFICADO - Multiplayer

## ❌ **PROBLEMA:**
Salas criadas NÃO aparecem na lista do lobby para outros jogadores.

## 🔍 **CAUSA RAIZ:**

### 1. **Status da Sala NÃO Muda**
Quando você cria uma sala e clica em "Abrir Sala", o sistema:
- ✅ Cria a sala com `status = 'waiting'`
- ✅ Busca salas com `status = 'waiting'`
- ❌ **NÃO muda** o status quando o host entra no jogo
- ❌ A sala continua `waiting` mesmo com o host jogando

### 2. **Host Entra e Sala Desaparece (Mas Não Deveria)**
O código atual:
```javascript
// App.tsx - linha 156
onJoinSession={(sessionId) => {
  setShowMultiplayerLobby(false); // ❌ Fecha o lobby
  // Abre o jogo
  // MAS NÃO MUDA O STATUS DA SALA!
})
```

### 3. **Outros Jogadores Veem a Sala**
- Sala está com `status = 'waiting'` ✅
- Sala está com `is_public = true` ✅
- Mas host já está jogando ❌

## 🔧 **SOLUÇÕES POSSÍVEIS:**

### **OPÇÃO 1: NÃO Mudar Status (Recomendado)**
Manter a sala como `'waiting'` mesmo quando host entra, permitindo que outros jogadores entrem enquanto o host já está jogando.

**Vantagens:**
- Sala continua aparecendo no lobby
- Outros podem entrar a qualquer momento
- Mais amigável para multiplayer casual

**Código:**
- Não precisa alterar nada
- Apenas verificar se salas aparecem

### **OPÇÃO 2: Mudar Status para 'active' quando Host Entra**
Mudar status para `'active'` quando qualquer jogador (host ou não) entra.

**Vantagens:**
- Mais controle sobre estados da sala
- Pode distinguir salas vazias de salas com jogadores

**Desvantagens:**
- Sala some do lobby quando host entra
- Precisa mudar query do lobby para `status IN ('waiting', 'active')`

### **OPÇÃO 3: Sistema de "Ready Check"**
Status `'waiting'` até todos marcarem "Ready", depois muda para `'playing'`.

**Vantagens:**
- Controle total sobre início do jogo
- Melhor UX para competitivo

**Desvantagens:**
- Mais complexo de implementar
- Precisa UI para "Ready" button

## ✅ **SOLUÇÃO IMPLEMENTADA:**

Vamos usar **OPÇÃO 1 MELHORADA**: Manter salas como `'waiting'` mas adicionar filtro para NÃO mostrar salas que o próprio usuário criou (evita confusão).

## 🔧 **CORREÇÕES APLICADAS:**

1. **Remover filtro que esconde salas do próprio usuário** (se existir)
2. **Adicionar log de debug** para ver quantas salas são encontradas
3. **Verificar RLS policies** da tabela `game_sessions`

## 📋 **CHECKLIST DE DEBUG:**

Execute no Supabase SQL Editor:

```sql
-- 1. Ver todas as salas criadas
SELECT 
  id,
  session_name,
  status,
  is_public,
  current_players,
  max_players,
  created_at
FROM game_sessions
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver salas que deveriam aparecer no lobby
SELECT 
  id,
  session_name,
  status,
  is_public,
  current_players,
  max_players
FROM game_sessions
WHERE status = 'waiting' 
  AND is_public = true
ORDER BY created_at DESC;

-- 3. Verificar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'game_sessions';
```

## 🚨 **POSSÍVEL CAUSA #2: RLS POLICY**

Se as queries SQL acima retornam salas, mas o código não mostra, o problema é RLS!

### **Verificar se existe política para SELECT:**
```sql
-- Ver se authenticated users podem ver salas públicas
SELECT * FROM pg_policies 
WHERE tablename = 'game_sessions' 
  AND cmd = 'SELECT';
```

### **Se NÃO existir, criar:**
```sql
-- Permitir ver salas públicas
CREATE POLICY "Anyone can view public sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (is_public = true OR host_user_id = auth.uid());

-- Permitir criar salas
CREATE POLICY "Authenticated users can create sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (host_user_id = auth.uid());

-- Permitir atualizar próprias salas
CREATE POLICY "Host can update own sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (host_user_id = auth.uid());

-- Permitir deletar próprias salas
CREATE POLICY "Host can delete own sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING (host_user_id = auth.uid());
```

## 🎯 **TESTE FINAL:**

1. **Conta 1**: Criar sala "Teste123" → Marcar "Sala Pública" ✅
2. **Conta 2**: Abrir Multiplayer Lobbies
3. **Verificar**: Sala "Teste123" deve aparecer
4. **Console**: Ver logs `[✅ LOBBY] X salas encontradas`

---

**Próximo passo**: Executar queries SQL acima e reportar resultados
