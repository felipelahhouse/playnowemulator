import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffmyoutiutemmrmvxzig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbXlvdXRpdXRlbW1ybXZ4emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTc0MjAsImV4cCI6MjA3NTQ3MzQyMH0.OY6exjP3UPjccESSsBjoP0ysQBw2Ro9xMHiR1-4fZbI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🧪 TESTE COMPLETO DE AUTENTICAÇÃO\n');

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `testuser${Date.now()}`;

  try {
    // 1. CRIAR CONTA
    console.log('1️⃣ Testando CRIAÇÃO DE CONTA...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { username: testUsername },
        emailRedirectTo: undefined
      }
    });

    if (signUpError) {
      console.error('❌ ERRO ao criar conta:', signUpError.message);
      console.error('Detalhes:', signUpError);
      return;
    }

    console.log('✅ Conta criada com sucesso!');
    console.log('   Email:', testEmail);
    console.log('   User ID:', signUpData.user?.id);

    // 2. VERIFICAR SE PERFIL FOI CRIADO
    console.log('\n2️⃣ Verificando se PERFIL foi criado na tabela users...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user?.id)
      .single();

    if (profileError) {
      console.error('❌ ERRO ao buscar perfil:', profileError.message);
      console.error('   Código:', profileError.code);
      console.error('   Detalhes:', profileError.details);
      
      // Tentar criar perfil manualmente
      console.log('\n   Tentando criar perfil manualmente...');
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user?.id,
          email: testEmail,
          username: testUsername,
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('   ❌ ERRO ao inserir perfil:', insertError.message);
        console.error('      Código:', insertError.code);
        console.error('      Detalhes:', insertError.details);
        console.error('      Hint:', insertError.hint);
      } else {
        console.log('   ✅ Perfil criado manualmente!');
        console.log('      Username:', newProfile.username);
      }
    } else {
      console.log('✅ Perfil encontrado!');
      console.log('   Username:', profile.username);
      console.log('   Email:', profile.email);
    }

    // 3. FAZER LOGOUT
    console.log('\n3️⃣ Fazendo LOGOUT...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ ERRO ao fazer logout:', signOutError.message);
    } else {
      console.log('✅ Logout realizado!');
    }

    // 4. FAZER LOGIN
    console.log('\n4️⃣ Testando LOGIN com a conta criada...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.error('❌ ERRO ao fazer login:', signInError.message);
      console.error('Detalhes:', signInError);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('   User ID:', signInData.user?.id);

    // 5. BUSCAR PERFIL APÓS LOGIN
    console.log('\n5️⃣ Buscando PERFIL após login...');
    const { data: profileAfterLogin, error: profileAfterLoginError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    if (profileAfterLoginError) {
      console.error('❌ ERRO ao buscar perfil após login:', profileAfterLoginError.message);
    } else {
      console.log('✅ Perfil carregado!');
      console.log('   Username:', profileAfterLogin.username);
      console.log('   Email:', profileAfterLogin.email);
      console.log('   Online:', profileAfterLogin.is_online);
    }

    // 6. LIMPAR (opcional - deletar usuário de teste)
    console.log('\n6️⃣ Limpando usuário de teste...');
    await supabase.from('users').delete().eq('id', signInData.user?.id);
    console.log('✅ Usuário de teste removido!');

  } catch (error) {
    console.error('\n💥 ERRO GERAL:', error);
  }

  console.log('\n✨ TESTE FINALIZADO!\n');
}

testAuthFlow();
