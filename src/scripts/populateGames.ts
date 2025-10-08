import { supabase } from '../contexts/AuthContext';

const gameData = [
  {
    title: "Super Mario World",
    description: "Join Mario and Luigi in their quest to save Princess Peach and Dinosaur Land from Bowser and his Koopalings.",
    rom_url: "/roms/Super Mario World (U) [!].smc",
    platform: "SNES",
    genre: "Platform",
    year: 1990,
    players: 2,
    rating: 4.9,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rpe.jpg"
  },
  {
    title: "Super Mario Kart",
    description: "The original kart racing game that started the beloved Mario Kart series.",
    rom_url: "/roms/Super Mario Kart (E) [!].smc",
    platform: "SNES",
    genre: "Racing",
    year: 1992,
    players: 2,
    rating: 4.7,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vm4.jpg"
  },
  {
    title: "Donkey Kong Country",
    description: "Help Donkey Kong and Diddy Kong recover their stolen banana hoard from King K. Rool.",
    rom_url: "/roms/Donkey Kong Country (U) (V1.2) [!].smc",
    platform: "SNES",
    genre: "Platform",
    year: 1994,
    players: 2,
    rating: 4.8,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rqd.jpg"
  },
  {
    title: "Aladdin",
    description: "Experience the magical world of Aladdin in this action-packed platformer.",
    rom_url: "/roms/Aladdin (U) [!].smc",
    platform: "SNES",
    genre: "Platform",
    year: 1993,
    players: 1,
    rating: 4.5,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r5w.jpg"
  },
  {
    title: "Street Fighter Alpha 2",
    description: "The legendary fighting game featuring alpha counters, custom combos, and classic fighters.",
    rom_url: "/roms/Street Fighter Alpha 2 (U) [!].smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1996,
    players: 2,
    rating: 4.6,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3t.jpg"
  },
  {
    title: "Super Street Fighter II",
    description: "The ultimate version of the classic fighting game with all fighters and stages.",
    rom_url: "/roms/Super Street Fighter II - The New Challengers (E) [!].smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1993,
    players: 2,
    rating: 4.7,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rnz.jpg"
  },
  {
    title: "Mega Man X",
    description: "The legendary robot action game that revolutionized the Mega Man series.",
    rom_url: "/roms/Mega Man X (U) (V1.0) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1993,
    players: 1,
    rating: 4.9,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7k.jpg"
  },
  {
    title: "Teenage Mutant Ninja Turtles IV: Turtles in Time",
    description: "Travel through time with the Ninja Turtles in this epic beat 'em up adventure.",
    rom_url: "/roms/Teenage Mutant Ninja Turtles IV - Turtles in Time (U) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1992,
    players: 4,
    rating: 4.8,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r9f.jpg"
  },
  {
    title: "Killer Instinct",
    description: "The brutal fighting game with combo breakers, ultra combos, and intense battles.",
    rom_url: "/roms/Killer Instinct (E) [!].smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1995,
    players: 2,
    rating: 4.4,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r6h.jpg"
  },
  {
    title: "Fatal Fury 2",
    description: "The legendary SNK fighting game with multiple fighting planes and special moves.",
    rom_url: "/roms/Fatal Fury 2 (E) [!].smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1993,
    players: 2,
    rating: 4.3,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r5k.jpg"
  },
  {
    title: "Fatal Fury Special",
    description: "Enhanced version of Fatal Fury 2 with improved gameplay and additional characters.",
    rom_url: "/roms/Fatal Fury Special (E) (61959).smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1994,
    players: 2,
    rating: 4.4,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r5l.jpg"
  },
  {
    title: "Battletoads in Battlemaniacs",
    description: "The tough-as-nails beat 'em up that will test your skills and patience.",
    rom_url: "/roms/Battletoads in Battlemaniacs (U) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1993,
    players: 2,
    rating: 4.2,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3w.jpg"
  },
  {
    title: "Battletoads & Double Dragon",
    description: "The ultimate crossover between two legendary beat 'em up franchises.",
    rom_url: "/roms/Battletoads & Double Dragon - The Ultimate Team (U) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1993,
    players: 2,
    rating: 4.3,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3v.jpg"
  },
  {
    title: "Castlevania: Dracula X",
    description: "Fight against Dracula in this gothic action-platformer with stunning visuals.",
    rom_url: "/roms/Castlevania - Dracula X (U) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1995,
    players: 1,
    rating: 4.6,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r4m.jpg"
  },
  {
    title: "Dragon Ball Z: Super Butouden 2",
    description: "Experience epic Dragon Ball Z battles with your favorite characters.",
    rom_url: "/roms/Dragon Ball Z - Super Butouden 2 (J) (V1.1).smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1993,
    players: 2,
    rating: 4.2,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r55.jpg"
  },
  {
    title: "Goof Troop",
    description: "Join Goofy and Max in this cooperative adventure filled with puzzles and fun.",
    rom_url: "/roms/Goof Troop (E).smc",
    platform: "SNES",
    genre: "Adventure",
    year: 1993,
    players: 2,
    rating: 4.1,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r5t.jpg"
  },
  {
    title: "International Superstar Soccer Deluxe",
    description: "The ultimate soccer simulation with realistic gameplay and international teams.",
    rom_url: "/roms/International Superstar Soccer Deluxe (U).smc",
    platform: "SNES",
    genre: "Sports",
    year: 1995,
    players: 2,
    rating: 4.5,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r6c.jpg"
  },
  {
    title: "Joe & Mac 2: Lost in the Tropics",
    description: "The caveman duo returns in this colorful platform adventure.",
    rom_url: "/roms/Joe & Mac 2 - Lost in the Tropics (U).smc",
    platform: "SNES",
    genre: "Platform",
    year: 1994,
    players: 2,
    rating: 4.0,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r6d.jpg"
  },
  {
    title: "The Magical Quest Starring Mickey Mouse",
    description: "Join Mickey Mouse on a magical adventure to save his friend Pluto.",
    rom_url: "/roms/Magical Quest Starring Mickey Mouse, The (U) [!].smc",
    platform: "SNES",
    genre: "Platform",
    year: 1992,
    players: 1,
    rating: 4.3,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7i.jpg"
  },
  {
    title: "Mighty Morphin Power Rangers",
    description: "Fight as the Power Rangers in this action-packed beat 'em up.",
    rom_url: "/roms/Mighty Morphin Power Rangers (U).smc",
    platform: "SNES",
    genre: "Action",
    year: 1994,
    players: 2,
    rating: 4.0,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7n.jpg"
  },
  {
    title: "Mighty Morphin Power Rangers: The Movie",
    description: "Based on the movie, fight against Ivan Ooze and his army.",
    rom_url: "/roms/Mighty Morphin Power Rangers - The Movie (U).smc",
    platform: "SNES",
    genre: "Action",
    year: 1995,
    players: 2,
    rating: 3.9,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7o.jpg"
  },
  {
    title: "Doom Troopers",
    description: "Fight against the dark forces in this intense run-and-gun shooter.",
    rom_url: "/roms/Mutant Chronicles - Doom Troopers (U) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1995,
    players: 2,
    rating: 4.1,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7q.jpg"
  },
  {
    title: "Prehistorik Man",
    description: "Guide the prehistoric hero through dangerous landscapes filled with enemies.",
    rom_url: "/roms/Prehistorik Man (U) [!].smc",
    platform: "SNES",
    genre: "Platform",
    year: 1995,
    players: 1,
    rating: 4.0,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8s.jpg"
  },
  {
    title: "Sparkster",
    description: "The rocket-powered opossum returns in this fast-paced action platformer.",
    rom_url: "/roms/Sparkster (E).smc",
    platform: "SNES",
    genre: "Platform",
    year: 1994,
    players: 1,
    rating: 4.4,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r9j.jpg"
  },
  {
    title: "Super Double Dragon",
    description: "The Lee brothers return in this enhanced beat 'em up adventure.",
    rom_url: "/roms/Super Double Dragon (U).smc",
    platform: "SNES",
    genre: "Action",
    year: 1992,
    players: 2,
    rating: 4.2,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ra2.jpg"
  },
  {
    title: "Super Star Wars: The Empire Strikes Back",
    description: "Experience the epic Star Wars saga in this action-packed adventure.",
    rom_url: "/roms/Super Star Wars - The Empire Strikes Back (U) (V1.1) [!].smc",
    platform: "SNES",
    genre: "Action",
    year: 1993,
    players: 1,
    rating: 4.5,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1raj.jpg"
  },
  {
    title: "Teenage Mutant Hero Turtles: Tournament Fighters",
    description: "The Ninja Turtles duke it out in this competitive fighting game.",
    rom_url: "/roms/Teenage Mutant Hero Turtles - Tournament Fighters (E).smc",
    platform: "SNES",
    genre: "Fighting",
    year: 1993,
    players: 2,
    rating: 4.3,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r9e.jpg"
  },
  {
    title: "Top Gear",
    description: "Race at high speeds in this thrilling arcade racing game.",
    rom_url: "/roms/Top Gear (U) [!].smc",
    platform: "SNES",
    genre: "Racing",
    year: 1992,
    players: 2,
    rating: 4.3,
    image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb1.jpg"
  }
];

export async function populateGames() {
  try {
    console.log('Starting to populate games...');
    
    // First, check if games already exist
    const { data: existingGames } = await supabase
      .from('games')
      .select('rom_url');
    
    const existingRomUrls = new Set(existingGames?.map(game => game.rom_url) || []);
    
    // Filter out games that already exist
    const newGames = gameData.filter(game => !existingRomUrls.has(game.rom_url));
    
    if (newGames.length === 0) {
      console.log('All games are already in the database');
      return;
    }
    
    console.log(`Adding ${newGames.length} new games...`);
    
    // Add random play counts to make it look realistic
    const gamesWithPlayCounts = newGames.map(game => ({
      ...game,
      play_count: Math.floor(Math.random() * 5000) + 100
    }));
    
    const { data, error } = await supabase
      .from('games')
      .insert(gamesWithPlayCounts)
      .select();
    
    if (error) {
      console.error('Error inserting games:', error);
      throw error;
    }
    
    console.log(`Successfully added ${data?.length || 0} games to the database`);
    return data;
  } catch (error) {
    console.error('Error populating games:', error);
    throw error;
  }
}