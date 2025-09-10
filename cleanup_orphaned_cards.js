/**
 * Script para limpar cards órfãos que ainda aparecem em Minhas Atividades
 * 
 * Este script remove cards que foram deletados mas ainda aparecem na interface
 * 
 * Como usar:
 * node cleanup_orphaned_cards.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para buscar todos os cards
async function getAllCards() {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_archived', false)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    return [];
  }
}

// Função para verificar se um card é órfão
function isOrphanedCard(card) {
  // Verificar se o card tem dados válidos
  const hasValidTitle = card.title && card.title.trim() !== '' && card.title !== 'undefined' && card.title !== 'null';
  const hasValidDescription = card.description && card.description.trim() !== '';
  const hasValidStatus = card.status && ['todo', 'progress', 'done'].includes(card.status);
  
  // Card é órfão se não tem título válido ou não tem status válido
  return !hasValidTitle || !hasValidStatus;
}

// Função para deletar card órfão
async function deleteOrphanedCard(card) {
  try {
    console.log(`🗑️  Deletando card órfão: "${card.title}" (${card.card_id})`);
    
    // Deletar subtarefas primeiro
    const { error: subtasksError } = await supabase
      .from('subtasks')
      .delete()
      .eq('card_id', card.card_id);

    if (subtasksError) {
      console.error(`Erro ao deletar subtarefas:`, subtasksError);
    } else {
      console.log(`✅ Subtarefas deletadas`);
    }

    // Deletar o card
    const { error: cardError } = await supabase
      .from('cards')
      .delete()
      .eq('card_id', card.card_id);

    if (cardError) {
      console.error(`Erro ao deletar card:`, cardError);
      return false;
    } else {
      console.log(`✅ Card deletado`);
      return true;
    }
  } catch (error) {
    console.error(`Erro ao deletar card órfão:`, error);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🧹 Limpeza de Cards Órfãos');
  console.log('==========================');
  
  try {
    // Buscar todos os cards
    const cards = await getAllCards();
    console.log(`📊 Total de cards encontrados: ${cards.length}`);

    if (cards.length === 0) {
      console.log('✅ Nenhum card encontrado');
      return;
    }

    let orphanedCards = 0;
    let deletedCards = 0;

    // Verificar cada card
    for (const card of cards) {
      console.log(`\n📄 Verificando card: "${card.title}" (${card.card_id})`);
      console.log(`   Status: ${card.status}`);
      console.log(`   Arquivado: ${card.is_archived}`);
      console.log(`   Criado em: ${card.created_at}`);
      
      if (isOrphanedCard(card)) {
        console.log(`   ⚠️  CARD ÓRFÃO DETECTADO!`);
        orphanedCards++;
        
        // Deletar o card órfão
        const success = await deleteOrphanedCard(card);
        if (success) {
          deletedCards++;
        }
      } else {
        console.log(`   ✅ Card válido`);
      }
    }

    console.log('\n🎉 Limpeza concluída!');
    console.log('====================');
    console.log(`📊 Resumo:`);
    console.log(`   • Cards verificados: ${cards.length}`);
    console.log(`   • Cards órfãos encontrados: ${orphanedCards}`);
    console.log(`   • Cards órfãos deletados: ${deletedCards}`);

    if (orphanedCards > 0) {
      console.log('\n✅ Cards órfãos foram removidos!');
      console.log('💡 Recarregue a página "Minhas Atividades" para ver as mudanças.');
    } else {
      console.log('\n✅ Nenhum card órfão encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAllCards,
  isOrphanedCard,
  deleteOrphanedCard
};
