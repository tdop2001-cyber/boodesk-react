// Teste de conexão com Supabase para deploy
const { createClient } = require('@supabase/supabase-js');

// Credenciais do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('\n1️⃣ Testando conexão básica...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    
    // Teste 2: Verificar se usuário admin existe
    console.log('\n2️⃣ Verificando usuário admin...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();
    
    if (adminError) {
      console.log('❌ Erro ao buscar usuário admin:', adminError.message);
      return false;
    }
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado!');
      return false;
    }
    
    console.log('✅ Usuário admin encontrado:', {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      is_active: adminUser.is_active
    });
    
    // Teste 3: Verificar se usuário thalles existe
    console.log('\n3️⃣ Verificando usuário thalles...');
    const { data: thallesUser, error: thallesError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'thalles')
      .single();
    
    if (thallesError) {
      console.log('❌ Erro ao buscar usuário thalles:', thallesError.message);
      return false;
    }
    
    if (!thallesUser) {
      console.log('❌ Usuário thalles não encontrado!');
      return false;
    }
    
    console.log('✅ Usuário thalles encontrado:', {
      id: thallesUser.id,
      username: thallesUser.username,
      role: thallesUser.role,
      is_active: thallesUser.is_active
    });
    
    // Teste 4: Listar todos os usuários
    console.log('\n4️⃣ Listando todos os usuários...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, username, role, is_active')
      .order('id');
    
    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message);
      return false;
    }
    
    console.log('✅ Usuários encontrados:');
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - Ativo: ${user.is_active}`);
    });
    
    console.log('\n🎉 Todos os testes passaram! Supabase está funcionando corretamente.');
    return true;
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    return false;
  }
}

// Executar teste
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ Supabase está funcionando! O problema pode estar no deploy.');
    console.log('💡 Verifique se as variáveis de ambiente estão configuradas no deploy.');
  } else {
    console.log('\n❌ Problema com Supabase! Verifique as credenciais.');
  }
});
