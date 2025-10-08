import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjllytjczpaxynebnkly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbGx5dGpjenBheHluZWJua2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM1MjksImV4cCI6MjA3NTQyOTUyOX0.RhKNKVkp6A0mGqWjjJKTix-CDUklo21kRXGrtyxTNqo';

const supabase = createClient(supabaseUrl, supabaseKey);

const games = [
  { title: 'Aladdin', description: 'Join Aladdin in this action-packed platformer based on the Disney movie.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Aladdin (U) [!].smc', platform: 'SNES', genre: 'Platform', year: 1993, players: 1, rating: 4.5 },
  { title: 'Battletoads & Double Dragon', description: 'The ultimate crossover! Team up with the Battletoads and Double Dragon.', image_url: '/BattleToadsDoubleDragon.jpg', rom_url: '/roms/Battletoads & Double Dragon - The Ultimate Team (U) [!].smc', platform: 'SNES', genre: 'Action', year: 1993, players: 2, rating: 4.3 },
  { title: 'Battletoads in Battlemaniacs', description: 'The Battletoads are back! Fight through intense levels.', image_url: '/Battletoads_in_Battlemaniacs.png', rom_url: '/roms/Battletoads in Battlemaniacs (U) [!].smc', platform: 'SNES', genre: 'Action', year: 1993, players: 2, rating: 4.4 },
  { title: 'Castlevania: Dracula X', description: 'Battle Dracula in this gothic horror action platformer.', image_url: '/Castlevania_Dracula_X_cover_art.png', rom_url: '/roms/Castlevania - Dracula X (U) [!].smc', platform: 'SNES', genre: 'Action', year: 1995, players: 1, rating: 4.6 },
  { title: 'Dragon Ball Z: Super Butouden 2', description: 'Epic DBZ fighting game with your favorite characters.', image_url: '/SNES_Dragon_Ball_Z_-_Super_Butōden_2_cover_art.jpg', rom_url: '/roms/Dragon Ball Z - Super Butouden 2 (J) (V1.1).smc', platform: 'SNES', genre: 'Fighting', year: 1993, players: 2, rating: 4.5 },
  { title: 'Fatal Fury 2', description: 'Classic fighting game with diverse characters and special moves.', image_url: '/Fatal Fury 2 .jpg', rom_url: '/roms/Fatal Fury 2 (E) [!].smc', platform: 'SNES', genre: 'Fighting', year: 1993, players: 2, rating: 4.2 },
  { title: 'Fatal Fury Special', description: 'Enhanced version of Fatal Fury with more characters.', image_url: '/Fatal Fury Special (E) (61959).jpg', rom_url: '/roms/Fatal Fury Special (E) (61959).smc', platform: 'SNES', genre: 'Fighting', year: 1994, players: 2, rating: 4.4 },
  { title: 'Goof Troop', description: 'Join Goofy and Max in this fun puzzle-adventure game.', image_url: '/Goof Troop (E).jpg', rom_url: '/roms/Goof Troop (E).smc', platform: 'SNES', genre: 'Puzzle', year: 1993, players: 2, rating: 4.0 },
  { title: 'International Superstar Soccer Deluxe', description: 'The ultimate soccer experience on SNES.', image_url: '/International-Superstar-Soccer-Deluxe-box-art.webp', rom_url: '/roms/International Superstar Soccer Deluxe (U).smc', platform: 'SNES', genre: 'Sports', year: 1995, players: 4, rating: 4.7 },
  { title: 'Joe & Mac 2: Lost in the Tropics', description: 'Prehistoric adventure platformer with colorful graphics.', image_url: '/Joe & Mac 2 - Lost in the Tropics (U).jpg', rom_url: '/roms/Joe & Mac 2 - Lost in the Tropics (U).smc', platform: 'SNES', genre: 'Platform', year: 1994, players: 1, rating: 4.1 },
  { title: 'Killer Instinct', description: 'Revolutionary fighting game with amazing combo system.', image_url: '/Killer Instinct (E) [!].jpg', rom_url: '/roms/Killer Instinct (E) [!].smc', platform: 'SNES', genre: 'Fighting', year: 1995, players: 2, rating: 4.8 },
  { title: 'The Magical Quest Starring Mickey Mouse', description: 'Join Mickey in a magical adventure with costume transformations.', image_url: '/The_Magical_Quest_starring_Mickey_Mouse_%28NA%29.webp', rom_url: '/roms/Magical Quest Starring Mickey Mouse, The (U) [!].smc', platform: 'SNES', genre: 'Platform', year: 1992, players: 1, rating: 4.5 },
  { title: 'Mega Man X', description: 'The legendary action platformer! Fight as X with new abilities.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Mega Man X (U) (V1.0) [!].smc', platform: 'SNES', genre: 'Action', year: 1993, players: 1, rating: 4.9 },
  { title: 'Mickey to Donald: Magical Adventure 3', description: 'Mickey and Donald team up in this Japanese platformer.', image_url: '/Mickey to Donald - Magical Adventure 3 (J) [t2].jpg', rom_url: '/roms/Mickey to Donald - Magical Adventure 3 (J) [t2].smc', platform: 'SNES', genre: 'Platform', year: 1995, players: 2, rating: 4.2 },
  { title: 'Mighty Morphin Power Rangers: The Movie', description: 'Fight as the Power Rangers in this action-packed beat em up.', image_url: '/Mighty Morphin Power Rangers - The Movie (U).jpg', rom_url: '/roms/Mighty Morphin Power Rangers - The Movie (U).smc', platform: 'SNES', genre: 'Action', year: 1995, players: 2, rating: 4.0 },
  { title: 'Mighty Morphin Power Rangers', description: 'Morph into action as the Power Rangers and save the world.', image_url: '/Mighty Morphin Power Rangers (U).jpg', rom_url: '/roms/Mighty Morphin Power Rangers (U).smc', platform: 'SNES', genre: 'Action', year: 1994, players: 2, rating: 4.1 },
  { title: 'Mutant Chronicles: Doom Troopers', description: 'Run and gun action in a dark sci-fi world.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Mutant Chronicles - Doom Troopers (U) [!].smc', platform: 'SNES', genre: 'Action', year: 1995, players: 2, rating: 3.9 },
  { title: 'Prehistorik Man', description: 'Stone age platforming adventure with colorful graphics.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Prehistorik Man (U) [!].smc', platform: 'SNES', genre: 'Platform', year: 1995, players: 1, rating: 4.0 },
  { title: 'Sparkster', description: 'Rocket-powered possum action! Fly through levels.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Sparkster (E).smc', platform: 'SNES', genre: 'Action', year: 1994, players: 1, rating: 4.3 },
  { title: 'Street Fighter Alpha 2', description: 'Classic Street Fighter action with Alpha counters.', image_url: '/Street Fighter Alpha 2 (U) [!].jpg', rom_url: '/roms/Street Fighter Alpha 2 (U) [!].smc', platform: 'SNES', genre: 'Fighting', year: 1996, players: 2, rating: 4.7 },
  { title: 'Super Double Dragon', description: 'The Lee brothers return! Beat em up action.', image_url: '/super double dragon.jpg', rom_url: '/roms/Super Double Dragon (U).smc', platform: 'SNES', genre: 'Action', year: 1992, players: 2, rating: 4.2 },
  { title: 'Super Mario Kart', description: 'The racing game that started it all!', image_url: '/Super Mario Kart .webp', rom_url: '/roms/Super Mario Kart (E) [!].smc', platform: 'SNES', genre: 'Racing', year: 1992, players: 2, rating: 4.9 },
  { title: 'Super Mario World', description: 'The definitive Mario platformer! Explore Dinosaur Land with Yoshi.', image_url: '/Super_Mario_World_Coverart.png', rom_url: '/roms/Super Mario World (U) [!].smc', platform: 'SNES', genre: 'Platform', year: 1990, players: 1, rating: 5.0 },
  { title: 'Super Star Wars: The Empire Strikes Back', description: 'Experience the epic Star Wars saga.', image_url: '/Super Star Wars - The Empire Strikes Back.jpg', rom_url: '/roms/Super Star Wars - The Empire Strikes Back (U) (V1.1) [!].smc', platform: 'SNES', genre: 'Action', year: 1993, players: 1, rating: 4.5 },
  { title: 'Super Street Fighter II', description: 'The ultimate version of Street Fighter II.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Super Street Fighter II - The New Challengers (E) [!].smc', platform: 'SNES', genre: 'Fighting', year: 1994, players: 2, rating: 4.8 },
  { title: 'TMNT: Tournament Fighters', description: 'Teenage Mutant Ninja Turtles fighting game.', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Teenage Mutant Hero Turtles - Tournament Fighters (E).smc', platform: 'SNES', genre: 'Fighting', year: 1993, players: 2, rating: 4.4 },
  { title: 'TMNT IV: Turtles in Time', description: 'Time-traveling beat em up with the Turtles!', image_url: '/aladdinsnes.jpg', rom_url: '/roms/Teenage Mutant Ninja Turtles IV - Turtles in Time (U) [!].smc', platform: 'SNES', genre: 'Action', year: 1992, players: 2, rating: 4.8 },
  { title: 'Top Gear', description: 'High-speed racing action! Compete in international races.', image_url: '/Top_Gear_cover_art.jpg', rom_url: '/roms/Top Gear (U) [!].smc', platform: 'SNES', genre: 'Racing', year: 1992, players: 2, rating: 4.6 },
  { title: 'Donkey Kong Country', description: 'Revolutionary platformer with stunning pre-rendered graphics!', image_url: '/Donkey_Kong_Country_SNES_cover.png', rom_url: '/roms/Donkey Kong Country (U) (V1.2) [!].smc', platform: 'SNES', genre: 'Platform', year: 1994, players: 2, rating: 4.9 }
];

console.log('🎮 Adicionando jogos ao Supabase...\n');

const { data: existing } = await supabase.from('games').select('title');
const existingTitles = new Set(existing?.map(g => g.title) || []);
const newGames = games.filter(g => !existingTitles.has(g.title));

if (newGames.length === 0) {
  console.log('✅ Todos os 29 jogos já exist em!');
  process.exit(0);
}

console.log(`📦 Adicionando ${newGames.length} jogos novos...\n`);

const { error } = await supabase.from('games').insert(newGames);

if (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

console.log(`\n✅ ${newGames.length} jogos adicionados com sucesso!`);
console.log('🎉 Agora você tem todos os jogos no site!');
