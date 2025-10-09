# 🔥 ATIVAR EMAIL/PASSWORD - PASSO A PASSO

## ⚠️ VOCÊ PRECISA FAZER ISSO AGORA!

O código está perfeito, mas o **Email/Password não está ativado** no Firebase Console.

---

## 📋 SIGA EXATAMENTE ESTES PASSOS:

### 1️⃣ Abra este link:
```
https://console.firebase.google.com/project/planowemulator/authentication/providers
```

### 2️⃣ O que você vai ver:
- Uma lista de "Sign-in providers"
- Email/Password (provavelmente está **DESATIVADO**)
- Google (provavelmente está **DESATIVADO**)

### 3️⃣ Ativar Email/Password:
1. **Clique** em "Email/Password" na lista
2. Você verá um **toggle** (botão deslizante)
3. **ATIVE** o toggle (deve ficar azul)
4. Clique em **"Save"** (Salvar)

### 4️⃣ Ativar Google (OPCIONAL):
1. **Clique** em "Google" na lista
2. **ATIVE** o toggle
3. Preencha:
   - **Project public-facing name:** PlayNowEmu
   - **Project support email:** seu-email@gmail.com
4. Clique em **"Save"**

---

## 🌐 ADICIONAR DOMÍNIOS AUTORIZADOS

### 1️⃣ Ainda no Firebase Console, clique na aba:
```
Settings (Configurações)
```

### 2️⃣ Role até "Authorized domains"

### 3️⃣ Clique em "Add domain" e adicione:
```
planowemulator.web.app
localhost
```

---

## 🧪 TESTAR AGORA

### Opção 1: Arquivo de teste
```bash
open test-firebase-auth.html
```

Ou abra manualmente: `test-firebase-auth.html` no navegador

### Opção 2: Site em produção
```
https://planowemulator.web.app
```

1. Clique em **"CREATE PLAYER"**
2. Preencha:
   - Player ID: TestUser
   - Email: test@example.com
   - Password: teste123
3. Clique em **"INSERT COIN"**

### Opção 3: Abrir console do navegador
1. Pressione **F12**
2. Vá para aba **Console**
3. Tente criar conta
4. Veja os logs detalhados

---

## ✅ SE FUNCIONAR, VOCÊ VERÁ:

No console do navegador (F12):
```
🔵 Iniciando cadastro... {email: "...", username: "..."}
✅ Conta criada no Firebase Auth: abc123...
✅ Profile atualizado com username
🔵 Criando perfil no Firestore... {...}
✅ Perfil criado no Firestore com sucesso!
✅ Cadastro completo! Usuário logado.
```

---

## ❌ SE DER ERRO:

### Erro: "auth/operation-not-allowed"
**Causa:** Email/Password não está ativado
**Solução:** Volte ao passo 1 e ative Email/Password

### Erro: "permission-denied"
**Causa:** Regras do Firestore muito restritivas
**Solução:** Execute `npx firebase-tools deploy --only firestore:rules`

### Erro: "auth/unauthorized-domain"
**Causa:** Domínio não autorizado
**Solução:** Adicione o domínio na lista (passo "Adicionar Domínios")

---

## 🎯 RESUMO - CHECKLIST

Marque conforme faz:

- [ ] Abri o Firebase Console
- [ ] Fui em Authentication > Sign-in method
- [ ] Ativei **Email/Password**
- [ ] Salvei
- [ ] (Opcional) Ativei **Google**
- [ ] Fui em Settings
- [ ] Adicionei **planowemulator.web.app** nos domínios autorizados
- [ ] Adicionei **localhost** nos domínios autorizados
- [ ] Testei criar conta no site
- [ ] FUNCIONOU! 🎉

---

## 🔗 LINKS RÁPIDOS

**Firebase Authentication:**
https://console.firebase.google.com/project/planowemulator/authentication

**Providers:**
https://console.firebase.google.com/project/planowemulator/authentication/providers

**Settings:**
https://console.firebase.google.com/project/planowemulator/authentication/settings

**Site:**
https://planowemulator.web.app

---

## 💡 DICA

Depois de ativar, aguarde **10 segundos** e tente criar a conta novamente.

O Firebase demora um pouco para propagar as configurações.

---

**FAÇA ISSO AGORA E ME DIGA SE FUNCIONOU! 🚀**
