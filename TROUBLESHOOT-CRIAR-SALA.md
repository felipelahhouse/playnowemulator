# 🎮 Troubleshooting: Criação de Salas Multiplayer

## ❌ PROBLEMA: "Não consigo criar sala como HOST"

### 🔍 DIAGNÓSTICO

Quando você clica no botão "Criar Sala como HOST" e nada acontece, pode ser por 3 motivos:

---

## ✅ SOLUÇÃO 1: Verificar Campos Obrigatórios

### O botão fica CINZA (desabilitado)?

Se sim, você precisa preencher:

1. **✍️ Nome da Sala** (obrigatório)
   - Digite um nome para sua sala
   - Ex: "Sala do João", "Partida Épica"

2. **🎮 Selecionar Jogo** (obrigatório)
   - Escolha um jogo na lista
   - Ex: "Super Mario World", "Donkey Kong Country"

### ✅ Agora o botão deve ficar ROXO (habilitado)

**Visual:**
- 🔴 Botão CINZA = Faltam informações
- 🟣 Botão ROXO = Pronto para criar

---

## ✅ SOLUÇÃO 2: Verificar se Está Logado

### Abra o Console do Navegador:
1. Aperte **F12**
2. Vá na aba **Console**
3. Tente criar a sala
4. Veja as mensagens:

**Se ver:**
```
❌ Usuário não está logado!
```

**Solução:** Faça login novamente
1. Clique no seu perfil (canto superior direito)
2. Faça logout
3. Faça login de novo
4. Tente criar a sala novamente

---

## ✅ SOLUÇÃO 3: Verificar Erros do Banco de Dados

### No Console (F12), se ver:

**Erro: "relation game_sessions does not exist"**
```
❌ A tabela game_sessions não existe no banco
```

**Solução:** Execute o SQL no Supabase

1. Vá para: https://supabase.com/dashboard
2. Seu projeto: ffmyoutiutemmrmvxzig
3. SQL Editor
4. Execute o script `MIGRAR-PARA-UUID.sql`

---

## 📊 Checklist Completo

Siga esta ordem:

### Passo 1: Verificar Login
- [ ] Estou logado? (vejo meu username no canto superior)
- [ ] Se não, fazer login

### Passo 2: Abrir Modal de Criação
- [ ] Cliquei em "Criar Sala (HOST)" (botão roxo)
- [ ] Modal abriu?

### Passo 3: Preencher Formulário
- [ ] Digite **Nome da Sala**
- [ ] Selecione **Jogo** na lista
- [ ] Escolha **Máximo de Jogadores** (padrão: 4)
- [ ] Marque **Sala Pública** (se quiser que qualquer um entre)

### Passo 4: Ver Validação Visual
- [ ] Apareceu aviso vermelho? 
  - Se sim: Preencha os campos que faltam
- [ ] Botão está roxo e brilhante?
  - Se não: Ainda falta algo

### Passo 5: Criar Sala
- [ ] Clique em "Criar Sala como HOST"
- [ ] Aguarde 1-2 segundos

### Passo 6: Verificar Resultado

**✅ DEU CERTO:**
- Abre tela do jogo
- Você vê sua sala na lista
- Badge "MINHA SALA" aparece

**❌ DEU ERRO:**
- Aparece um alerta com erro
- Veja o Console (F12) para detalhes

---

## 🔍 Mensagens de Debug (Console F12)

Quando você tenta criar sala, deve aparecer:

### ✅ Sucesso:
```
🎮 Tentando criar sala...
User: {id: "...", email: "..."}
Game ID: abc123
Session Name: Minha Sala
📝 Criando sessão no banco...
✅ Sessão criada: {id: "xyz789"}
👥 Adicionando jogador à sessão...
✅ Jogador adicionado!
🚀 Abrindo sessão: xyz789
```

### ❌ Erros Comuns:

**1. Usuário não logado:**
```
❌ Usuário não está logado!
```
→ Faça login

**2. Campos vazios:**
```
❌ Nenhum jogo selecionado!
```
→ Selecione um jogo

```
❌ Nome da sala vazio!
```
→ Digite um nome

**3. Erro de banco:**
```
❌ Erro ao criar sessão: {...}
```
→ Veja detalhes do erro e configure o banco

---

## 🎯 Exemplo Passo-a-Passo

### João quer criar uma sala:

1. **✅ Está logado** → Vê "João" no canto superior
2. **✅ Clica em "Multiplayer"**
3. **✅ Clica em "Criar Sala (HOST)"** (botão roxo)
4. **✅ Modal abre**
5. **✅ Preenche:**
   - Nome: "Sala do João"
   - Jogo: "Super Mario World"
   - Jogadores: 4
   - ✓ Sala Pública
6. **✅ Botão fica roxo** (não está mais cinza)
7. **✅ Clica em "Criar Sala como HOST"**
8. **✅ Aguarda 2 segundos**
9. **✅ Abre tela do jogo!**

---

## 💡 Dicas

### Se o botão está CINZA:
- ❌ **NÃO** clique
- ✍️ Preencha os campos que faltam
- 👀 Veja o aviso vermelho que mostra o que falta

### Se o botão está ROXO mas nada acontece:
- 🔍 Abra F12 → Console
- 🎯 Clique no botão de novo
- 📝 Leia as mensagens de erro
- 📧 Me envie print do erro

### Se aparecer alert de erro:
- 📸 Tire print
- 🔍 Abra Console (F12)
- 📋 Copie a mensagem de erro completa
- 📧 Me envie

---

## 🚀 Após o Deploy

**Aguarde 3 minutos** para o Cloudflare atualizar.

Teste:
1. Abra https://playnowemulator.pages.dev
2. Faça login
3. Multiplayer → Criar Sala
4. Preencha tudo
5. Veja no Console o que acontece
6. Me reporte!

---

**Última atualização:** 8 de outubro de 2025  
**Status:** ✅ Debug adicionado  
**Deploy:** Em andamento (~3 min)
