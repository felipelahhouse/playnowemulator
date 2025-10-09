# 🔍 CHECKLIST - O que está acontecendo?

## Problema 1: Não consigo fazer logout
**Sintomas:**
- Botão "Sair" não aparece no header?
- Menu do perfil não abre?
- Logout não funciona?

**Solução:**
1. Limpe cache: `Cmd+Shift+R` (force reload)
2. Aguarde 3 minutos (deploy Cloudflare)
3. Deve aparecer botão "Sair" vermelho ao lado de "Configurações"

## Problema 2: Perfil não abre
**Sintomas:**
- Clica no nome mas nada acontece?
- Dropdown não aparece?

**Causa provável:**
- Cache do navegador com versão antiga
- Deploy ainda processando

**Solução:**
1. Abra DevTools (F12)
2. Application → Clear storage → Clear site data
3. Recarregue (Cmd+R)

## Problema 3: Dashboard vazio ou com aviso
**Sintomas:**
- Aviso amarelo "Sistema de XP desativado"?
- Estatísticas zeradas?

**Causa:**
- SQL não foi executado no Supabase OU
- SQL rodou mas tabelas ainda vazias

**Verificar:**
1. Abra https://ffmyoutiutemmrmvxzig.supabase.co
2. SQL Editor → Execute:
   ```sql
   SELECT COUNT(*) FROM user_stats;
   SELECT COUNT(*) FROM achievements;
   ```
3. Se retornar erro = SQL não foi aplicado
4. Se retornar 0/24 = Tabelas criadas mas vazias (normal para novo usuário)

## Problema 4: Site não atualizou
**Sintomas:**
- Mesma interface de antes
- Mudanças não aparecem

**Solução:**
1. Confirme URL: https://playnowemulator.pages.dev
2. Verifique deploy: https://dash.cloudflare.com/
3. Tempo deploy: 2-5 minutos após git push
4. Cache: Cmd+Shift+R (Mac) Ctrl+Shift+R (Win)

## 🚨 QUAL É O SEU PROBLEMA ESPECÍFICO?

Me diga exatamente o que está vendo:
- [ ] Não vejo botão "Sair"
- [ ] Menu não abre quando clico no perfil
- [ ] Dashboard mostra aviso amarelo
- [ ] Site parece igual ao de antes (sem mudanças)
- [ ] Outro: _______________________
