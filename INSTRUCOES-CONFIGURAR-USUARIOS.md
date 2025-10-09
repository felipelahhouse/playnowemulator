# 🔐 CORRIGIR PROBLEMA DE CRIAÇÃO DE CONTAS

## ❌ Problema Encontrado

Suas contas de amigos não estavam aparecendo no Supabase porque:
- O sistema estava salvando usuários **APENAS no localStorage** (navegador)
- Nada era salvo no banco de dados Supabase
- Se limpar cache, perde tudo
- Usuários não aparecem como online para outros

## ✅ Solução Implementada

Agora o sistema:
1. ✅ Cria contas no **Supabase Auth** (sistema de autenticação oficial)
2. ✅ Salva perfis na **tabela `users`** do banco de dados
3. ✅ Funciona com múltiplos usuários
4. ✅ Sincroniza status online em tempo real
5. ✅ Persiste dados mesmo após limpar cache

---

## 📋 PASSO A PASSO PARA CONFIGURAR

### 1️⃣ Criar Tabela de Usuários no Supabase

1. Acesse: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig
2. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
3. Clique em **+ New query**
4. Copie TUDO do arquivo `CRIAR-TABELA-USERS.sql`
5. Cole no editor SQL
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Deve aparecer "Success. No rows returned" ✅

### 2️⃣ Habilitar Email no Supabase Auth

1. No dashboard do Supabase, vá em **Authentication** → **Providers**
2. Procure por **Email** na lista
3. Certifique-se que está **ENABLED** (habilitado)
4. Configure as opções:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email**: DESABILITE (para teste rápido)
   - ✅ **Secure email change**: DESABILITE (para teste rápido)
   
   > ⚠️ **IMPORTANTE**: Para produção, habilite confirmação de email depois!

5. Clique em **Save**

### 3️⃣ Configurar URLs de Redirect

1. Ainda em **Authentication**, vá em **URL Configuration**
2. Adicione em **Site URL**:
   ```
   https://playnowemulator.pages.dev
   ```

3. Adicione em **Redirect URLs**:
   ```
   http://localhost:5173/**
   https://playnowemulator.pages.dev/**
   ```

4. Clique em **Save**

### 4️⃣ Testar no Site

Agora seus amigos podem:

1. Acessar https://playnowemulator.pages.dev
2. Clicar em **Criar Conta**
3. Preencher:
   - **Email**: qualquer email (exemplo@teste.com)
   - **Senha**: mínimo 6 caracteres
   - **Nome de usuário**: nome único
4. Clicar em **Criar Conta**

✅ A conta será criada **INSTANTANEAMENTE** e aparecerá:
- No **Supabase** → **Authentication** → **Users** (lista de emails)
- No **Supabase** → **Table Editor** → **users** (perfis completos)
- Online para outros jogadores em tempo real!

---

## 🔍 VERIFICAR SE FUNCIONOU

### Verificar no Supabase:

1. **Authentication** → **Users**:
   - Deve aparecer os emails cadastrados
   - Status: "Confirmed" (verde)

2. **Table Editor** → **users**:
   - Deve aparecer os perfis com:
     - `id` (UUID)
     - `email`
     - `username`
     - `is_online` (true/false)
     - `last_seen` (data/hora)

### Verificar Online Counter:

- No site, o contador de players online deve mostrar número correto
- Quando usuário faz login → contador aumenta
- Quando faz logout → contador diminui

---

## 🆘 TROUBLESHOOTING

### Erro: "User already registered"
**Causa**: Email já foi usado  
**Solução**: Use outro email ou delete o usuário antigo no Supabase

### Erro: "Invalid login credentials"
**Causa**: Email ou senha incorretos  
**Solução**: Verifique os dados ou crie nova conta

### Usuários não aparecem no banco
**Causa**: Tabela `users` não foi criada  
**Solução**: Execute o SQL do arquivo `CRIAR-TABELA-USERS.sql`

### Erro: "new row violates row-level security"
**Causa**: Políticas RLS muito restritivas  
**Solução**: Verifique se executou TODO o SQL (incluindo as POLICIES)

### Contador online sempre em 0
**Causa**: Realtime não habilitado na tabela  
**Solução**: 
1. Vá em **Database** → **Replication**
2. Procure a tabela **users**
3. Habilite **Realtime**

---

## 📊 ESTRUTURA DA TABELA USERS

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,              -- ID do Supabase Auth
    email TEXT NOT NULL UNIQUE,        -- Email do usuário
    username TEXT NOT NULL UNIQUE,     -- Nome único do jogador
    avatar_url TEXT,                   -- URL do avatar (opcional)
    is_online BOOLEAN DEFAULT false,   -- Status online
    last_seen TIMESTAMPTZ,             -- Última vez visto
    created_at TIMESTAMPTZ             -- Data de criação
);
```

---

## ✅ CHECKLIST FINAL

- [ ] Executei o SQL `CRIAR-TABELA-USERS.sql` no Supabase
- [ ] Habilitei Email provider em Authentication
- [ ] Desabilitei "Confirm email" (para teste)
- [ ] Configurei URLs de redirect
- [ ] Habilitei Realtime na tabela `users`
- [ ] Testei criar uma conta nova
- [ ] Verifico que usuário aparece em Authentication → Users
- [ ] Verifico que perfil aparece em Table Editor → users
- [ ] Contador online está funcionando
- [ ] Deploy no Cloudflare Pages está completo

---

## 🎮 PRÓXIMOS PASSOS

Depois que tudo estiver funcionando:

1. **Habilitar confirmação de email** (segurança)
2. **Configurar templates de email** (emails bonitos)
3. **Adicionar recuperação de senha**
4. **Adicionar upload de avatar**
5. **Adicionar perfil de usuário com estatísticas**

---

**Qualquer dúvida, me chame! 🚀**
