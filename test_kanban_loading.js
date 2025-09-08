/**
 * Script de teste para verificar o carregamento do Kanban
 * Simula exatamente o que acontece no código real
 */

// Simular dados do banco
const mockDatabaseData = {
  boards: [
    { id: 1, board_id: 'board-1', name: 'aaaa' },
    { id: 2, board_id: 'board-2', name: 'Desenvolvimento de Software' }
  ],
  columns: [
    { id: 1, board_id: 'board-1', name: 'A Fazer', position: 1 },
    { id: 2, board_id: 'board-1', name: 'Em Progresso', position: 2 },
    { id: 3, board_id: 'board-1', name: 'Concluído', position: 3 }
  ],
  cards: [
    { id: 1, board_id: 'board-1', list_name: 'A Fazer', title: 'Tarefa 1', status: 'todo', importance: 'medium' },
    { id: 2, board_id: 'board-1', list_name: 'Em Progresso', title: 'Tarefa 2', status: 'progress', importance: 'high' },
    { id: 3, board_id: 'board-1', list_name: 'Concluído', title: 'Tarefa 3', status: 'done', importance: 'low' }
  ]
};

// Simular função de carregamento do board
async function simulateLoadBoardData(board) {
  console.log('=== INICIANDO CARREGAMENTO DO BOARD ===');
  console.log('Board:', board.name);
  console.log('Board ID:', board.id);
  console.log('Board Board ID:', board.board_id);
  
  // Verificar se board_id existe
  if (!board.board_id) {
    console.error('Board ID não encontrado para:', board.name);
    return { columns: [], cards: [] };
  }
  
  // Carregar listas/colunas para o board
  const listsData = mockDatabaseData.columns.filter(col => col.board_id === board.board_id);
  console.log('=== CARREGANDO COLUNAS ===');
  console.log('listsData do banco:', listsData);
  console.log('Quantidade de listas encontradas:', listsData.length);
  
  const mappedColumns = listsData.map(list => ({
    id: list.id,
    board_id: board.id, // IMPORTANTE: Usar board.id (number) aqui
    name: list.name,
    order: list.position,
    color: '#E5E7EB',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  console.log('mappedColumns:', mappedColumns);
  
  // Carregar cards para o board
  const boardIdForCards = String(board.board_id || board.id);
  console.log('=== CARREGANDO CARDS ===');
  console.log('board.board_id:', board.board_id);
  console.log('board.id:', board.id);
  console.log('boardIdForCards:', boardIdForCards);
  
  const cardsData = mockDatabaseData.cards.filter(card => card.board_id === board.board_id);
  console.log('cardsData do banco:', cardsData);
  console.log('Quantidade de cards encontrados:', cardsData.length);
  
  // Função auxiliar para obter ID da coluna pelo nome
  const getColumnIdFromNameLocal = (columnName) => {
    const column = mappedColumns.find(col => col.name === columnName);
    if (column) {
      return column.id;
    }
    
    // Se não encontrou, tentar mapear para colunas padrão
    const defaultMapping = {
      'A Fazer': 'A Fazer',
      'To Do': 'A Fazer',
      'Pendente': 'A Fazer',
      'Backlog': 'A Fazer',
      'Em Progresso': 'Em Progresso',
      'In Progress': 'Em Progresso',
      'Em Andamento': 'Em Progresso',
      'Desenvolvimento': 'Em Progresso',
      'Concluído': 'Concluído',
      'Done': 'Concluído',
      'Finalizado': 'Concluído',
      'Completo': 'Concluído'
    };
    
    const mappedName = defaultMapping[columnName] || 'A Fazer';
    const defaultColumn = mappedColumns.find(col => col.name === mappedName);
    
    console.warn(`⚠️ Coluna "${columnName}" não encontrada, mapeando para "${mappedName}" (ID: ${defaultColumn?.id || 1})`);
    return defaultColumn?.id || 1;
  };
  
  // Mapear cartões
  const mappedCards = cardsData.map(card => {
    const columnId = getColumnIdFromNameLocal(card.list_name);
    console.log(`Mapeando card "${card.title}" da coluna "${card.list_name}" para column_id: ${columnId}`);
    
    const mappedCard = {
      id: card.id,
      board_id: board.id, // Usar sempre o ID numérico do board
      column_id: columnId,
      title: card.title,
      description: card.description || '',
      priority: card.importance,
      status: card.status,
      assigned_to: card.assigned_to,
      created_by: card.created_by || 1,
      created_at: card.created_at || new Date().toISOString(),
      updated_at: card.updated_at || new Date().toISOString(),
      due_date: card.due_date || undefined,
      tags: [],
      attachments: [],
      comments: [],
      dependencies: card.dependencies || [],
      subtasks: []
    };
    return mappedCard;
  });
  
  // Filtrar cards para mostrar apenas os do board atual
  console.log('=== DEBUG FILTRO ===');
  console.log('board.id (tipo):', typeof board.id, 'valor:', board.id);
  console.log('mappedCards antes do filtro:', mappedCards);
  mappedCards.forEach((card, index) => {
    console.log(`Card ${index}: board_id=${card.board_id} (tipo: ${typeof card.board_id})`);
  });
  
  const boardCards = mappedCards.filter(card => {
    const cardBoardId = card.board_id;
    const currentBoardId = board.id;
    const currentBoardStringId = board.board_id;
    
    // Comparar com o ID numérico do board
    if (cardBoardId === currentBoardId) return true;
    
    // Comparar com o board_id string se existir
    if (currentBoardStringId) {
      if (typeof currentBoardStringId === 'string') {
        return cardBoardId === parseInt(currentBoardStringId);
      } else if (typeof currentBoardStringId === 'number') {
        return cardBoardId === currentBoardStringId;
      }
    }
    
    return false;
  });
  
  console.log('=== RESUMO DO CARREGAMENTO ===');
  console.log('Total de cards mapeados:', mappedCards.length);
  console.log('Total de cards filtrados:', boardCards.length);
  console.log('Board ID para filtro:', board.id);
  console.log('Cards filtrados:', boardCards);
  
  return { columns: mappedColumns, cards: boardCards };
}

// Simular filtro de colunas
function simulateColumnFiltering(columns, currentBoard) {
  console.log('=== FILTRO DE COLUNAS ===');
  console.log('Todas as colunas:', columns);
  console.log('Board atual:', currentBoard);
  
  const filteredColumns = columns.filter(col => {
    const currentBoardId = currentBoard?.id;
    const currentBoardStringId = currentBoard?.board_id;
    const colBoardId = col.board_id;
    
    // Converter todos para string para comparação segura
    const currentBoardIdStr = String(currentBoardId || '');
    const currentBoardStringIdStr = String(currentBoardStringId || '');
    const colBoardIdStr = String(colBoardId || '');
    
    // Comparar IDs como strings
    const boardIdMatch = 
      colBoardIdStr === currentBoardIdStr || 
      colBoardIdStr === currentBoardStringIdStr;
    
    console.log(`Coluna ${col.name}: colBoardId=${colBoardId} (${typeof colBoardId}) vs currentBoardId=${currentBoardId} (${typeof currentBoardId}) = ${boardIdMatch}`);
    
    return boardIdMatch;
  });
  
  console.log('Colunas filtradas:', filteredColumns);
  return filteredColumns;
}

// Simular filtro de cartões por coluna
function simulateCardFiltering(cards, column) {
  console.log(`=== FILTRO DE CARTÕES PARA COLUNA ${column.name} ===`);
  console.log('Todos os cartões:', cards);
  console.log('Coluna:', column);
  
  const filteredCards = cards.filter(card => {
    const matches = card.column_id === column.id;
    console.log(`Card "${card.title}": column_id=${card.column_id} vs column.id=${column.id} = ${matches}`);
    return matches;
  });
  
  console.log(`Cartões para coluna ${column.name}:`, filteredCards);
  return filteredCards;
}

// Executar teste completo
async function runCompleteTest() {
  console.log('🧪 INICIANDO TESTE COMPLETO DO KANBAN');
  
  // Teste 1: Carregar dados do board
  const board = mockDatabaseData.boards[0];
  console.log('\n📋 TESTE 1: Carregamento do Board');
  const { columns, cards } = await simulateLoadBoardData(board);
  
  // Teste 2: Filtrar colunas
  console.log('\n📝 TESTE 2: Filtro de Colunas');
  const filteredColumns = simulateColumnFiltering(columns, board);
  
  // Teste 3: Filtrar cartões por coluna
  console.log('\n🃏 TESTE 3: Filtro de Cartões por Coluna');
  filteredColumns.forEach(column => {
    const columnCards = simulateCardFiltering(cards, column);
    console.log(`\nColuna "${column.name}": ${columnCards.length} cartões`);
    columnCards.forEach(card => {
      console.log(`  - ${card.title} (ID: ${card.id})`);
    });
  });
  
  // Resumo final
  console.log('\n📊 RESUMO FINAL:');
  console.log(`- Boards: ${mockDatabaseData.boards.length}`);
  console.log(`- Colunas carregadas: ${columns.length}`);
  console.log(`- Colunas filtradas: ${filteredColumns.length}`);
  console.log(`- Cartões carregados: ${cards.length}`);
  
  const totalCardsInColumns = filteredColumns.reduce((sum, col) => {
    const columnCards = cards.filter(card => card.column_id === col.id);
    return sum + columnCards.length;
  }, 0);
  
  console.log(`- Cartões distribuídos nas colunas: ${totalCardsInColumns}`);
  
  if (totalCardsInColumns === 0 && cards.length > 0) {
    console.log('❌ PROBLEMA IDENTIFICADO: Cartões não estão sendo distribuídos nas colunas!');
    console.log('Possíveis causas:');
    console.log('1. Mapeamento de column_id incorreto');
    console.log('2. Filtro de colunas muito restritivo');
    console.log('3. Problema na função getColumnIdFromNameLocal');
  } else if (totalCardsInColumns === 0 && cards.length === 0) {
    console.log('❌ PROBLEMA IDENTIFICADO: Nenhum cartão foi carregado!');
    console.log('Possíveis causas:');
    console.log('1. Board não tem cartões no banco');
    console.log('2. Filtro de board_id incorreto');
    console.log('3. Problema na consulta do banco');
  } else {
    console.log('✅ TESTE PASSOU: Cartões estão sendo carregados e distribuídos corretamente!');
  }
}

// Executar teste
runCompleteTest().catch(console.error);
