const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBoardCards() {
  console.log('=== TESTANDO CARDS DO BOARD "aaa" ===');
  
  try {
    // 1. Buscar o board "aaa"
    console.log('1. Buscando board "aaa"...');
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .eq('name', 'aaa');
    
    if (boardsError) {
      console.error('❌ Erro ao buscar board:', boardsError);
      return;
    }
    
    if (!boards || boards.length === 0) {
      console.error('❌ Board "aaa" não encontrado');
      return;
    }
    
    const boardAaa = boards[0];
    console.log('Board "aaa" encontrado:', boardAaa);
    
    // 2. Buscar cards do board "aaa"
    console.log('\n2. Buscando cards do board "aaa"...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardAaa.board_id)
      .eq('is_archived', false)
      .order('created_at');
    
    if (cardsError) {
      console.error('❌ Erro ao buscar cards:', cardsError);
      return;
    }
    
    console.log('Cards do board "aaa" encontrados:', cards);
    console.log('Total de cards:', cards.length);
    
    // 3. Verificar se os cards "hhhh" e "Opa" estão lá
    const cardHhhh = cards.find(card => card.title === 'hhhh');
    const cardOpa = cards.find(card => card.title === 'Opa');
    
    console.log('\n3. Verificando cards específicos:');
    console.log('Card "hhhh" encontrado:', cardHhhh ? '✅' : '❌');
    console.log('Card "Opa" encontrado:', cardOpa ? '✅' : '❌');
    
    // 4. Buscar colunas do board "aaa"
    console.log('\n4. Buscando colunas do board "aaa"...');
    const { data: columns, error: columnsError } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardAaa.board_id)
      .order('position');
    
    if (columnsError) {
      console.error('❌ Erro ao buscar colunas:', columnsError);
      return;
    }
    
    console.log('Colunas do board "aaa":', columns);
    
    // 5. Simular o mapeamento que a aplicação React faz
    console.log('\n5. Simulando mapeamento da aplicação React...');
    
    const mappedCards = cards.map(card => {
      // Função para obter ID da coluna pelo nome (como na aplicação React)
      const getColumnIdFromName = (columnName) => {
        const column = columns.find(col => col.name === columnName);
        return column?.id || 1;
      };
      
      const columnId = getColumnIdFromName(card.list_name) || 1;
      
      return {
        id: card.id,
        board_id: boardAaa.id, // Usar board.id (número) em vez de board.board_id (string)
        column_id: columnId,
        title: card.title,
        description: card.description,
        priority: card.importance,
        status: card.status,
        created_by: card.user_id || 1,
        created_at: card.created_at,
        updated_at: card.updated_at,
        due_date: card.due_date
      };
    });
    
    console.log('Cards mapeados:', mappedCards);
    
    // 6. Aplicar o filtro que a aplicação React usa
    console.log('\n6. Aplicando filtro da aplicação React...');
    const filteredCards = mappedCards.filter(card => card.board_id === boardAaa.id);
    console.log('Cards após filtro:', filteredCards);
    console.log('Total após filtro:', filteredCards.length);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testBoardCards();
