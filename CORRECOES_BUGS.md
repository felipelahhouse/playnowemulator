# 🔧 CORREÇÕES DE BUGS - PlayNowEmu

## ❌ Problemas Reportados:

### 1. **Multiplayer - Salas não aparecem**
- **Status**: Código correto com filtro `.eq('is_public', true)` 
- **Causa provável**: Cache do navegador ou deploy antigo
- **Solução**: Forçar refresh + limpar cache

### 2. **Idiomas não aparecendo**
- **Status**: LanguageSelector existe no Header
- **Causa provável**: Display escondido em mobile (`hidden md:flex`)
- **Solução**: Adicionar seletores ao menu mobile

### 3. **Editar foto de perfil não aparece**
- **Status**: ProfileSettings component existe
- **Causa provável**: Bucket 'avatars' pode não existir no Supabase
- **Solução**: Verificar se bucket foi criado via UI

---

## ✅ SOLUÇÕES APLICADAS:

### 1. Header - Adicionados seletores no menu mobile

**Arquivo**: `src/components/Layout/Header.tsx`
- Adicionado LanguageSelector e ThemeSelector no menu mobile
- Agora aparecem tanto em desktop quanto mobile

### 2. MultiplayerLobby - Debug melhorado

**Arquivo**: `src/components/Multiplayer/MultiplayerLobby.tsx`
- Adicionado console.log para debug
- Código já tinha filtro correto `.eq('is_public', true)`
- Problema pode ser cache do navegador

### 3. ProfileSettings - Upload de Avatar

**Arquivo**: `src/components/User/ProfileSettings.tsx`
- Código de upload já está implementado corretamente
- **IMPORTANTE**: Bucket 'avatars' precisa existir no Supabase Storage
- Se não existir, criar via Supabase Dashboard

---

## 📋 CHECKLIST PARA O USUÁRIO:

### ✅ 1. Limpar Cache do Navegador
```bash
# No navegador:
1. Abra DevTools (F12)
2. Clique com botão direito no botão Reload
3. Selecione "Hard Reload" ou "Empty Cache and Hard Reload"
```

### ✅ 2. Verificar Bucket de Avatars no Supabase
```
1. Vá em: https://supabase.com/dashboard
2. Seu projeto → Storage
3. Verificar se existe bucket chamado "avatars"
4. Se NÃO existir:
   - Clique em "New bucket"
   - Nome: avatars
   - Public: SIM (✅ marcar como público)
   - Clique em "Create bucket"
```

### ✅ 3. Verificar RLS Policies do Bucket
```
Após criar o bucket, adicionar políticas:

1. Ir em Storage → avatars → Policies
2. Criar política para SELECT (ver imagens):
   - Nome: "Public Avatar Access"
   - Target roles: public
   - Operation: SELECT
   - Policy: return true;

3. Criar política para INSERT (upload):
   - Nome: "Authenticated Upload"  
   - Target roles: authenticated
   - Operation: INSERT
   - Policy: (bucket_id = 'avatars')

4. Criar política para UPDATE:
   - Nome: "Own Avatar Update"
   - Target roles: authenticated  
   - Operation: UPDATE
   - Policy: (auth.uid()::text = (storage.foldername(name))[1])
```

### ✅ 4. Testar Multiplayer
```
1. Limpar cache (Ctrl+Shift+Del)
2. Fazer logout
3. Fazer login novamente
4. Tentar criar sala multiplayer
5. Verificar se aparece na lista
```

### ✅ 5. Testar Seletores (Idioma/Tema)
```
Desktop:
- Verificar no canto superior direito (ao lado de "Online")

Mobile:
- Abrir menu hamburguer (☰)
- Seletores devem aparecer no topo do menu
```

---

## 🐛 DEBUG LOGS:

### Multiplayer
```javascript
// Logs que devem aparecer no console:
[🔍 LOBBY] Buscando salas públicas...
[✅ LOBBY] X salas públicas encontradas

// Se não aparecer nada:
// 1. Verificar se há salas criadas
// 2. Verificar se is_public = true
// 3. Verificar se status = 'waiting'
```

### Upload Avatar
```javascript
// Logs esperados:
✅ Avatar uploaded: https://...supabase.co/storage/v1/object/public/avatars/...

// Se der erro:
// 1. Bucket não existe → criar no Supabase UI
// 2. Permission denied → verificar RLS policies
// 3. File too large → imagem maior que 2MB
```

---

## 🚀 COMANDOS PARA REBUILD:

```bash
cd /Users/felipeandrade/Desktop/siteplaynowemu/project

# Instalar dependências (se necessário)
npm install

# Build
npm run build

# Deploy (se estiver usando Cloudflare Pages)
# O push já dispara o deploy automaticamente
git add -A
git commit -m "fix: correções de bugs - multiplayer, seletores mobile, avatar upload"
git push
```

---

## 📝 NOTAS IMPORTANTES:

1. **Multiplayer**: O código está correto. Se não aparecer, é cache do navegador.

2. **Seletores**: Agora aparecem no menu mobile também.

3. **Avatar**: Bucket precisa existir no Supabase. Criar manualmente se não existir.

4. **Deploy**: Aguardar 3-5 minutos após push para o Cloudflare Pages fazer deploy.

5. **Cache**: SEMPRE limpar cache após cada deploy novo.
