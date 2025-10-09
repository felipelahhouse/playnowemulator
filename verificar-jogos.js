import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffmyoutiutemmrmvxzig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbXlvdXRpdXRlbW1ybXZ4emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc0MjAsImV4cCI6MjA3NTQ3MzQyMH0.OY6exjP3UPjccESSsBjoP0ysQBw2Ro9xMHiR1-4fZbI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarJogos() {
  console.log('🔍 VERIFICANDO JOGOS NO BANCO...\n');

  // 1. Contar jogos
  const { count, error: countError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ ERRO ao contar jogos:', countError.message);
    console.error('   Código:', countError.code);
    console.error('   Detalhes:', countError.details);
    
    if (countError.code === '42P01') {
      console.error('\n⚠️  A TABELA "games" NÃO EXISTE!');
      console.error('   Você precisa aplicar: RESET_DATABASE_COMPLETO.sql');
    }
    return;
  }

  console.log(`📊 Total de jogos no banco: ${count || 0}`);

  if (count === 0) {
    console.log('\n⚠️  A TABELA ESTÁ VAZIA!');
    console.log('   Você precisa aplicar: INSERIR_JOGOS.sql');
    return;
  }

  // 2. Listar jogos
  console.log('\n🎮 JOGOS ENCONTRADOS:\n');
  
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('title, platform, year, genre, rom_url')
    .order('title');

  if (gamesError) {
    console.error('❌ Erro ao buscar jogos:', gamesError.message);
    return;
  }

  games?.forEach((game, index) => {
    console.log(`${index + 1}. ${game.title}`);
    console.log(`   Platform: ${game.platform} | Year: ${game.year} | Genre: ${game.genre}`);
    console.log(`   ROM: ${game.rom_url}`);
    console.log('');
  });

  console.log(`✅ ${count} jogos configurados corretamente!\n`);
}

verificarJogos();
