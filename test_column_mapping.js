const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumnMapping() {
  console.log('=== TESTANDO MAPEAMENTO DE COLUNAS ===');
  
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
    
    // 2. Buscar colunas do board "aaa"
    console.log('\n2. Buscando colunas do board "aaa"...');
    const { data: columns, error: columnsError } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardAaa.board_id)
      .order('position');
    
    if (columnsError) {
      console.error('❌ Erro ao buscar colunas:', columnsError);
      return;
    }
    
    console.log('Colunas encontradas:', columns);
    
    // 3. Buscar cards do board "aaa"
    console.log('\n3. Buscando cards do board "aaa"...');
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
    
    console.log('Cards encontrados:', cards);
    
    // 4. Simular a função getColumnIdFromName da aplicação React
    console.log('\n4. Testando função getColumnIdFromName...');
    
    const getColumnIdFromName = (columnName) => {
      const column = columns.find(col => col.name === columnName);
      return column?.id || 1;
    };
    
    // Testar para cada card
    cards.forEach(card => {
      const columnId = getColumnIdFromName(card.list_name);
      console.log(`Card "${card.title}" (list_name: "${card.list_name}") -> column_id: ${columnId}`);
      
      // Verificar se a coluna existe
      const column = columns.find(col => col.id === columnId);
      if (column) {
        console.log(`  ✅ Coluna encontrada: "${column.name}" (ID: ${column.id})`);
      } else {
        console.log(`  ❌ Coluna não encontrada para ID: ${columnId}`);
      }
    });
    
    // 5. Simular o mapeamento completo da aplicação React
    console.log('\n5. Simulando mapeamento completo...');
    
    const mappedCards = cards.map(card => {
      const columnId = getColumnIdFromName(card.list_name) || 1;
      
      return {
        id: card.id,
        board_id: boardAaa.id, // Usar board.id (número)
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
    
    // 6. Aplicar filtros da aplicação React
    console.log('\n6. Aplicando filtros da aplicação React...');
    
    // Filtro por board (como na aplicação React)
    const boardCards = mappedCards.filter(card => card.board_id === boardAaa.id);
    console.log('Cards após filtro por board:', boardCards);
    
    // Filtro por coluna (como na aplicação React)
    columns.forEach(column => {
      const columnCards = boardCards.filter(card => card.column_id === column.id);
      console.log(`Coluna "${column.name}" (ID: ${column.id}): ${columnCards.length} cards`);
      columnCards.forEach(card => {
        console.log(`  - "${card.title}"`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testColumnMapping();
