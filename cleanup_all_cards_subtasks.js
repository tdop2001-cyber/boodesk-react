/**
 * Script para limpar todos os cards e subtasks do banco de dados
 * 
 * ATENÇÃO: Este script irá deletar TODOS os cards e subtasks do banco!
 * Use com cuidado e apenas em ambiente de desenvolvimento/teste.
 * 
 * Como usar:
 * 1. Certifique-se de que as variáveis de ambiente estão configuradas
 * 2. Execute: node cleanup_all_cards_subtasks.js
 * 3. Confirme a operação quando solicitado
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY estão definidas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para confirmar a operação
function confirmOperation() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n⚠️  ATENÇÃO: Esta operação irá deletar TODOS os cards e subtasks do banco!');
    console.log('⚠️  Esta ação NÃO pode ser desfeita!');
    console.log('\nDigite "CONFIRMAR" para continuar ou qualquer outra coisa para cancelar:');
    
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer === 'CONFIRMAR');
    });
  });
}

// Função para contar registros
async function countRecords() {
  try {
    console.log('📊 Contando registros atuais...');
    
    const [cardsResult, subtasksResult, activitiesResult] = await Promise.all([
      supabase.from('cards').select('id', { count: 'exact', head: true }),
      supabase.from('subtasks').select('id', { count: 'exact', head: true }),
      supabase.from('activities').select('id', { count: 'exact', head: true })
    ]);

    const cardsCount = cardsResult.count || 0;
    const subtasksCount = subtasksResult.count || 0;
    const activitiesCount = activitiesResult.count || 0;

    console.log(`📋 Cards: ${cardsCount}`);
    console.log(`📝 Subtasks: ${subtasksCount}`);
    console.log(`📅 Atividades: ${activitiesCount}`);
    console.log(`📊 Total: ${cardsCount + subtasksCount + activitiesCount} registros`);

    return { cardsCount, subtasksCount, activitiesCount };
  } catch (error) {
    console.error('❌ Erro ao contar registros:', error);
    return { cardsCount: 0, subtasksCount: 0, activitiesCount: 0 };
  }
}

// Função para limpar todos os dados
async function cleanupAllData() {
  try {
    console.log('\n🧹 Iniciando limpeza completa do banco...');
    
    // 1. Deletar todas as subtasks
    console.log('🗑️  Deletando todas as subtasks...');
    const { error: subtasksError, count: deletedSubtasks } = await supabase
      .from('subtasks')
      .delete({ count: 'exact' });

    if (subtasksError) {
      console.error('❌ Erro ao deletar subtasks:', subtasksError);
      return false;
    }
    console.log(`✅ ${deletedSubtasks || 0} subtasks deletadas`);

    // 2. Deletar todas as atividades
    console.log('🗑️  Deletando todas as atividades...');
    const { error: activitiesError, count: deletedActivities } = await supabase
      .from('activities')
      .delete({ count: 'exact' });

    if (activitiesError) {
      console.error('❌ Erro ao deletar atividades:', activitiesError);
      return false;
    }
    console.log(`✅ ${deletedActivities || 0} atividades deletadas`);

    // 3. Deletar todos os cards
    console.log('🗑️  Deletando todos os cards...');
    const { error: cardsError, count: deletedCards } = await supabase
      .from('cards')
      .delete({ count: 'exact' });

    if (cardsError) {
      console.error('❌ Erro ao deletar cards:', cardsError);
      return false;
    }
    console.log(`✅ ${deletedCards || 0} cards deletados`);

    // 4. Deletar todas as listas (opcional)
    console.log('🗑️  Deletando todas as listas...');
    const { error: listsError, count: deletedLists } = await supabase
      .from('lists')
      .delete({ count: 'exact' });

    if (listsError) {
      console.error('❌ Erro ao deletar listas:', listsError);
      return false;
    }
    console.log(`✅ ${deletedLists || 0} listas deletadas`);

    // 5. Deletar todos os chats (opcional)
    console.log('🗑️  Deletando todos os chats...');
    const { error: chatsError, count: deletedChats } = await supabase
      .from('chats')
      .delete({ count: 'exact' });

    if (chatsError) {
      console.error('❌ Erro ao deletar chats:', chatsError);
      return false;
    }
    console.log(`✅ ${deletedChats || 0} chats deletados`);

    console.log('\n🎉 Limpeza completa realizada com sucesso!');
    console.log(`📊 Resumo da limpeza:`);
    console.log(`   • ${deletedSubtasks || 0} subtasks deletadas`);
    console.log(`   • ${deletedActivities || 0} atividades deletadas`);
    console.log(`   • ${deletedCards || 0} cards deletados`);
    console.log(`   • ${deletedLists || 0} listas deletadas`);
    console.log(`   • ${deletedChats || 0} chats deletados`);

    return true;
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    return false;
  }
}

// Função para verificar se o banco está limpo
async function verifyCleanup() {
  try {
    console.log('\n🔍 Verificando se a limpeza foi bem-sucedida...');
    
    const { cardsCount, subtasksCount, activitiesCount } = await countRecords();
    
    if (cardsCount === 0 && subtasksCount === 0 && activitiesCount === 0) {
      console.log('✅ Banco limpo com sucesso! Todos os registros foram removidos.');
      return true;
    } else {
      console.log('⚠️  Ainda existem registros no banco:');
      console.log(`   • ${cardsCount} cards restantes`);
      console.log(`   • ${subtasksCount} subtasks restantes`);
      console.log(`   • ${activitiesCount} atividades restantes`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar limpeza:', error);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🧹 Script de Limpeza Completa do Banco de Dados');
  console.log('================================================');
  
  try {
    // Verificar conexão
    console.log('🔌 Verificando conexão com o banco...');
    const { data, error } = await supabase.from('cards').select('id').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error);
      process.exit(1);
    }
    console.log('✅ Conexão estabelecida com sucesso!');

    // Contar registros atuais
    await countRecords();

    // Confirmar operação
    const confirmed = await confirmOperation();
    
    if (!confirmed) {
      console.log('❌ Operação cancelada pelo usuário.');
      process.exit(0);
    }

    // Executar limpeza
    const success = await cleanupAllData();
    
    if (success) {
      // Verificar resultado
      await verifyCleanup();
    } else {
      console.log('❌ Falha na limpeza do banco.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().then(() => {
    console.log('\n🏁 Script finalizado.');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });
}

module.exports = {
  cleanupAllData,
  countRecords,
  verifyCleanup
};
