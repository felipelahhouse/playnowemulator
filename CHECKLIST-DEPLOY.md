# ✅ CHECKLIST - Deploy no Cloudflare Pages

## 📦 Build Criado: ✅ PRONTO!

A pasta `dist` está em:
```
/Users/felipeandrade/Desktop/siteplaynowemu/project/dist
```

---

## 🚀 MÉTODO RÁPIDO (2 minutos)

### □ Passo 1: Abrir Cloudflare
- [ ] Ir em: https://dash.cloudflare.com/
- [ ] Fazer login

### □ Passo 2: Criar Projeto
- [ ] Menu lateral → **"Workers & Pages"**
- [ ] Clicar **"Create application"**
- [ ] Aba **"Pages"**
- [ ] Clicar **"Upload assets"**

### □ Passo 3: Configurar
- [ ] Clicar **"Create a new project"**
- [ ] **Nome:** `playnowemu`
- [ ] Clicar **"Create project"**

### □ Passo 4: Upload
- [ ] Abrir Finder
- [ ] Navegar até: `/Users/felipeandrade/Desktop/siteplaynowemu/project/`
- [ ] **ARRASTAR** a pasta **`dist`** para o navegador
- [ ] Ou clicar "Select from computer" e escolher pasta `dist`

### □ Passo 5: Deploy
- [ ] Clicar **"Deploy site"**
- [ ] Aguardar 30-60 segundos
- [ ] **PRONTO!** 🎉

---

## 🌐 Seu site estará em:

```
https://playnowemu.pages.dev
```

---

## 📝 IMPORTANTE:

### ⚠️ Fazer Upload da Pasta DIST Completa
Não envie arquivos soltos, envie a **pasta `dist` inteira**!

### ⚠️ Atualizar Variáveis de Ambiente (Depois)
Se o site não conectar ao Supabase:

1. No Cloudflare → Seu projeto → **Settings** → **Environment variables**
2. Adicionar:
   ```
   VITE_SUPABASE_URL = https://ffmyoutiutemmrmvxzig.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Redeploy** o site

---

## 🎯 Após Deploy

- [ ] Copiar link do site
- [ ] Testar em navegador
- [ ] Testar em celular
- [ ] Compartilhar com amigos! 🎮

---

## 🔄 Para Atualizar Depois

1. Fazer alterações no código
2. Executar no terminal:
   ```bash
   cd /Users/felipeandrade/Desktop/siteplaynowemu/project
   npm run build
   ```
3. Fazer novo upload da pasta `dist` no Cloudflare

---

**TUDO PRONTO!** Agora é só fazer o upload! 🚀
