/**
 * Script para corrigir colunas duplicadas em quadros
 * 
 * Este script identifica e remove colunas duplicadas mantendo apenas uma de cada nome
 * 
 * Como usar:
 * node fix_duplicate_columns.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para listar todos os boards
async function getAllBoards() {
  try {
    const { data, error } = await supabase
      .from('boards')
      .select('id, board_id, name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar boards:', error);
    return [];
  }
}

// Função para buscar colunas de um board
async function getColumnsForBoard(boardId) {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar colunas do board ${boardId}:`, error);
    return [];
  }
}

// Função para deletar coluna
async function deleteColumn(columnId) {
  try {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', columnId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Erro ao deletar coluna ${columnId}:`, error);
    return false;
  }
}

// Função para identificar e remover colunas duplicadas
async function fixDuplicateColumns(boardId, boardName) {
  console.log(`\n🔍 Analisando board: ${boardName} (${boardId})`);
  
  const columns = await getColumnsForBoard(boardId);
  console.log(`📋 Total de colunas encontradas: ${columns.length}`);
  
  if (columns.length <= 1) {
    console.log('✅ Nenhuma duplicação encontrada');
    return { duplicates: 0, removed: 0 };
  }

  // Agrupar colunas por nome
  const columnsByName = {};
  columns.forEach(column => {
    if (!columnsByName[column.name]) {
      columnsByName[column.name] = [];
    }
    columnsByName[column.name].push(column);
  });

  let duplicatesFound = 0;
  let duplicatesRemoved = 0;

  // Processar cada grupo de colunas
  for (const [columnName, columnGroup] of Object.entries(columnsByName)) {
    if (columnGroup.length > 1) {
      console.log(`⚠️  Coluna duplicada encontrada: "${columnName}" (${columnGroup.length} instâncias)`);
      duplicatesFound += columnGroup.length - 1;

      // Ordenar por ID (manter a mais antiga)
      columnGroup.sort((a, b) => a.id - b.id);
      const keepColumn = columnGroup[0];
      const removeColumns = columnGroup.slice(1);

      console.log(`   ✅ Mantendo: ID ${keepColumn.id} (posição ${keepColumn.position})`);
      
      // Remover duplicatas
      for (const column of removeColumns) {
        console.log(`   🗑️  Removendo: ID ${column.id} (posição ${column.position})`);
        const success = await deleteColumn(column.id);
        if (success) {
          duplicatesRemoved++;
        }
      }
    }
  }

  if (duplicatesFound === 0) {
    console.log('✅ Nenhuma duplicação encontrada');
  } else {
    console.log(`📊 Resumo: ${duplicatesFound} duplicatas encontradas, ${duplicatesRemoved} removidas`);
  }

  return { duplicates: duplicatesFound, removed: duplicatesRemoved };
}

// Função para reordenar colunas após remoção de duplicatas
async function reorderColumns(boardId) {
  try {
    const columns = await getColumnsForBoard(boardId);
    
    // Reordenar por posição
    columns.sort((a, b) => a.position - b.position);
    
    // Atualizar posições sequenciais
    for (let i = 0; i < columns.length; i++) {
      const newPosition = i + 1;
      if (columns[i].position !== newPosition) {
        const { error } = await supabase
          .from('lists')
          .update({ position: newPosition })
          .eq('id', columns[i].id);

        if (error) {
          console.error(`Erro ao reordenar coluna ${columns[i].id}:`, error);
        } else {
          console.log(`   📝 Reordenando "${columns[i].name}": posição ${columns[i].position} → ${newPosition}`);
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao reordenar colunas do board ${boardId}:`, error);
  }
}

// Função principal
async function main() {
  console.log('🔧 Script de Correção de Colunas Duplicadas');
  console.log('===========================================');
  
  try {
    // Buscar todos os boards
    const boards = await getAllBoards();
    console.log(`📊 Total de boards encontrados: ${boards.length}`);

    if (boards.length === 0) {
      console.log('❌ Nenhum board encontrado');
      return;
    }

    let totalDuplicates = 0;
    let totalRemoved = 0;

    // Processar cada board
    for (const board of boards) {
      const result = await fixDuplicateColumns(board.board_id, board.name);
      totalDuplicates += result.duplicates;
      totalRemoved += result.removed;

      // Reordenar colunas se houve remoções
      if (result.removed > 0) {
        console.log(`🔄 Reordenando colunas do board: ${board.name}`);
        await reorderColumns(board.board_id);
      }
    }

    console.log('\n🎉 Correção concluída!');
    console.log('=====================');
    console.log(`📊 Resumo geral:`);
    console.log(`   • Boards processados: ${boards.length}`);
    console.log(`   • Duplicatas encontradas: ${totalDuplicates}`);
    console.log(`   • Duplicatas removidas: ${totalRemoved}`);

    if (totalRemoved > 0) {
      console.log('\n✅ Colunas duplicadas foram removidas com sucesso!');
      console.log('💡 Recomendação: Recarregue a página do Kanban para ver as mudanças.');
    } else {
      console.log('\n✅ Nenhuma duplicação foi encontrada. Todos os boards estão corretos!');
    }

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixDuplicateColumns,
  reorderColumns,
  getAllBoards,
  getColumnsForBoard
};
