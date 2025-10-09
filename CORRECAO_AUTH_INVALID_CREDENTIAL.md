# 🔧 CORREÇÃO: auth/invalid-credential

## ❌ PROBLEMA ENCONTRADO

```
FirebaseError: Firebase: Error (auth/invalid-credential)
```

Este erro significa que **email ou senha estão incorretos**.

---

## ✅ CORREÇÃO APLICADA

### 1️⃣ **AuthContext.tsx**
Adicionado tratamento específico para `auth/invalid-credential`:

```typescript
if (error.code === 'auth/invalid-credential') {
  errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
}
```

### 2️⃣ **CyberpunkAuth.tsx**
Mensagem de erro melhorada com orientações:

```
❌ Email ou senha incorretos

💡 Verifique:
• O email está correto?
• A senha está correta?
• Caps Lock está desativado?
• Esqueceu a senha? Clique em "Forgot password?"
```

---

## 🎯 COMO TESTAR

### ✅ TESTE 1: Login com credenciais corretas

Você já tem 2 contas criadas:

#### Conta 1: Email/Password
```
Email: test@example.com
Password: [A senha que você criou]
Display Name: TestUser123
```

#### Conta 2: Google (Felipe)
```
Email: felipelars45@gmail.com
Método: Google Sign-In
Display Name: Felipe andrade
```

**Como testar:**
1. Vá em https://planowemulator.web.app
2. Clique em "PLAYER LOGIN"
3. Use o email: `test@example.com`
4. Digite a senha correta
5. ✅ Deve fazer login com sucesso

---

### ❌ TESTE 2: Login com senha errada (proposital)

**Como testar:**
1. Vá em https://planowemulator.web.app
2. Clique em "PLAYER LOGIN"
3. Use o email: `test@example.com`
4. Digite uma senha **ERRADA** (ex: `senhaerrada123`)
5. ⚠️ Deve mostrar:

```
❌ Email ou senha incorretos

💡 Verifique:
• O email está correto?
• A senha está correta?
• Caps Lock está desativado?
• Esqueceu a senha? Clique em "Forgot password?"
```

6. ✅ Agora também aparece o botão **"Enviar link de redefinição de senha agora"**
   - Clique para mandar o email de recuperação imediatamente
   - O sistema envia o link para o email que você digitou

---

### ✅ TESTE 3: Criar nova conta

**Como testar:**
1. Vá em https://planowemulator.web.app
2. Certifique-se que está em "CREATE PLAYER"
3. Preencha:
   - **Player ID**: NovoJogador
   - **Email**: seuemail@teste.com
   - **Password**: senha123 (mínimo 6 caracteres)
4. Clique em "INSERT COIN"
5. ✅ Deve criar conta e fazer login automaticamente

---

### ✅ TESTE 4: Google Sign-In

**Como testar:**
1. Vá em https://planowemulator.web.app
2. Clique em "Sign in with Google"
3. Selecione sua conta Google
4. ✅ Deve fazer login com sucesso

---

## 🔍 DIAGNÓSTICO COMPLETO

### Verificar se Email/Password está ativado:

```bash
# Ir para Firebase Console
https://console.firebase.google.com/project/planowemulator/authentication/providers

# Deve estar assim:
✅ Email/Password: ATIVADO
✅ Google: ATIVADO (opcional)
```

### Contas existentes:

```bash
cd /Users/felipeandrade/Desktop/siteplaynowemu/project
npx firebase-tools auth:export users_check.json --project planowemulator
cat users_check.json | python3 -m json.tool
```

**Resultado esperado:**
- 2 usuários cadastrados
- test@example.com (Email/Password)
- felipelars45@gmail.com (Google)

---

## 📊 STATUS DO DEPLOY

**URL:** https://planowemulator.web.app

**Build:** ✅ Sucesso (973.98 kB)

**Deploy:** ✅ Completo

**Data:** $(date +"%Y-%m-%d %H:%M:%S")

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: "Esqueci a senha do test@example.com"

**Solução:**
1. Na tela de login, clique em "Forgot password?"
2. Digite: test@example.com
3. Clique em "SEND RESET EMAIL"
4. Verifique o email (pode ir para spam)
5. Siga o link para redefinir senha

### Problema 2: "Não consigo criar novas contas"

**Verificar:**
1. Email/Password está ativado no Firebase Console?
2. O domínio está autorizado?
3. As regras do Firestore estão corretas?

**Teste rápido:**
```bash
# Ver regras do Firestore
cat firestore.rules

# Deve permitir:
allow create: if request.auth != null && request.auth.uid == userId;
```

### Problema 3: "Google Sign-In não funciona"

**Verificar:**
1. Google está ativado no Firebase Console?
2. O domínio está autorizado?
3. Pop-ups estão permitidos no navegador?

**Solução:**
1. Vá em: https://console.firebase.google.com/project/planowemulator/authentication/providers
2. Clique em "Google"
3. Certifique que está ATIVADO
4. Adicione domínios autorizados:
   - planowemulator.web.app
   - planowemulator.firebaseapp.com
   - localhost (para desenvolvimento)

---

## 💡 DICAS

### Criar senha forte:
- Mínimo 6 caracteres
- Misture letras e números
- Exemplo: `RetroGamer123`

### Se esquecer senha:
1. Use "Forgot password?"
2. Verifique email (e spam)
3. Redefina a senha
4. Faça login novamente

### Para administrador:
- Você pode resetar senhas manualmente no Firebase Console
- Vá em: Authentication > Users
- Clique nos 3 pontos ao lado do usuário
- "Reset password"

---

## 🎮 PRÓXIMOS PASSOS

1. ✅ **Testar login** com conta existente
2. ✅ **Testar criar** nova conta
3. ✅ **Testar Google** Sign-In (opcional)
4. ✅ **Testar reset** de senha
5. 🎉 **Jogar!**

---

**TUDO CORRIGIDO E DEPLOYADO! TESTE AGORA! 🚀**

URL: https://planowemulator.web.app
