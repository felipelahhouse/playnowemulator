# 🔧 Configurar Variáveis de Ambiente no Cloudflare Pages

## ❌ PROBLEMA
O site no Cloudflare não consegue fazer login/criar contas porque **as variáveis de ambiente do Supabase não estão configuradas**.

## ✅ SOLUÇÃO

### Passo 1: Acessar Cloudflare Pages
1. Vá para: https://dash.cloudflare.com/
2. Entre na sua conta
3. Clique em **Pages** no menu lateral
4. Clique no projeto **playnowemulator**

### Passo 2: Configurar Variáveis de Ambiente
1. Clique na aba **Settings**
2. Role até **Environment variables**
3. Clique em **Add variable** ou **Edit variables**

### Passo 3: Adicionar as Variáveis
Adicione **EXATAMENTE** estas duas variáveis:

**Variável 1:**
```
Nome: VITE_SUPABASE_URL
Valor: https://ffmyoutiutemmrmvxzig.supabase.co
Ambiente: Production e Preview (marque ambos)
```

**Variável 2:**
```
Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbXlvdXRpdXRlbW1ybXZ4emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc0MjAsImV4cCI6MjA3NTQ3MzQyMH0.OY6exjP3UPjccESSsBjoP0ysQBw2Ro9xMHiR1-4fZbI
Ambiente: Production e Preview (marque ambos)
```

### Passo 4: Salvar e Re-deploy
1. Clique em **Save** para salvar as variáveis
2. Vá para a aba **Deployments**
3. Encontre o último deploy
4. Clique nos **3 pontinhos (...)** ao lado
5. Clique em **Retry deployment**

### Passo 5: Aguardar
- O Cloudflare vai recompilar o site (leva ~2-3 minutos)
- Quando terminar, o site terá as variáveis configuradas
- Teste criar uma conta em: https://playnowemulator.pages.dev

## 🎯 Como Verificar se Funcionou

Depois do deploy:
1. Abra o site: https://playnowemulator.pages.dev
2. Abra o Console do navegador (F12)
3. Tente criar uma conta
4. Se ver erros de "undefined" no console = variáveis não estão configuradas
5. Se der erros específicos do Supabase = variáveis ESTÃO configuradas ✅

## 📝 Importante

- **Sempre que modificar as variáveis**, precisa fazer um novo deploy
- As variáveis do arquivo `.env` local **NÃO são enviadas** para o Cloudflare
- Você precisa configurar manualmente no painel do Cloudflare
- O ANON_KEY pode ser compartilhado publicamente (é seguro)

## 🔍 Troubleshooting

**Se ainda não funcionar:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Abra em aba anônima
3. Verifique se o deploy completou (deve mostrar "Success")
4. Verifique se os nomes das variáveis estão EXATAMENTE como acima (case-sensitive)
