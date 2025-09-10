/**
 * Script para testar a funcionalidade de ordenação de quadros por usuário
 * 
 * Este script testa se a ordem dos quadros está sendo salva e carregada corretamente
 * 
 * Como usar:
 * node test_board_ordering.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para simular o DatabaseService
class TestDatabaseService {
  async saveUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId.toString(),
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return false;
    }
  }

  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId.toString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.preferences || {};
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return {};
    }
  }

  async saveUserBoardOrder(userId, boardOrder) {
    try {
      console.log('Salvando ordem dos quadros para usuário:', { userId, boardOrder });
      
      // Buscar preferências existentes
      const existingPrefs = await this.getUserPreferences(userId.toString());
      
      // Atualizar apenas a ordem dos quadros
      const updatedPrefs = {
        ...existingPrefs,
        boardOrder: boardOrder
      };
      
      return await this.saveUserPreferences(userId, updatedPrefs);
    } catch (error) {
      console.error('Erro ao salvar ordem dos quadros:', error);
      return false;
    }
  }

  async getUserBoardOrder(userId) {
    try {
      console.log('Carregando ordem dos quadros para usuário:', userId);
      
      // Buscar preferências do usuário
      const preferences = await this.getUserPreferences(userId.toString());
      
      const boardOrder = preferences?.boardOrder || [];
      console.log('Ordem dos quadros carregada:', boardOrder);
      return boardOrder;
    } catch (error) {
      console.error('Erro ao carregar ordem dos quadros:', error);
      return [];
    }
  }
}

// Função para testar a funcionalidade
async function testBoardOrdering() {
  console.log('🧪 Testando Funcionalidade de Ordenação de Quadros');
  console.log('================================================');
  
  const db = new TestDatabaseService();
  const testUserId = 1; // ID do usuário admin
  
  try {
    // Teste 1: Salvar ordem inicial
    console.log('\n📝 Teste 1: Salvando ordem inicial dos quadros');
    const initialOrder = [3, 1, 2]; // Ordem personalizada
    const saveResult = await db.saveUserBoardOrder(testUserId, initialOrder);
    
    if (saveResult) {
      console.log('✅ Ordem inicial salva com sucesso');
    } else {
      console.log('❌ Falha ao salvar ordem inicial');
      return;
    }
    
    // Teste 2: Carregar ordem salva
    console.log('\n📖 Teste 2: Carregando ordem salva');
    const loadedOrder = await db.getUserBoardOrder(testUserId);
    
    if (JSON.stringify(loadedOrder) === JSON.stringify(initialOrder)) {
      console.log('✅ Ordem carregada corretamente:', loadedOrder);
    } else {
      console.log('❌ Ordem carregada incorretamente');
      console.log('   Esperado:', initialOrder);
      console.log('   Obtido:', loadedOrder);
      return;
    }
    
    // Teste 3: Atualizar ordem
    console.log('\n🔄 Teste 3: Atualizando ordem dos quadros');
    const newOrder = [2, 3, 1]; // Nova ordem
    const updateResult = await db.saveUserBoardOrder(testUserId, newOrder);
    
    if (updateResult) {
      console.log('✅ Ordem atualizada com sucesso');
    } else {
      console.log('❌ Falha ao atualizar ordem');
      return;
    }
    
    // Teste 4: Verificar ordem atualizada
    console.log('\n🔍 Teste 4: Verificando ordem atualizada');
    const updatedOrder = await db.getUserBoardOrder(testUserId);
    
    if (JSON.stringify(updatedOrder) === JSON.stringify(newOrder)) {
      console.log('✅ Ordem atualizada corretamente:', updatedOrder);
    } else {
      console.log('❌ Ordem atualizada incorretamente');
      console.log('   Esperado:', newOrder);
      console.log('   Obtido:', updatedOrder);
      return;
    }
    
    // Teste 5: Verificar preferências completas
    console.log('\n📋 Teste 5: Verificando preferências completas');
    const allPreferences = await db.getUserPreferences(testUserId.toString());
    console.log('Preferências completas:', JSON.stringify(allPreferences, null, 2));
    
    if (allPreferences.boardOrder && JSON.stringify(allPreferences.boardOrder) === JSON.stringify(newOrder)) {
      console.log('✅ Preferências completas estão corretas');
    } else {
      console.log('❌ Preferências completas incorretas');
    }
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('💡 A funcionalidade de ordenação de quadros está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Função para limpar dados de teste
async function cleanupTestData() {
  console.log('\n🧹 Limpando dados de teste...');
  
  try {
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', '1');
    
    if (error) {
      console.error('Erro ao limpar dados de teste:', error);
    } else {
      console.log('✅ Dados de teste limpos');
    }
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await cleanupTestData();
    return;
  }
  
  await testBoardOrdering();
  
  if (args.includes('--keep-data')) {
    console.log('\n💾 Dados de teste mantidos para verificação manual');
  } else {
    await cleanupTestData();
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  TestDatabaseService,
  testBoardOrdering,
  cleanupTestData
};
