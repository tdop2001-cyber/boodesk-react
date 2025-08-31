const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCardsTable() {
  console.log('🔍 Testando tabela cards...\n');

  try {
    // 1. Verificar se a tabela boards existe
    console.log('1. Verificando tabela boards...');
    const { data: boardsInfo, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .limit(1);

    if (boardsError) {
      console.error('❌ Erro ao acessar tabela boards:', boardsError);
      return;
    }

    console.log('✅ Tabela boards existe e é acessível');

    // 2. Criar um board de teste
    console.log('\n2. Criando board de teste...');
    const testBoard = {
      board_id: `test-board-${Date.now()}`,
      name: 'Board de Teste',
      description: 'Board para testar criação de cards',
      owner_id: 1,
      color: '#3B82F6'
    };

    const { data: createdBoard, error: boardCreateError } = await supabase
      .from('boards')
      .insert([testBoard])
      .select()
      .single();

    if (boardCreateError) {
      console.error('❌ Erro ao criar board:', boardCreateError);
      return;
    }

    console.log('✅ Board criado com sucesso:', createdBoard);

    // 3. Verificar se a tabela cards existe
    console.log('\n3. Verificando estrutura da tabela cards...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('cards')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela cards:', tableError);
      return;
    }

    console.log('✅ Tabela cards existe e é acessível');

    // 4. Tentar criar um card de teste
    console.log('\n4. Tentando criar um card de teste...');
    
    const testCard = {
      card_id: `test-card-${Date.now()}`,
      board_id: createdBoard.board_id, // Usar o board_id do board criado
      list_name: 'A Fazer',
      title: 'Card de Teste',
      description: 'Este é um card de teste para verificar a funcionalidade',
      status: 'todo',
      importance: 'medium',
      due_date: null,
      subject: 'Teste',
      goal: 'Verificar criação de cards',
      members: [],
      git_branch: '',
      git_commit: '',
      history: [],
      dependencies: [],
      recurrence: 'Nenhuma',
      user_id: 1
    };

    const { data: createdCard, error: createError } = await supabase
      .from('cards')
      .insert([testCard])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar card:', createError);
      console.log('Detalhes do erro:', createError.message);
      console.log('Código do erro:', createError.code);
      console.log('Detalhes:', createError.details);
      return;
    }

    console.log('✅ Card criado com sucesso!');
    console.log('Card criado:', createdCard);

    // 5. Verificar se o card foi realmente criado
    console.log('\n5. Verificando se o card foi salvo...');
    const { data: retrievedCard, error: retrieveError } = await supabase
      .from('cards')
      .select('*')
      .eq('card_id', testCard.card_id)
      .single();

    if (retrieveError) {
      console.error('❌ Erro ao recuperar card:', retrieveError);
      return;
    }

    console.log('✅ Card recuperado com sucesso:', retrievedCard);

    // 6. Limpar os dados de teste
    console.log('\n6. Limpando dados de teste...');
    
    // Deletar o card primeiro
    const { error: deleteCardError } = await supabase
      .from('cards')
      .delete()
      .eq('card_id', testCard.card_id);

    if (deleteCardError) {
      console.error('❌ Erro ao deletar card de teste:', deleteCardError);
    } else {
      console.log('✅ Card de teste removido');
    }

    // Deletar o board
    const { error: deleteBoardError } = await supabase
      .from('boards')
      .delete()
      .eq('board_id', testBoard.board_id);

    if (deleteBoardError) {
      console.error('❌ Erro ao deletar board de teste:', deleteBoardError);
    } else {
      console.log('✅ Board de teste removido');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testCardsTable();
