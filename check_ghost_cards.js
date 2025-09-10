/**
 * Script para verificar cards "fantasma" que ainda aparecem em Minhas Atividades
 * 
 * Este script verifica se existem cards que foram deletados mas ainda aparecem
 * 
 * Como usar:
 * node check_ghost_cards.js
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

// Função para buscar todos os cards de um board
async function getAllCardsForBoard(boardId) {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar cards do board ${boardId}:`, error);
    return [];
  }
}

// Função para buscar cards não arquivados de um board
async function getActiveCardsForBoard(boardId) {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .eq('is_archived', false)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar cards ativos do board ${boardId}:`, error);
    return [];
  }
}

// Função para verificar se um card tem subtarefas
async function getSubtasksForCard(cardId) {
  try {
    // Tentar com card_id como string primeiro
    let { data, error } = await supabase
      .from('subtasks')
      .select('id, title, status')
      .eq('card_id', cardId);

    if (error && error.code === '22P02') {
      // Se der erro de tipo, tentar com o ID numérico
      const numericId = parseInt(cardId.replace('card-', ''));
      if (!isNaN(numericId)) {
        const result = await supabase
          .from('subtasks')
          .select('id, title, status')
          .eq('card_id', numericId);
        data = result.data;
        error = result.error;
      }
    }

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar subtarefas do card ${cardId}:`, error);
    return [];
  }
}

// Função para deletar card e suas subtarefas
async function deleteCardCompletely(cardId) {
  try {
    console.log(`🗑️  Deletando card ${cardId} completamente...`);
    
    // Deletar subtarefas primeiro (tentar ambos os tipos de ID)
    let subtasksError = null;
    
    // Tentar com card_id como string
    let result = await supabase
      .from('subtasks')
      .delete()
      .eq('card_id', cardId);
    subtasksError = result.error;

    if (subtasksError && subtasksError.code === '22P02') {
      // Se der erro de tipo, tentar com o ID numérico
      const numericId = parseInt(cardId.replace('card-', ''));
      if (!isNaN(numericId)) {
        result = await supabase
          .from('subtasks')
          .delete()
          .eq('card_id', numericId);
        subtasksError = result.error;
      }
    }

    if (subtasksError) {
      console.error(`Erro ao deletar subtarefas do card ${cardId}:`, subtasksError);
    } else {
      console.log(`✅ Subtarefas do card ${cardId} deletadas`);
    }

    // Deletar o card (tentar ambos os tipos de ID)
    let cardError = null;
    
    // Tentar com card_id como string
    result = await supabase
      .from('cards')
      .delete()
      .eq('card_id', cardId);
    cardError = result.error;

    if (cardError && cardError.code === '22P02') {
      // Se der erro de tipo, tentar com o ID numérico
      const numericId = parseInt(cardId.replace('card-', ''));
      if (!isNaN(numericId)) {
        result = await supabase
          .from('cards')
          .delete()
          .eq('card_id', numericId);
        cardError = result.error;
      }
    }

    if (cardError) {
      console.error(`Erro ao deletar card ${cardId}:`, cardError);
      return false;
    } else {
      console.log(`✅ Card ${cardId} deletado`);
      return true;
    }
  } catch (error) {
    console.error(`Erro ao deletar card ${cardId}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando Cards Fantasma em Minhas Atividades');
  console.log('================================================');
  
  try {
    // Buscar todos os boards
    const boards = await getAllBoards();
    console.log(`📊 Total de boards encontrados: ${boards.length}`);

    if (boards.length === 0) {
      console.log('❌ Nenhum board encontrado');
      return;
    }

    let totalCards = 0;
    let totalActiveCards = 0;
    let ghostCards = 0;
    let deletedCards = 0;

    // Processar cada board
    for (const board of boards) {
      console.log(`\n🔍 Analisando board: ${board.name} (${board.board_id})`);
      
      // Buscar todos os cards (incluindo arquivados)
      const allCards = await getAllCardsForBoard(board.board_id);
      console.log(`📋 Total de cards (incluindo arquivados): ${allCards.length}`);
      
      // Buscar apenas cards ativos
      const activeCards = await getActiveCardsForBoard(board.board_id);
      console.log(`📋 Cards ativos (não arquivados): ${activeCards.length}`);
      
      totalCards += allCards.length;
      totalActiveCards += activeCards.length;

      // Verificar cards que podem ser "fantasma"
      for (const card of activeCards) {
        console.log(`\n📄 Card: "${card.title}" (${card.card_id})`);
        console.log(`   Status: ${card.status}`);
        console.log(`   Arquivado: ${card.is_archived}`);
        console.log(`   Criado em: ${card.created_at}`);
        console.log(`   Atualizado em: ${card.updated_at}`);
        
        // Verificar se tem subtarefas
        const subtasks = await getSubtasksForCard(card.card_id);
        console.log(`   Subtarefas: ${subtasks.length}`);
        
        // Verificar se o card parece ser "fantasma"
        const isGhost = (
          !card.title || 
          card.title.trim() === '' || 
          card.title === 'undefined' ||
          card.title === 'null' ||
          !card.description ||
          card.description.trim() === ''
        );
        
        if (isGhost) {
          console.log(`   ⚠️  CARD FANTASMA DETECTADO!`);
          ghostCards++;
          
          // Perguntar se deve deletar
          const shouldDelete = process.argv.includes('--delete-ghosts');
          if (shouldDelete) {
            const success = await deleteCardCompletely(card.card_id);
            if (success) {
              deletedCards++;
            }
          } else {
            console.log(`   💡 Execute com --delete-ghosts para deletar automaticamente`);
          }
        } else {
          console.log(`   ✅ Card parece válido`);
        }
      }
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('========================');
    console.log(`📊 Resumo geral:`);
    console.log(`   • Boards processados: ${boards.length}`);
    console.log(`   • Total de cards (incluindo arquivados): ${totalCards}`);
    console.log(`   • Cards ativos: ${totalActiveCards}`);
    console.log(`   • Cards fantasma encontrados: ${ghostCards}`);
    
    if (process.argv.includes('--delete-ghosts')) {
      console.log(`   • Cards fantasma deletados: ${deletedCards}`);
    }

    if (ghostCards > 0) {
      console.log('\n⚠️  Cards fantasma encontrados!');
      console.log('💡 Para deletar automaticamente, execute:');
      console.log('   node check_ghost_cards.js --delete-ghosts');
    } else {
      console.log('\n✅ Nenhum card fantasma encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAllBoards,
  getAllCardsForBoard,
  getActiveCardsForBoard,
  getSubtasksForCard,
  deleteCardCompletely
};
