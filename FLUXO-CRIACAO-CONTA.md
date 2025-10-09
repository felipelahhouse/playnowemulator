# 🔄 FLUXO COMPLETO DE CRIAÇÃO DE CONTA

## 📍 QUANDO VOCÊ CLICA EM "CRIAR CONTA"

### 1️⃣ **INTERFACE (CyberpunkAuth.tsx)**

**Arquivo**: `src/components/Auth/CyberpunkAuth.tsx`

```
Usuário preenche formulário:
├─ Email: teste@exemplo.com
├─ Password: senha123
└─ Username: jogador1

Clica em "Criar Conta"
    ↓
handleSubmit() é chamado (linha 31)
    ↓
Valida se username não está vazio
    ↓
Chama: await signUp(email, password, username)
```

---

### 2️⃣ **AUTENTICAÇÃO (AuthContext.tsx)**

**Arquivo**: `src/contexts/AuthContext.tsx`

#### **Função signUp()** (linha 147):

```javascript
const signUp = async (email, password, username) => {
  
  // PASSO 1: Verificar se username já existe
  const { data: existingUsername } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .maybeSingle();
  
  if (existingUsername) {
    throw new Error('Este nome de usuário já está em uso');
  }

  // PASSO 2: Criar conta no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { username: username }
    }
  });

  // PASSO 3: Criar perfil na tabela users
  await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: email,
      username: username,
      is_online: true,
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

  // PASSO 4: Fazer login automático
  setUser({
    id: data.user.id,
    email: email,
    username: username,
    is_online: true
  });
}
```

---

### 3️⃣ **CHAMADAS AO SUPABASE**

#### **Chamada 1: Verificar username**
```
URL: https://ffmyoutiutemmrmvxzig.supabase.co/rest/v1/users
Método: GET
Query: ?username=eq.jogador1&select=username
Header: apikey: [sua-chave-anon]
```

**Resposta esperada:**
- Se username existe: retorna `{ username: "jogador1" }`
- Se não existe: retorna `null` ou `[]`

---

#### **Chamada 2: Criar usuário no Auth**
```
URL: https://ffmyoutiutemmrmvxzig.supabase.co/auth/v1/signup
Método: POST
Body: {
  "email": "teste@exemplo.com",
  "password": "senha123",
  "data": {
    "username": "jogador1"
  }
}
Header: apikey: [sua-chave-anon]
```

**Resposta esperada:**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "teste@exemplo.com",
    "user_metadata": {
      "username": "jogador1"
    },
    "created_at": "2025-10-08T..."
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "..."
  }
}
```

---

#### **Chamada 3: Criar perfil na tabela users**
```
URL: https://ffmyoutiutemmrmvxzig.supabase.co/rest/v1/users
Método: POST
Body: {
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "teste@exemplo.com",
  "username": "jogador1",
  "is_online": true,
  "last_seen": "2025-10-08T...",
  "created_at": "2025-10-08T..."
}
Header: apikey: [sua-chave-anon]
```

**Resposta esperada:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "teste@exemplo.com",
  "username": "jogador1",
  "is_online": true
}
```

---

#### **Chamada 4: Trigger automático (se configurado)**

O trigger `handle_new_user()` pode ser executado automaticamente:

```sql
-- Trigger no Supabase
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();
```

**O que faz:**
- Detecta quando um usuário é criado em `auth.users`
- Cria automaticamente um registro em `public.users`
- Evita duplicação (usa `ON CONFLICT DO NOTHING`)

---

## 🌐 ENDPOINTS COMPLETOS

### **Supabase REST API:**
```
Base URL: https://ffmyoutiutemmrmvxzig.supabase.co
```

| Operação | Endpoint | Método |
|----------|----------|--------|
| Verificar username | `/rest/v1/users?username=eq.X` | GET |
| Criar usuário | `/auth/v1/signup` | POST |
| Criar perfil | `/rest/v1/users` | POST |
| Login | `/auth/v1/token?grant_type=password` | POST |
| Logout | `/auth/v1/logout` | POST |

---

## 🔍 COMO VER AS CHAMADAS NO NAVEGADOR

### **Opção 1: Chrome DevTools**

1. Pressione **F12** (ou Cmd+Option+I no Mac)
2. Vá na aba **Network** (Rede)
3. Deixe aberta
4. Tente criar conta
5. Você verá todas as chamadas:

```
Name                         Status   Type      Size
─────────────────────────────────────────────────────
users?username=eq.jogador1   200      xhr       85 B
signup                       200      xhr       2.1 KB
users                        201      xhr       156 B
```

