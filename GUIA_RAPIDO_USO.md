# 🎮 GUIA RÁPIDO - Sistema Multiplayer Corrigido

## ✅ O QUE FOI CORRIGIDO?

### 1. Salas Abertas Bugadas ✓
- **Antes:** Salas ficavam abertas para sempre
- **Agora:** Fecham automaticamente quando vazias ou após 1 hora

### 2. Host Sai = Sala Quebra ✓
- **Antes:** Quando host saía, sala quebrava
- **Agora:** Próximo jogador vira host automaticamente

### 3. Nome do Website ✓
- **Antes:** "vite-react-typescript-starter"
- **Agora:** "PlayNow Emulator"

---

## 🚀 COMO USAR

### Criar Sala Multiplayer
1. Acesse: https://planowemulator.web.app
2. Faça login
3. Clique em "Multiplayer" no menu
4. Clique em "Criar Sala"
5. Escolha o jogo
6. Defina nome da sala
7. Escolha público/privado
8. Clique em "Criar"

### Entrar em Sala
1. Vá para "Multiplayer"
2. Veja lista de salas disponíveis
3. Clique em "Entrar" na sala desejada
4. Aguarde outros jogadores

### Sair de Sala
- **Se você é o host:** Sala fecha OU próximo jogador vira host
- **Se você não é host:** Você sai e sala continua

---

## 🔧 ADMINISTRAÇÃO

### Limpar Salas Bugadas Manualmente

```bash
cd /Users/felipeandrade/Desktop/siteplaynowemu/project
npx tsx scripts/cleanup-sessions.ts
```

Isso vai:
- ✅ Analisar todas as salas
- ✅ Fechar salas vazias
- ✅ Fechar salas antigas (>1 hora)
- ✅ Deletar salas já fechadas
- ✅ Mostrar relatório completo

### Ver Salas no Firestore

**Console:**
https://console.firebase.google.com/project/planowemulator/firestore/data/game_sessions

**Filtros úteis:**
- `status == "waiting"` = Salas aguardando jogadores
- `status == "playing"` = Salas em jogo
- `status == "closed"` = Salas fechadas
- `currentPlayers == 0` = Salas vazias

---

## 🧪 TESTANDO

### Teste 1: Host Promovido
1. Abra 2 navegadores (Chrome e Firefox)
2. **Chrome:** Crie sala e seja o host
3. **Firefox:** Entre na mesma sala
4. **Chrome:** Feche a aba/navegador
5. **Firefox:** Você deve virar host automaticamente

**Resultado esperado:** ✅ Firefox vira host

### Teste 2: Sala Vazia Fecha
1. Crie uma sala
2. Não convide ninguém
3. Saia da sala
4. Aguarde 5 segundos

**Resultado esperado:** ✅ Sala é marcada como "closed"

### Teste 3: Limpeza Automática
1. Deixe o site aberto
2. Aguarde 5 minutos
3. Abra console (F12)

**Resultado esperado:** ✅ Ver logs de limpeza automática

---

## 🐛 PROBLEMAS COMUNS

### Sala não aparece na lista
**Causas possíveis:**
- Sala está privada e você não tem o link
- Sala foi fechada por inatividade
- Índices do Firestore ainda construindo

**Solução:**
1. Aguarde 2 minutos (índices)
2. Recarregue a página
3. Crie nova sala

### Não consigo entrar na sala
**Causas possíveis:**
- Sala está cheia (max 4 jogadores)
- Sala foi fechada recentemente
- Problemas de conexão

**Solução:**
1. Verifique se sala ainda está "waiting"
2. Recarregue a página
3. Tente outra sala

### Virei host sem querer
**Causa:**
- Host original saiu da sala
- Você era o próximo na fila (menor playerNumber)

**Isso é normal!** 
- O sistema promove automaticamente
- Sala continua funcionando normalmente

---

## 📊 MONITORAMENTO

### Logs do Sistema

**Abra console (F12) para ver:**

```
✅ Novo host promovido: user123
🧹 Sala inativa fechada: abc456
⚠️ Sessão foi fechada
🗑️ Fechando sessão: xyz789
```

### Comandos Úteis (Console)

```javascript
// Ver localStorage
console.log('Auth:', localStorage.getItem('auth-storage'));

// Ver tema atual
console.log('Theme:', localStorage.getItem('theme'));

// Forçar reload
location.reload();

// Limpar cache
localStorage.clear();
```

---

## 🔐 FIRESTORE RULES

**Certifique-se que as regras estão corretas:**

```javascript
match /game_sessions/{sessionId} {
  // Ler: público ou participante
  allow read: if resource.data.isPublic == true || 
                 request.auth.uid in resource.data.players;
  
  // Criar: autenticado
  allow create: if request.auth != null;
  
  // Atualizar: host ou participante
  allow update: if request.auth.uid == resource.data.host_user_id ||
                   request.auth.uid in resource.data.players;
  
  // Deletar: apenas host
  allow delete: if request.auth.uid == resource.data.host_user_id;
}
```

---

## 📈 ESTATÍSTICAS

### Executar no Console do Navegador

```javascript
// Contar salas ativas
const activeSessions = await getDocs(
  query(collection(db, 'game_sessions'), where('status', '==', 'waiting'))
);
console.log('Salas ativas:', activeSessions.size);

// Contar total de jogadores online
let totalPlayers = 0;
activeSessions.forEach(doc => {
  totalPlayers += doc.data().currentPlayers || 0;
});
console.log('Jogadores online:', totalPlayers);
```

---

## 🎯 CHECKLIST DEPLOY

- [x] ✅ Build compilou sem erros
- [x] ✅ Deploy para Firebase Hosting
- [x] ✅ Firestore índices criados
- [x] ✅ Sistema de limpeza ativo
- [x] ✅ Nome do website corrigido
- [x] ✅ Hooks funcionando
- [x] ✅ Testes passando
- [x] ✅ Documentação criada

---

## 📞 COMANDOS RÁPIDOS

```bash
# Ver salas no banco
npx tsx scripts/cleanup-sessions.ts

# Build local
npm run build

# Preview local
npm run preview

# Deploy
npx firebase-tools deploy --only hosting

# Ver logs do Firebase
npx firebase-tools hosting:channel:open
```

---

## ✨ ESTÁ TUDO PRONTO!

**🌐 Website:** https://planowemulator.web.app
**📦 Versão:** 1.0.0
**🟢 Status:** Online
**📅 Deploy:** 9 de Outubro de 2025

---

## 🎮 BORA JOGAR!

Tudo funcionando perfeitamente. Agora é só:

1. ✅ Acessar o site
2. ✅ Criar uma sala
3. ✅ Convidar amigos
4. ✅ Jogar retro games
5. ✅ Aproveitar!

**🎃 Tema Halloween ativo em Outubro!**
