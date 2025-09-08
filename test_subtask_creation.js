const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseKey = 'SUA_CHAVE_DO_SUPABASE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubtaskCreation() {
  console.log('=== TESTE DE CRIAÇÃO DE SUBTAREFA ===');
  
  try {
    // Teste 1: Verificar se a tabela existe
    console.log('1. Verificando se a tabela subtasks existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('subtasks')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela subtasks:', tableError);
      return;
    }
    
    console.log('✅ Tabela subtasks acessível');
    
    // Teste 2: Tentar criar uma subtarefa
    console.log('2. Tentando criar uma subtarefa...');
    const testSubtask = {
      card_id: 'test-card-123',
      title: 'Subtarefa de Teste',
      description: 'Esta é uma subtarefa de teste',
      status: 'pending',
      priority: 'medium',
      importance: 'normal',
      category: 'Teste',
      due_date: null,
      estimated_time: '0',
      actual_time: '0',
      tags: [],
      completed: false,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Dados da subtarefa:', testSubtask);
    
    const { data: createdSubtask, error: createError } = await supabase
      .from('subtasks')
      .insert([testSubtask])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar subtarefa:', createError);
      console.error('Detalhes do erro:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
      return;
    }
    
    console.log('✅ Subtarefa criada com sucesso:', createdSubtask);
    
    // Teste 3: Verificar se foi salva
    console.log('3. Verificando se a subtarefa foi salva...');
    const { data: savedSubtask, error: fetchError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', createdSubtask.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Erro ao buscar subtarefa criada:', fetchError);
      return;
    }
    
    console.log('✅ Subtarefa encontrada no banco:', savedSubtask);
    
    // Teste 4: Limpar dados de teste
    console.log('4. Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', createdSubtask.id);
    
    if (deleteError) {
      console.error('⚠️ Erro ao limpar dados de teste:', deleteError);
    } else {
      console.log('✅ Dados de teste limpos');
    }
    
    console.log('=== TESTE CONCLUÍDO COM SUCESSO ===');
    
  } catch (error) {
    console.error('❌ Erro inesperado durante o teste:', error);
  }
}

// Executar o teste
testSubtaskCreation();
