# 🎮 Como Adicionar os Jogos ao Banco de Dados

## Método 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Dashboard do Supabase: https://app.supabase.com
2. Vá para o seu projeto
3. Clique em "Table Editor" no menu lateral
4. Selecione a tabela `games`
5. Clique em "Insert row" e adicione cada jogo manualmente com os dados do arquivo `add-games.js`

## Método 2: Via SQL Editor

1. Acesse o Dashboard do Supabase
2. Vá para "SQL Editor"
3. Copie e cole o conteúdo do arquivo `games-insert.sql` (vou criar agora)
4. Clique em "Run"

## Método 3: Via Script Node.js

1. Instale as dependências:
```bash
npm install @supabase/supabase-js
```

2. Configure suas credenciais no arquivo `add-games.js`:
   - Substitua `YOUR_SUPABASE_URL` pela URL do seu projeto
   - Substitua `YOUR_SUPABASE_ANON_KEY` pela chave anon do seu projeto

3. Execute o script:
```bash
node add-games.js
```

## 📝 Lista de Jogos Incluídos (29 jogos)

1. Aladdin ⭐ 4.5
2. Battletoads & Double Dragon ⭐ 4.3
3. Battletoads in Battlemaniacs ⭐ 4.4
4. Castlevania: Dracula X ⭐ 4.6
5. Dragon Ball Z: Super Butouden 2 ⭐ 4.5
6. Fatal Fury 2 ⭐ 4.2
7. Fatal Fury Special ⭐ 4.4
8. Goof Troop ⭐ 4.0
9. International Superstar Soccer Deluxe ⭐ 4.7
10. Joe & Mac 2: Lost in the Tropics ⭐ 4.1
11. Killer Instinct ⭐ 4.8
12. The Magical Quest Starring Mickey Mouse ⭐ 4.5
13. Mega Man X ⭐ 4.9
14. Mickey to Donald: Magical Adventure 3 ⭐ 4.2
15. Mighty Morphin Power Rangers: The Movie ⭐ 4.0
16. Mighty Morphin Power Rangers ⭐ 4.1
17. Mutant Chronicles: Doom Troopers ⭐ 3.9
18. Prehistorik Man ⭐ 4.0
19. Sparkster ⭐ 4.3
20. Street Fighter Alpha 2 ⭐ 4.7
21. Super Double Dragon ⭐ 4.2
22. Super Mario Kart ⭐ 4.9
23. Super Mario World ⭐ 5.0
24. Super Star Wars: The Empire Strikes Back ⭐ 4.5
25. Super Street Fighter II ⭐ 4.8
26. TMNT: Tournament Fighters ⭐ 4.4
27. TMNT IV: Turtles in Time ⭐ 4.8
28. Top Gear ⭐ 4.6
29. Donkey Kong Country ⭐ 4.9

## 🎨 Capas Incluídas

Todas as capas já foram copiadas para `/public/`:
- ✅ 22 capas específicas em JPG, PNG e WEBP
- ✅ Mapeamento automático no código para detectar qual capa usar

## 📂 ROMs Incluídas

Todas as 29 ROMs foram copiadas para `/public/roms/`:
- Formato: .smc (SNES ROM)
- Prontas para jogar!

## 🚀 Próximos Passos

1. Adicione os jogos ao banco de dados usando um dos métodos acima
2. Reinicie o servidor se necessário: `npm run dev`
3. Acesse http://localhost:5173
4. Aproveite todos os jogos! 🎮
