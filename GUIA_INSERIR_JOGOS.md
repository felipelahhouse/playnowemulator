# 🎮 COMO ADICIONAR OS JOGOS NO SUPABASE

## ⚡ APLICAR AGORA (2 minutos)

### **PASSO 1: Copiar o SQL**

1. Abra o arquivo: `INSERIR_JOGOS.sql`
2. Selecione TUDO (Cmd+A)
3. Copie (Cmd+C)

### **PASSO 2: Aplicar no Supabase**

1. Acesse: https://supabase.com/dashboard
2. Projeto: `ffmyoutiutemmrmvxzig`
3. Menu lateral: **SQL Editor**
4. Clique: **+ New query**
5. Cole o script (Cmd+V)
6. Clique: **Run** (ou Cmd+Enter)

### **PASSO 3: Verificar**

Após executar, deve mostrar:
```
✅ 30 jogos inseridos no catálogo!
🎮 Pronto para jogar!
```

---

## 📋 ORDEM RECOMENDADA

Se você ainda NÃO aplicou os outros scripts:

1. **PRIMEIRO:** `RESET_DATABASE_COMPLETO.sql` (cria as tabelas)
2. **DEPOIS:** `INSERIR_JOGOS.sql` (adiciona os jogos)

Se você JÁ aplicou o reset:

1. **APENAS:** `INSERIR_JOGOS.sql`

---

## 🎮 JOGOS QUE SERÃO ADICIONADOS (30 total)

### Plataforma / Aventura (9 jogos)
- ✅ Super Mario World
- ✅ Donkey Kong Country
- ✅ Aladdin
- ✅ The Magical Quest Starring Mickey Mouse
- ✅ Goof Troop
- ✅ Joe & Mac 2: Lost in the Tropics
- ✅ Prehistorik Man
- ✅ Sparkster
- ✅ Mickey to Donald: Magical Adventure 3

### Ação / Beat em Up (9 jogos)
- ✅ Mega Man X
- ✅ TMNT IV: Turtles in Time
- ✅ TMNT: Tournament Fighters
- ✅ Battletoads in Battlemaniacs
- ✅ Battletoads & Double Dragon
- ✅ Super Double Dragon
- ✅ Power Rangers
- ✅ Power Rangers: The Movie
- ✅ Doom Troopers

### Luta (7 jogos)
- ✅ Street Fighter Alpha 2
- ✅ Super Street Fighter II
- ✅ Fatal Fury 2
- ✅ Fatal Fury Special
- ✅ Killer Instinct
- ✅ Dragon Ball Z: Super Butouden 2
- ✅ (+ TMNT Tournament Fighters)

### Horror / Ação (2 jogos)
- ✅ Castlevania: Dracula X
- ✅ Castlevania: Vampire's Kiss

### Corrida / Esportes (3 jogos)
- ✅ Super Mario Kart
- ✅ Top Gear
- ✅ International Superstar Soccer Deluxe

### Star Wars (1 jogo)
- ✅ The Empire Strikes Back

---

## ✅ APÓS APLICAR

Vá no site e:
1. Recarregue a página (F5)
2. Vá em "Game Library"
3. Deve aparecer 30 jogos! 🎉

---

## 🐛 SE OS JOGOS NÃO APARECEREM

### Verificar se foram inseridos:
```sql
SELECT COUNT(*) as total FROM games;
```
Deve retornar: **30**

### Ver lista de jogos:
```sql
SELECT title, platform, year FROM games ORDER BY title;
```

### Tabela não existe?
Aplique primeiro: `RESET_DATABASE_COMPLETO.sql`

---

## 🎯 MULTIPLAYER

Jogos com **multiplayer_support = true** (20 jogos):
- Super Mario World
- Donkey Kong Country
- Goof Troop
- Joe & Mac 2
- Mickey to Donald 3
- TMNT IV
- TMNT Tournament Fighters
- Battletoads in Battlemaniacs
- Battletoads & Double Dragon
- Super Double Dragon
- Power Rangers
- Power Rangers Movie
- Doom Troopers
- Street Fighter Alpha 2
- Super Street Fighter II
- Fatal Fury 2
- Fatal Fury Special
- Killer Instinct
- DBZ Super Butouden 2
- Super Mario Kart
- Top Gear
- ISS Deluxe

---

**Criado:** October 9, 2025  
**Total de jogos:** 30 clássicos do SNES  
**ROMs:** Todos os arquivos já estão em `/public/roms/`
