# 🎮 GUIA DE CONFIGURAÇÃO - PLAYNOWEMU

## 📋 PASSO A PASSO PARA CONFIGURAR AUTENTICAÇÃO

### 1️⃣ CONFIGURAR SUPABASE (RECOMENDADO)

**Vantagens:**
- ✅ Ver todos os usuários cadastrados no dashboard
- ✅ Gerenciar usuários facilmente
- ✅ Dados seguros e persistentes
- ✅ Funciona em qualquer dispositivo

**Execute no SQL Editor do Supabase:**

1. Acesse: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig/sql/new

2. Copie TODO o conteúdo do arquivo: `CONFIGURAR-AUTH-SUPABASE.sql`

3. Cole no SQL Editor e clique em **RUN**

4. Aguarde a mensagem: "Configuração de autenticação concluída!"

---

### 2️⃣ HABILITAR AUTENTICAÇÃO POR EMAIL

1. Vá em: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig/auth/providers

2. Procure por **"Email"**

3. Configure assim:
   - ✅ **Enable Email provider**: ATIVO
   - ❌ **Confirm email**: DESATIVADO (para facilitar testes)
   - ✅ **Secure email change**: ATIVO

4. Clique em **Save**

---

### 3️⃣ ADICIONAR OS JOGOS (OPCIONAL)

1. Acesse: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig/sql/new

2. Copie TODO o conteúdo do arquivo: `CRIAR-TABELAS-E-JOGOS.sql`

3. Cole no SQL Editor e clique em **RUN**

4. Aguarde - 29 jogos serão adicionados!

---

### 4️⃣ CRIAR SUA CONTA

Agora você pode criar contas de 2 formas:

**OPÇÃO A - Direto no site (Recomendado)**
1. Acesse: http://localhost:5173
2. Clique em "Sign Up"
3. Preencha:
   - Email: felipelars20092@gmail.com
   - Username: Felipe
   - Password: Killer77@
4. Clique em "Create Account"
5. Pronto! Você está logado! 🎉

**OPÇÃO B - Manualmente no Supabase**
1. Vá em: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig/auth/users
2. Clique em "Add user" → "Create new user"
3. Preencha:
   - Email: felipelars20092@gmail.com
   - Password: Killer77@
   - Auto Confirm User: ✅ ATIVO
4. Clique em "Create user"

---

## 🔧 SISTEMA HÍBRIDO

O sistema agora funciona de forma híbrida:

1. **Supabase (Prioritário)**
   - Tenta criar/logar no Supabase primeiro
   - Dados salvos no servidor
   - Você vê os usuários no dashboard

2. **Local (Fallback)**
   - Se Supabase falhar, usa sistema local
   - Dados salvos no navegador (localStorage)
   - Funciona offline

---

## 🎮 TESTAR O WEBSITE

Depois de configurar:

1. Acesse: http://localhost:5173
2. Crie sua conta ou faça login
3. Explore:
   - ✅ Game Library - Ver jogos
   - ✅ Live Streams - Transmissões
   - ✅ Multiplayer Lobbies - Salas de jogo
4. Clique em um jogo para jogar!

---

## 📊 VER USUÁRIOS CADASTRADOS

Vá em: https://supabase.com/dashboard/project/ffmyoutiutemmrmvxzig/auth/users

Você verá:
- Lista de todos os usuários
- Emails
- Datas de cadastro
- Status (confirmado ou não)

---

## ❓ PROBLEMAS COMUNS

**Trava no loading:**
- Aguarde 3 segundos (timeout automático)
- Recarregue a página (F5)

**Erro ao criar conta:**
- Verifique se executou o SQL de configuração
- Verifique se habilitou Email provider
- Tente criar conta manualmente no dashboard

**Jogos não aparecem:**
- Execute o arquivo: `CRIAR-TABELAS-E-JOGOS.sql`
- Aguarde alguns segundos
- Recarregue a página

---

## 📁 ARQUIVOS IMPORTANTES

- `CONFIGURAR-AUTH-SUPABASE.sql` - Configuração de autenticação
- `CRIAR-TABELAS-E-JOGOS.sql` - Adicionar 29 jogos
- `.env` - Credenciais do Supabase (já configurado)

---

✨ **PRONTO! Agora você tem um sistema completo de autenticação!** ✨
