# 🚨 INSTRUÇÕES URGENTES - RESOLVER BUGS

## ⚡ O QUE FOI FEITO AGORA:

### ✅ 1. Seletores de Idioma e Tema - **CORRIGIDO**
- **Problema**: Não apareciam no celular
- **Solução**: Adicionados ao menu mobile (hamburguer ☰)
- **Como testar**: 
  - Mobile: Abrir menu → Seletores aparecem no topo
  - Desktop: Continuam no canto superior direito

### ✅ 2. Debug Multiplayer - **MELHORADO**
- **Problema**: Salas não aparecem
- **Código**: Já estava correto com filtro `.eq('is_public', true)`
- **Debug adicionado**: Logs detalhados no console
- **Como debugar**: 
  ```
  1. Abrir DevTools (F12)
  2. Ir em Console
  3. Criar uma sala
  4. Ver logs:
     [🔍 LOBBY] Buscando salas públicas...
     [✅ LOBBY] X salas encontradas
  ```

### ⚠️ 3. Upload de Avatar - **PRECISA AÇÃO MANUAL**
- **Problema**: Pode não funcionar se bucket não existir
- **Código**: Já está implementado corretamente
- **AÇÃO NECESSÁRIA**: Criar bucket no Supabase (veja abaixo)

---

## 🔧 AÇÕES QUE VOCÊ PRECISA FAZER:

### 1️⃣ **CRIAR BUCKET DE AVATARS NO SUPABASE** (OBRIGATÓRIO)

```
📍 Acesse: https://supabase.com/dashboard

1. Selecione seu projeto
2. Menu lateral → Storage
3. Clique em "New bucket"
4. Preencher:
   ┌─────────────────────────────┐
   │ Name: avatars               │
   │ Public: ✅ SIM (marcar!)    │
   │ File size limit: 2MB        │
   └─────────────────────────────┘
5. Clique em "Create bucket"

6. Após criar, clique no bucket "avatars"
7. Vá em "Policies" → "New Policy"
8. Criar 3 políticas:

   🟢 Política 1 - VER AVATARS (público):
   ┌──────────────────────────────────────┐
   │ Policy name: Public Avatar Access    │
   │ Allowed operation: SELECT            │
   │ Target roles: public                 │
   │ USING expression: true               │
   └──────────────────────────────────────┘

   🟡 Política 2 - UPLOAD (autenticado):
   ┌──────────────────────────────────────┐
   │ Policy name: Authenticated Upload    │
   │ Allowed operation: INSERT            │
   │ Target roles: authenticated          │
   │ WITH CHECK: bucket_id = 'avatars'    │
   └──────────────────────────────────────┘

   🔵 Política 3 - ATUALIZAR/DELETAR:
   ┌──────────────────────────────────────┐
   │ Policy name: Own Avatar Manage       │
   │ Allowed operation: UPDATE, DELETE    │
   │ Target roles: authenticated          │
   │ USING: bucket_id = 'avatars'         │
   └──────────────────────────────────────┘
```

### 2️⃣ **EXECUTAR SQL MIGRATION** (Se ainda não fez)

```sql
📍 Acesse: https://supabase.com/dashboard
→ SQL Editor → New Query

Cole o conteúdo do arquivo:
supabase/migrations/20251009110000_add_user_features.sql

Clique em RUN
```

### 3️⃣ **LIMPAR CACHE DO NAVEGADOR** (Sempre que fizer deploy novo)

```
Chrome/Edge:
1. F12 (DevTools)
2. Botão direito no ícone Reload
3. "Empty Cache and Hard Reload"

Firefox:
1. Ctrl + Shift + Del
2. Marcar "Cache"
3. Time range: "Everything"
4. Limpar

Safari:
1. Cmd + Option + E (Empty Caches)
2. Cmd + R (Reload)
```

---

## 🧪 TESTAR CADA FEATURE:

### ✅ Teste 1: Seletores de Idioma/Tema