6. Clique em cada uma para ver:
   - **Headers**: Headers enviados
   - **Payload**: Dados enviados
   - **Response**: Resposta do servidor
   - **Preview**: JSON formatado

---

### **Opção 2: Ver no Console**

Adicione isto no seu código para debug:

```javascript
// Em AuthContext.tsx, adicione console.logs:

const signUp = async (email, password, username) => {
  console.log('🔵 INÍCIO - Criando conta');
  console.log('📧 Email:', email);
  console.log('👤 Username:', username);
  
  // Verificar username
  console.log('🔍 Verificando se username existe...');
  const { data: existingUsername } = await supabase...
  console.log('✅ Username disponível:', !existingUsername);
  
  // Criar no Auth
  console.log('🔐 Criando usuário no Supabase Auth...');
  const { data, error } = await supabase.auth.signUp({...});
  console.log('✅ Usuário criado:', data);
  
  // Criar perfil
  console.log('📝 Criando perfil na tabela users...');
  await supabase.from('users').insert({...});
  console.log('✅ Perfil criado!');
  
  console.log('🎉 SUCESSO - Conta criada completamente');
}
```

---

## 📊 ORDEM DAS CHAMADAS (Timeline)

```
T+0ms   │ Usuário clica "Criar Conta"
        │
T+10ms  │ handleSubmit() validação
        │
T+20ms  │ signUp() chamado
        │
T+30ms  │ ┌─────────────────────────────────┐
        │ │ GET /rest/v1/users             │
        │ │ ?username=eq.jogador1          │
        │ └─────────────────────────────────┘
        │
T+150ms │ ✅ Username disponível
        │
T+160ms │ ┌─────────────────────────────────┐
        │ │ POST /auth/v1/signup           │
        │ │ { email, password, username }   │
        │ └─────────────────────────────────┘
        │
T+800ms │ ✅ Usuário criado no Auth
        │ 🔔 TRIGGER automático executado
        │
T+810ms │ ┌─────────────────────────────────┐
        │ │ POST /rest/v1/users            │
        │ │ { id, email, username, ... }    │
        │ └─────────────────────────────────┘
        │
T+950ms │ ✅ Perfil criado
        │
T+960ms │ setUser() - Login automático
        │
T+970ms │ 🎉 SUCESSO - Redirecionado para o site
```

---

## 🗄️ O QUE É SALVO NO SUPABASE

### **Tabela `auth.users`** (gerenciada pelo Supabase)
```sql
id                  UUID
email               TEXT
encrypted_password  TEXT (hash bcrypt)
email_confirmed_at  TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP
user_metadata       JSONB { "username": "jogador1" }
```

### **Tabela `public.users`** (sua tabela customizada)
```sql
id                  UUID (FK para auth.users)
email               TEXT
username            TEXT (UNIQUE)
avatar_url          TEXT
is_online           BOOLEAN
last_seen           TIMESTAMP
created_at          TIMESTAMP
```

---

## 🔐 VARIÁVEIS DE AMBIENTE USADAS

```env
VITE_SUPABASE_URL=https://ffmyoutiutemmrmvxzig.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Onde estão:**
- **Local**: `.env` (não commitado)
- **Cloudflare**: Settings → Environment variables

---

## 🧪 TESTAR MANUALMENTE AS CHAMADAS

### Com cURL:

```bash
# 1. Criar conta
curl -X POST 'https://ffmyoutiutemmrmvxzig.supabase.co/auth/v1/signup' \
  -H "apikey: SUA_CHAVE_ANON" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "data": {
      "username": "jogador1"
    }
  }'

# 2. Verificar na tabela users
curl 'https://ffmyoutiutemmrmvxzig.supabase.co/rest/v1/users?email=eq.teste@exemplo.com' \
  -H "apikey: SUA_CHAVE_ANON"
```

---

## 📌 RESUMO

**Quando você cria uma conta:**

1. **Frontend** (CyberpunkAuth) → chama `signUp()`
2. **AuthContext** → faz 3 chamadas:
   - ✅ Verifica username
   - ✅ Cria no Auth (Supabase)
   - ✅ Cria perfil (tabela users)
3. **Supabase** → retorna dados do usuário
4. **Frontend** → faz login automático e mostra o site

**Todas as chamadas vão para:**
`https://ffmyoutiutemmrmvxzig.supabase.co`

---

Quer ver alguma parte específica em mais detalhes? 🔍
