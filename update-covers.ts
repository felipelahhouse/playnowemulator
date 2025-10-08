import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateGameCovers() {
  console.log('🎮 Atualizando capas dos jogos...');

  const updates = [
    { title: 'Aladdin', cover: '/aladdinsnes.jpg' },
    { title: 'Donkey Kong Country', cover: '/Donkey_Kong_Country_SNES_cover.png' },
    { title: 'Super Mario World', cover: '/Super_Mario_World_Coverart.png' },
  ];

  for (const update of updates) {
    try {
      // Buscar jogos com título similar
      const { data: games, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .ilike('title', `%${update.title}%`);

      if (fetchError) {
        console.error(`❌ Erro ao buscar ${update.title}:`, fetchError);
        continue;
      }

      if (!games || games.length === 0) {
        console.log(`⚠️  Nenhum jogo encontrado para: ${update.title}`);
        continue;
      }

      // Atualizar cada jogo encontrado
      for (const game of games) {
        const { error: updateError } = await supabase
          .from('games')
          .update({ image_url: update.cover })
          .eq('id', game.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${game.title}:`, updateError);
        } else {
          console.log(`✅ Capa atualizada: ${game.title} -> ${update.cover}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erro geral ao processar ${update.title}:`, error);
    }
  }

  console.log('🎉 Atualização concluída!');
}

updateGameCovers();
