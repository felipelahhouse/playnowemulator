# 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE NO CLOUDFLARE PAGES

## ⚠️ IMPORTANTE: O site está vazio porque faltam as variáveis de ambiente!

Siga EXATAMENTE estes passos:

---

## 📋 PASSO 1: Abrir Configurações

1. Vá em: https://dash.cloudflare.com/
2. Clique em **Pages** (menu lateral esquerdo)
3. Clique no projeto **playnowemulator**
4. Clique na aba **Settings** (Configurações)
5. Role até encontrar **Environment variables** (Variáveis de ambiente)

---

## 📋 PASSO 2: Adicionar as Variáveis

### Variável 1: VITE_SUPABASE_URL

1. Clique em **Add variable** (ou botão **+**)
2. Em **Variable name**, digite EXATAMENTE:
   ```
   VITE_SUPABASE_URL
   ```
3. Em **Value**, cole EXATAMENTE:
   ```
   https://ffmyoutiutemmrmvxzig.supabase.co
   ```
4. Em **Environment**, selecione: **Production**
5. Clique em **Save** ou **Add**

### Variável 2: VITE_SUPABASE_ANON_KEY

1. Clique em **Add variable** novamente
2. Em **Variable name**, digite EXATAMENTE:
   ```
   VITE_SUPABASE_ANON_KEY
   ```
3. Em **Value**, cole EXATAMENTE:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbXlvdXRpdXRlbW1ybXZ4emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc0MjAsImV4cCI6MjA3NTQ3MzQyMH0.OY6exjP3UPjccESSsBjoP0ysQBw2Ro9xMHiR1-4fZbI
   ```
4. Em **Environment**, selecione: **Production**
5. Clique em **Save** ou **Add**

---

## 📋 PASSO 3: Verificar as Variáveis

Depois de adicionar as DUAS variáveis, você deve ver algo assim:

```
Environment variables for Production:

✅ VITE_SUPABASE_URL = https://ffmyoutiutemmrmvxzig.supabase.co
✅ VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5...
```

---

## 📋 PASSO 4: Fazer Redeploy

1. Vá na aba **Deployments**
2. Encontre o deployment mais recente (primeiro da lista)
3. Clique nos **3 pontinhos (...)** ao lado dele
4. Clique em **Retry deployment** ou **Manage deployment** > **Redeploy**
5. Aguarde 1-2 minutos até o status ficar **Success** ✅

---

## 📋 PASSO 5: Testar o Site

1. Abra: https://playnowemulator.pages.dev
2. Aperte **Cmd + Shift + R** (Mac) ou **Ctrl + Shift + R** (Windows)
3. Os **29 jogos** devem aparecer! 🎮
4. O visual **NEON GAMING** deve estar aplicado! ✨

---

## ❓ Problemas?

Se ainda não funcionar:

1. Verifique se as variáveis estão EXATAMENTE como mostrado acima
2. Certifique-se que selecionou **Production** como environment
3. Faça um **novo deploy** (não apenas retry)
4. Aguarde 2-3 minutos para o cache limpar
5. Use modo anônimo/privado do navegador para testar

---

## 🎯 Resultado Esperado

Depois de configurar tudo corretamente, você verá:

✅ 29 jogos SNES na biblioteca
✅ Tema neon com cores cyan, purple e pink
✅ Animações suaves nos cards
✅ Efeitos de glow e hover
✅ Header moderno com gradientes
✅ Funcionalidade de PLAY, LIVE e MULTIPLAYER

---

**Boa sorte! 🚀**
