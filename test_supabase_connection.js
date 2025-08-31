const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('=== TESTANDO CONEXÃO COM SUPABASE ===');
  
  try {
    // Testar conexão básica
    console.log('1. Testando conexão básica...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se as tabelas existem
    console.log('\n2. Verificando tabelas...');
    
    // Testar tabela boards
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .limit(5);
    
    if (boardsError) {
      console.error('❌ Erro ao acessar tabela boards:', boardsError);
    } else {
      console.log('✅ Tabela boards acessível');
      console.log('Boards encontrados:', boards);
    }
    
    // Testar tabela cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .limit(5);
    
    if (cardsError) {
      console.error('❌ Erro ao acessar tabela cards:', cardsError);
    } else {
      console.log('✅ Tabela cards acessível');
      console.log('Cards encontrados:', cards);
    }
    
    // Se não há boards, criar um board de teste
    if (!boards || boards.length === 0) {
      console.log('\n3. Criando board de teste...');
      const testBoard = {
        board_id: `test-board-${Date.now()}`,
        name: 'Board de Teste',
        description: 'Board para testar criação de cards',
        owner_id: 1,
        color: '#3B82F6'
      };
      
      const { data: createdBoard, error: createBoardError } = await supabase
        .from('boards')
        .insert([testBoard])
        .select()
        .single();
      
      if (createBoardError) {
        console.error('❌ Erro ao criar board:', createBoardError);
        return;
      } else {
        console.log('✅ Board criado:', createdBoard);
        boards.push(createdBoard);
      }
    }
    
    // Usar o primeiro board disponível
    const boardToUse = boards[0];
    console.log('\n4. Usando board:', boardToUse);
    
    // Testar criação de um card
    console.log('\n5. Testando criação de card...');
    
    const testCard = {
      card_id: `test-card-${Date.now()}`,
      board_id: boardToUse.board_id, // Usar board_id válido
      list_name: 'A Fazer',
      title: 'Card de Teste',
      description: 'Este é um card de teste',
      status: 'todo',
      importance: 'medium',
      subject: '-',
      goal: '-',
      members: [],
      creation_date: new Date().toISOString(),
      is_archived: false,
      git_branch: '',
      git_commit: '',
      history: [],
      dependencies: [],
      recurrence: 'Nenhuma',
      user_id: 1
    };
    
    console.log('Dados do card a ser criado:', testCard);
    
    const { data: createdCard, error: createError } = await supabase
      .from('cards')
      .insert([testCard])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar card:', createError);
      console.error('Detalhes do erro:', {
        message: createError.message,
        code: createError.code,
        details: createError.details
      });
    } else {
      console.log('✅ Card criado com sucesso:', createdCard);
      
      // Testar busca do card criado
      console.log('\n6. Testando busca do card criado...');
      const { data: foundCard, error: findError } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', testCard.card_id)
        .single();
      
      if (findError) {
        console.error('❌ Erro ao buscar card:', findError);
      } else {
        console.log('✅ Card encontrado:', foundCard);
      }
      
      // Testar busca de cards por board_id
      console.log('\n7. Testando busca de cards por board_id...');
      const { data: boardCards, error: boardCardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardToUse.board_id)
        .eq('is_archived', false);
      
      if (boardCardsError) {
        console.error('❌ Erro ao buscar cards do board:', boardCardsError);
      } else {
        console.log('✅ Cards do board encontrados:', boardCards);
      }
      
      // Limpar card de teste
      console.log('\n8. Limpando card de teste...');
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('card_id', testCard.card_id);
      
      if (deleteError) {
        console.error('❌ Erro ao deletar card de teste:', deleteError);
      } else {
        console.log('✅ Card de teste removido');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSupabaseConnection();
