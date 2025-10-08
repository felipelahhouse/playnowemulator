import { supabase } from '../contexts/AuthContext';

const streamData = [
  {
    streamer_id: '00000000-0000-0000-0000-000000000001',
    game_id: '00000000-0000-0000-0000-000000000001',
    title: "🔥 EPIC Super Mario World Speedrun - Going for World Record!",
    description: "Attempting to break the any% world record on Super Mario World! Chat commands: !pb !wr !route",
    viewer_count: 1247,
    is_live: true,
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rpe.jpg"
  },
  {
    streamer_id: '00000000-0000-0000-0000-000000000002',
    game_id: '00000000-0000-0000-0000-000000000002',
    title: "🏁 Mario Kart Championship Night - Racing with Viewers!",
    description: "Join the championship races! Type !join to get in the next race. Custom tracks and crazy battles!",
    viewer_count: 892,
    is_live: true,
    started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vm4.jpg"
  },
  {
    streamer_id: '00000000-0000-0000-0000-000000000003',
    game_id: '00000000-0000-0000-0000-000000000003',
    title: "🦍 Donkey Kong Country 100% - Collecting Everything!",
    description: "Going for 100% completion! Finding all bonus rooms and KONG letters. Chill vibes guaranteed.",
    viewer_count: 456,
    is_live: true,
    started_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rqd.jpg"
  },
  {
    streamer_id: '00000000-0000-0000-0000-000000000004',
    game_id: '00000000-0000-0000-0000-000000000004',
    title: "⚔️ Street Fighter Alpha 2 Tournament - Road to Evo!",
    description: "Training for upcoming tournament! Learning new combos and matchups. Taking viewer challenges!",
    viewer_count: 723,
    is_live: true,
    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3t.jpg"
  },
  {
    streamer_id: '00000000-0000-0000-0000-000000000005',
    game_id: '00000000-0000-0000-0000-000000000005',
    title: "🤖 Mega Man X No Death Run - Hardcore Challenge!",
    description: "Attempting to beat Mega Man X without dying! One death = start over. This is attempt #47!",
    viewer_count: 634,
    is_live: true,
    started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7k.jpg"
  },
  {
    streamer_id: '00000000-0000-0000-0000-000000000006',
    game_id: '00000000-0000-0000-0000-000000000006',
    title: "🐢 TMNT IV Co-op Madness - 4 Player Chaos!",
    description: "Four players, unlimited continues, maximum chaos! Playing through the entire game with friends.",
    viewer_count: 1103,
    is_live: true,
    started_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1 hour 15 minutes ago
    thumbnail_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r9f.jpg"
  }
];

const streamerData = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'SpeedyMario',
    email: 'speedymario@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'KartMaster',
    email: 'kartmaster@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'DKGamer',
    email: 'dkgamer@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'FightClubPro',
    email: 'fightclub@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'MegaManFan',
    email: 'megaman@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    username: 'TurtlePower',
    email: 'turtlepower@example.com',
    avatar_url: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function populateStreams() {
  try {
    console.log('Starting to populate live streams...');
    
    // First, check if streams already exist
    const { data: existingStreams } = await supabase
      .from('live_streams')
      .select('title');
    
    if (existingStreams && existingStreams.length > 0) {
      console.log('Live streams already exist in the database');
      return existingStreams;
    }
    
    // Insert demo streamers first
    console.log('Adding demo streamers...');
    
    const { error: streamersError } = await supabase
      .from('users')
      .upsert(streamerData, { onConflict: 'id' });
    
    if (streamersError) {
      console.error('Error inserting streamers:', streamersError);
      // Continue anyway, they might already exist
    }
    
    // Get some games from the database to use as stream games
    const { data: games } = await supabase
      .from('games')
      .select('id, title')
      .limit(6);
    
    if (!games || games.length === 0) {
      throw new Error('No games found in database. Please populate games first.');
    }
    
    // Map stream data to actual game IDs
    const streamsWithGameIds = streamData.map((stream, index) => ({
      ...stream,
      game_id: games[index % games.length].id
    }));
    
    console.log('Adding live streams...');
    
    const { data, error } = await supabase
      .from('live_streams')
      .insert(streamsWithGameIds)
      .select();
    
    if (error) {
      console.error('Error inserting streams:', error);
      throw error;
    }
    
    console.log(`Successfully added ${data?.length || 0} live streams to the database`);
    return data;
  } catch (error) {
    console.error('Error populating streams:', error);
    throw error;
  }
}

// Generate some chat messages for the streams
export async function populateChatMessages() {
  try {
    console.log('Adding sample chat messages...');
    
    const { data: streams } = await supabase
      .from('live_streams')
      .select('id')
      .eq('is_live', true);
    
    if (!streams || streams.length === 0) {
      console.log('No live streams found for chat messages');
      return;
    }
    
    const sampleMessages = [
      "This is incredible gameplay! 🔥",
      "How did you do that combo?",
      "First time watching, this is amazing!",
      "That was so close!",
      "Best streamer on the platform!",
      "Can you do a tutorial on that?",
      "Speedrun looking good 👍",
      "Chat spam incoming lol",
      "That boss fight was epic!",
      "New follower here! 💜",
      "World record pace?",
      "RIP that was close",
      "Poggers gameplay",
      "How long have you been playing?",
      "That music is so nostalgic"
    ];
    
    const chatMessages = [];
    
    for (const stream of streams) {
      // Add 3-8 random messages per stream
      const messageCount = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < messageCount; i++) {
        chatMessages.push({
          stream_id: stream.id,
          user_id: streamerData[Math.floor(Math.random() * streamerData.length)].id,
          message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          created_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() // Random time in last hour
        });
      }
    }
    
    const { error } = await supabase
      .from('stream_chat')
      .insert(chatMessages);
    
    if (error) {
      console.error('Error inserting chat messages:', error);
    } else {
      console.log(`Added ${chatMessages.length} sample chat messages`);
    }
  } catch (error) {
    console.error('Error populating chat messages:', error);
  }
}