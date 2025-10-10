# 🧹 Como Limpar Salas Multiplayer

## 🎯 Quando Usar?

Execute este script quando:
- ✅ Houver salas abertas bugadas
- ✅ Salas antigas que não fecharam
- ✅ Quiser limpar todas as salas de teste
- ✅ Após manutenção do sistema

## 🚀 Execução

### Método 1: Terminal (Recomendado)

```bash
cd /Users/felipeandrade/Desktop/siteplaynowemu/project
npx tsx scripts/cleanup-sessions.ts
```

### Método 2: Comando Único

```bash
npx tsx /Users/felipeandrade/Desktop/siteplaynowemu/project/scripts/cleanup-sessions.ts
```

## 📊 O Que o Script Faz?

1. **Analisa** todas as sessões no Firestore
2. **Identifica** salas para fechar/deletar:
   - Salas com status "closed"
   - Salas sem jogadores (currentPlayers = 0)
   - Salas antigas (criadas há mais de 24 horas e ainda em "waiting")
3. **Fecha** salas qualificadas (muda status para "closed")
4. **Deleta** salas já fechadas + subcoleções
5. **Mostra** relatório detalhado

## 📋 Exemplo de Saída

```
🧹 Iniciando limpeza de sessões...

📊 Total de sessões encontradas: 5

🔍 Analisando sessão: abc123
   Nome: Sala do João
   Status: closed
   Host: user456
   Jogadores: 0/4
   ❌ Sessão já fechada - deletando
   ✅ Sessão deletada completamente

🔍 Analisando sessão: xyz789
   Nome: Sala Teste
   Status: waiting
   Host: user789
   Jogadores: 0/4
   ⚠️ Sessão sem jogadores - fechando
   ✅ Sessão marcada como fechada

🔍 Analisando sessão: def456
   Nome: Sala Ativa
   Status: playing
   Host: user123
   Jogadores: 2/4
   ✓ Sessão ativa - mantendo


📊 RESUMO DA LIMPEZA:
   ✅ Sessões fechadas: 1
   🗑️ Sessões deletadas: 1
   ❌ Erros: 0
   📈 Total processadas: 5

✨ Limpeza concluída!

👍 Script finalizado com sucesso
```

## ⚙️ Critérios de Limpeza

### Será Deletada:
- Status já é "closed"

### Será Fechada:
- currentPlayers = 0 (sem jogadores)
- Criada há mais de 24 horas E status = "waiting"

### Será Mantida:
- Status = "playing"
- Tem jogadores ativos
- Criada recentemente (<24h) e status = "waiting"

## 🔍 Verificar Resultado

### No Firestore Console:
https://console.firebase.google.com/project/planowemulator/firestore/data/game_sessions

### Filtros Úteis:
- `status == "waiting"` - Salas aguardando
- `status == "closed"` - Salas fechadas
- `currentPlayers == 0` - Salas vazias

## 🛡️ Segurança

O script é **100% seguro**:
- ✅ Não deleta salas ativas
- ✅ Não afeta jogadores em jogo
- ✅ Só fecha salas vazias/antigas
- ✅ Tratamento de erros completo
- ✅ Rollback automático em caso de erro

## 🔄 Limpeza Automática

**Boa notícia!** O sistema já faz limpeza automática:

- ⏰ **A cada 5 minutos**
- 🎯 **Fecha salas inativas >1 hora**
- 🗑️ **Fecha salas vazias**
- 📊 **Registra logs no console**

**Você NÃO precisa executar o script manualmente** na maioria dos casos.

Use o script manual apenas para:
- Limpeza imediata
- Teste/debug
- Manutenção especial

## 📞 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install tsx
# Depois execute novamente
npx tsx scripts/cleanup-sessions.ts
```

### Erro: "Permission denied"
Verifique as Firestore Rules:
```javascript
match /game_sessions/{sessionId} {
  allow read, write: if request.auth != null;
}
```

### Erro: "Firebase not initialized"
O script usa as mesmas credenciais do projeto.
Não precisa configurar nada extra.

## 🎯 Comandos Rápidos

```bash
# Limpar salas
npx tsx scripts/cleanup-sessions.ts

# Ver salas no Firestore (abre navegador)
open "https://console.firebase.google.com/project/planowemulator/firestore/data/game_sessions"

# Build + Deploy
npm run build && npx firebase-tools deploy --only hosting
```

## 📊 Logs

O script mostra:
- 🔍 Cada sessão analisada
- ✅ Ações tomadas
- 📈 Resumo final
- ❌ Erros (se houver)

**Tudo muito visual e fácil de entender!**

---

**✨ Pronto! Suas salas estão limpas!**
