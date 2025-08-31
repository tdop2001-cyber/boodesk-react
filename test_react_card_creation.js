const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReactCardCreation() {
  console.log('=== TESTANDO CRIAÇÃO DE CARD COMO NA APLICAÇÃO REACT ===');
  
  try {
    // 1. Buscar boards existentes
    console.log('1. Buscando boards...');
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .limit(5);
    
    if (boardsError) {
      console.error('❌ Erro ao buscar boards:', boardsError);
      return;
    }
    
    console.log('Boards encontrados:', boards);
    
    if (!boards || boards.length === 0) {
      console.error('❌ Nenhum board encontrado');
      return;
    }
    
    const currentBoard = boards[0];
    console.log('Usando board:', currentBoard);
    
    // 2. Buscar colunas do board
    console.log('\n2. Buscando colunas do board...');
    let { data: columns, error: columnsError } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', currentBoard.board_id)
      .order('position');
    
    if (columnsError) {
      console.error('❌ Erro ao buscar colunas:', columnsError);
      return;
    }
    
    console.log('Colunas encontradas:', columns);
    
    // Se não há colunas, criar colunas padrão
    if (!columns || columns.length === 0) {
      console.log('Criando colunas padrão...');
      const defaultColumns = [
        { name: 'A Fazer', position: 1 },
        { name: 'Em Progresso', position: 2 },
        { name: 'Concluído', position: 3 }
      ];
      
      for (const col of defaultColumns) {
        const { data: createdColumn, error: createColError } = await supabase
          .from('lists')
          .insert([{
            list_id: `list-${Date.now()}-${col.position}`,
            board_id: currentBoard.board_id,
            name: col.name,
            position: col.position
          }])
          .select()
          .single();
        
        if (createColError) {
          console.error('❌ Erro ao criar coluna:', createColError);
        } else {
          console.log('✅ Coluna criada:', createdColumn);
        }
      }
      
      // Buscar colunas novamente
      const { data: newColumns, error: newColumnsError } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', currentBoard.board_id)
        .order('position');
      
      if (newColumnsError) {
        console.error('❌ Erro ao buscar colunas após criação:', newColumnsError);
        return;
      }
      
      columns = newColumns;
      console.log('Colunas após criação:', columns);
    }
    
    // 3. Simular criação de card como na aplicação React
    console.log('\n3. Simulando criação de card...');
    
    // Função para obter nome da coluna (como na aplicação React)
    const getColumnName = (columnId) => {
      const column = columns.find(col => col.id === columnId);
      return column?.name || 'A Fazer';
    };
    
    // Função para obter status da coluna (como na aplicação React)
    const getStatusFromColumn = (columnId) => {
      const column = columns.find(col => col.id === columnId);
      switch (column?.name) {
        case 'A Fazer': return 'todo';
        case 'Em Progresso': return 'progress';
        case 'Em Revisão': return 'progress';
        case 'Concluído': return 'done';
        default: return 'todo';
      }
    };
    
    const columnId = 1; // Primeira coluna
    const columnName = getColumnName(columnId);
    const status = getStatusFromColumn(columnId);
    
    console.log('columnId:', columnId);
    console.log('columnName:', columnName);
    console.log('status:', status);
    
    // Criar card com os mesmos dados da aplicação React (sem list_id)
    const cardData = {
      card_id: `card-${Date.now()}`,
      board_id: currentBoard.board_id,
      list_name: columnName,
      title: 'Card de Teste React',
      description: 'Este é um card criado como na aplicação React',
      status: status,
      importance: 'medium',
      due_date: undefined,
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
    
    console.log('Dados do card a ser criado:', cardData);
    
    const { data: createdCard, error: createError } = await supabase
      .from('cards')
      .insert([cardData])
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
      
      // 4. Testar busca de cards do board (como na aplicação React)
      console.log('\n4. Testando busca de cards do board...');
      const { data: boardCards, error: boardCardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', currentBoard.board_id)
        .eq('is_archived', false)
        .order('created_at');
      
      if (boardCardsError) {
        console.error('❌ Erro ao buscar cards do board:', boardCardsError);
      } else {
        console.log('✅ Cards do board encontrados:', boardCards);
        console.log('Total de cards:', boardCards.length);
      }
      
      // 5. Limpar card de teste
      console.log('\n5. Limpando card de teste...');
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('card_id', cardData.card_id);
      
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

testReactCardCreation();
