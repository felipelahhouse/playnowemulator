import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffmyoutiutemmrmvxzig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbXlvdXRpdXRlbW1ybXZ4emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc0MjAsImV4cCI6MjA3NTQ3MzQyMH0.OY6exjP3UPjccESSsBjoP0ysQBw2Ro9xMHiR1-4fZbI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('🔍 Testando conexão com Supabase...\n');

  // 1. Testar tabela users
  console.log('1️⃣ Verificando tabela USERS:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('❌ Erro na tabela users:', usersError.message);
  } else {
    console.log('✅ Tabela users OK -', users?.length || 0, 'registros encontrados');
  }

  // 2. Testar tabela games
  console.log('\n2️⃣ Verificando tabela GAMES:');
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .limit(1);
  
  if (gamesError) {
    console.error('❌ Erro na tabela games:', gamesError.message);
  } else {
    console.log('✅ Tabela games OK -', games?.length || 0, 'jogos encontrados');
  }

  // 3. Testar tabela game_sessions
  console.log('\n3️⃣ Verificando tabela GAME_SESSIONS:');
  const { data: sessions, error: sessionsError } = await supabase
    .from('game_sessions')
    .select('*')
    .limit(1);
  
  if (sessionsError) {
    console.error('❌ Erro na tabela game_sessions:', sessionsError.message);
  } else {
    console.log('✅ Tabela game_sessions OK -', sessions?.length || 0, 'sessões encontradas');
  }

  // 4. Testar autenticação
  console.log('\n4️⃣ Verificando AUTH:');
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('✅ Usuário logado:', session.user.email);
  } else {
    console.log('ℹ️  Nenhum usuário logado (normal)');
  }

  console.log('\n✨ Teste finalizado!');
}

testSupabase().catch(console.error);