**Desktop:**
```
1. Olhar canto superior direito
2. Deve ter 2 botões:
   🌐 PT (bandeira do Brasil)
   🎨 Original (emoji gamepad)
3. Clicar em cada um → dropdown aparece
```

**Mobile:**
```
1. Clicar no menu hamburguer (☰) no topo
2. Primeira coisa que aparece: 2 seletores lado a lado
3. Testar ambos
```

### ✅ Teste 2: Multiplayer

```
1. Abrir DevTools (F12) → Console
2. Clicar em "Multiplayer Lobbies"
3. Ver logs:
   [🔍 LOBBY] Buscando salas públicas...
   [✅ LOBBY] X salas encontradas

4. Criar nova sala:
   - Nome: "Sala Teste"
   - Jogo: Qualquer um
   - ✅ Sala Pública (marcar!)
   - Criar

5. Verificar se aparece na lista

6. Em OUTRA ABA/NAVEGADOR:
   - Fazer login com outra conta
   - Ir em Multiplayer
   - A sala deve aparecer
```

**Se NÃO aparecer:**
```
- Ver console.log → quantas salas foram encontradas?
- Verificar no Supabase Dashboard:
  1. Table Editor → game_sessions
  2. Filtrar: is_public = true, status = 'waiting'
  3. Deve aparecer sua sala
```

### ✅ Teste 3: Upload de Avatar

```
1. Clicar no nome de usuário (canto superior direito)
2. "Editar Perfil"
3. Clicar no ícone de câmera
4. Selecionar imagem (JPG/PNG, max 2MB)
5. Aguardar upload
6. Clicar em "Salvar Alterações"
7. Recarregar página → avatar deve aparecer
```

**Se der erro:**
```
- Abrir DevTools → Console
- Ver mensagem de erro
- Mais comum: "Bucket 'avatars' not found"
  → Precisa criar bucket (passo 1️⃣ acima)
```

---

## 📊 STATUS ATUAL:

| Feature | Status | Ação Necessária |
|---------|--------|----------------|
| Seletores Mobile | ✅ Corrigido | Nenhuma - já no deploy |
| Debug Multiplayer | ✅ Melhorado | Limpar cache + testar |
| Upload Avatar | ⚠️ Pendente | **Criar bucket no Supabase** |
| SQL Migration | ⚠️ Pendente | **Executar SQL no editor** |

---

## 🚀 PRÓXIMOS PASSOS:

1. **AGORA** (5 min):
   - Criar bucket "avatars" no Supabase
   - Executar SQL migration (se não fez)
   - Limpar cache do navegador

2. **TESTAR** (10 min):
   - Seletores mobile
   - Multiplayer (criar sala + ver na lista)
   - Upload de avatar

3. **AGUARDAR DEPLOY** (3-5 min):
   - O push já foi feito (commit ecbac31)
   - Cloudflare Pages vai fazer deploy automático
   - Verificar em: https://dashboard.cloudflare.com

4. **REPORTAR**:
   - Quais features funcionaram?
   - Quais ainda têm problema?
   - Copiar e colar logs do console se houver erro

---

## 💡 DICAS:

- **Sempre limpar cache** após cada deploy novo
- **Usar 2 navegadores/abas** para testar multiplayer
- **Verificar console** se algo não funcionar
- **Tamanho de imagem**: Avatar precisa ser < 2MB
- **Formato de imagem**: JPG, PNG ou GIF

---

## 🆘 SE AINDA TIVER PROBLEMA:

1. Copie TODOS os logs do console (F12 → Console)
2. Screenshot da tela de erro (se tiver)
3. Diga qual feature não funciona
4. Confirme se fez os passos 1️⃣ e 2️⃣

---

**Deploy atual**: Commit `ecbac31`  
**Aguardando**: 3-5 minutos para Cloudflare Pages  
**Próximo passo**: Criar bucket + executar SQL + testar
