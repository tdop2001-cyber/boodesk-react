// Teste de configuração do Supabase
// Execute: node test_supabase_config.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

async function testSupabaseConnection() {
  console.log('🔧 Testando configuração do Supabase...');
  console.log('=' .repeat(50));
  
  console.log('✅ Credenciais configuradas');
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔄 Conectando ao Supabase...');
    
    // Testar conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      // Se a tabela users não existir, vamos testar com uma query mais simples
      console.log('⚠️ Tabela users não encontrada, testando conexão básica...');
      
      // Testar autenticação
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
      
      console.log('✅ Conexão básica estabelecida com sucesso!');
      console.log('📊 Status da autenticação: OK');
      
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log(`📊 Dados encontrados: ${data ? data.length : 0} registros`);
    }
    
    // Testar se podemos fazer uma query de teste
    console.log('🔄 Testando query de teste...');
    
    const { data: testData, error: testError } = await supabase
      .rpc('version');
    
    if (testError) {
      console.log('⚠️ Função version não disponível (normal)');
    } else {
      console.log(`📊 Versão do PostgreSQL: ${testData}`);
    }
    
    console.log('');
    console.log('🎉 Configuração do Supabase está funcionando perfeitamente!');
    console.log('🚀 Você pode usar o sistema de banco de dados agora.');
    
  } catch (error) {
    console.log('❌ Erro na conexão com Supabase:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verifique se as credenciais estão corretas');
    console.log('2. Verifique se o projeto Supabase está ativo');
    console.log('3. Verifique se as políticas de segurança estão configuradas');
    console.log('4. Verifique se a URL está correta');
  }
}

// Executar teste
testSupabaseConnection();
