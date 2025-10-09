# 🔒 GUIA: Corrigir Todos os Warnings de Segurança

## ✅ Warnings Corrigidos Automaticamente

### 1. Function Search Path Mutable (AMARELO)

**Funções afetadas:**
- `calculate_level`
- `add_user_xp`
- `unlock_achievement`
- `create_user_stats`
- `update_updated_at_column`
- `handle_new_user` ⚠️ NOVO
- `cleanup_old_sessions` ⚠️ NOVO

**Solução:**
1. Abra `FIX_FUNCTION_WARNINGS.sql`
2. Copie TODO o conteúdo
3. Supabase → SQL Editor → New Query
4. Cole e clique **RUN**

**O que faz:**
- Adiciona `SECURITY DEFINER` em todas as funções
- Adiciona `SET search_path = public` para prevenir ataques

---

## 🟢 Warnings Verdes (Não Críticos)

### 2. RLS Enabled No Policy

**Entidades:**
- `public.host_user_id`
- `public.streamer_id`

**Status:** Provavelmente são **colunas**, não tabelas.

**Verificação:**
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('host_user_id', 'streamer_id');
```

- Se retornar **vazio** → Ignore (é falso positivo)
- Se retornar **algo** → Execute `FIX_RLS_WARNINGS.sql`

---

## 🟡 Leaked Password Protection (AMARELO)

**Problema:** Proteção contra senhas vazadas está desativada.

**Solução MANUAL (no Dashboard):**

1. Vá em: https://ffmyoutiutemmrmvxzig.supabase.co
2. Settings (menu lateral esquerdo)
3. **Authentication** (sub-menu)
4. Role na página até **Password Protection**
5. Ative: ☑️ **Enable leaked password protection**
6. Clique **Save**

**O que faz:**
- Verifica senhas contra banco HaveIBeenPwned.org
- Bloqueia senhas conhecidas vazadas
- Aumenta segurança sem afetar performance

---

## 📊 Resumo das Ações

| Warning | Cor | Ação | Arquivo |
|---------|-----|------|---------|
| Function Search Path | 🟡 | SQL Script | `FIX_FUNCTION_WARNINGS.sql` |
| RLS No Policy | 🟢 | Verificar primeiro | `FIX_RLS_WARNINGS.sql` |
| Leaked Password | 🟡 | Dashboard manual | Settings → Auth |

---

## 🚀 Ordem de Execução

**Passo 1:** Corrigir funções
```bash
# Abrir FIX_FUNCTION_WARNINGS.sql
# Copiar tudo → SQL Editor → RUN
```

**Passo 2:** Ativar proteção de senha
```
Dashboard → Settings → Authentication
→ Enable leaked password protection → Save
```

**Passo 3:** (Opcional) Verificar RLS
```sql
-- Rodar no SQL Editor para confirmar se são tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('host_user_id', 'streamer_id');
```

---

## ✅ Resultado Esperado

Após executar tudo:
- ✅ Todos os warnings amarelos somem
- ✅ Warnings verdes podem ser ignorados (se forem colunas)
- ✅ Segurança do banco aumentada
- ✅ Conformidade com melhores práticas PostgreSQL

---

## 🔍 Verificação Final

Execute no SQL Editor para confirmar:

```sql
-- Ver funções com search_path correto
SELECT 
  p.proname as function_name,
  CASE 
    WHEN prosecdef THEN 'SECURITY DEFINER ✅' 
    ELSE 'SECURITY INVOKER ⚠️' 
  END as security,
  CASE 
    WHEN proconfig IS NOT NULL THEN 'search_path SET ✅'
    ELSE 'search_path MUTABLE ⚠️'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'calculate_level', 
    'add_user_xp', 
    'unlock_achievement', 
    'create_user_stats', 
    'update_updated_at_column',
    'handle_new_user',
    'cleanup_old_sessions'
  )
ORDER BY p.proname;
```

**Todas as linhas devem ter:**
- `SECURITY DEFINER ✅`
- `search_path SET ✅`

---

Feito com 💜 por PlayNowEmu Team
