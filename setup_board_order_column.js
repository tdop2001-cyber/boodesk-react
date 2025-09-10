/**
 * Script para adicionar coluna board_order na tabela user_preferences
 * 
 * Este script adiciona a coluna necessária para armazenar a ordem dos quadros por usuário
 * 
 * Como usar:
 * node setup_board_order_column.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para verificar se a coluna existe
async function checkColumnExists() {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('board_order')
      .limit(1);

    if (error && error.code === '42703') {
      // Coluna não existe
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar coluna:', error);
    return false;
  }
}

// Função para adicionar a coluna
async function addBoardOrderColumn() {
  try {
    console.log('🔧 Adicionando coluna board_order...');
    
    // SQL para adicionar a coluna
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            -- Tentar adicionar a coluna board_order se ela não existir
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'user_preferences' 
                AND column_name = 'board_order'
            ) THEN
                -- Adicionar coluna board_order como array de inteiros
                ALTER TABLE user_preferences 
                ADD COLUMN board_order INTEGER[] DEFAULT '{}';
                
                -- Adicionar comentário explicativo
                COMMENT ON COLUMN user_preferences.board_order IS 'Array com a ordem personalizada dos IDs dos quadros para este usuário';
                
                RAISE NOTICE 'Coluna board_order adicionada com sucesso!';
            ELSE
                RAISE NOTICE 'Coluna board_order já existe!';
            END IF;
        END $$;
      `
    });

    if (error) {
      console.error('Erro ao executar SQL:', error);
      return false;
    }

    console.log('✅ Coluna board_order adicionada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna:', error);
    return false;
  }
}

// Função alternativa usando SQL direto
async function addBoardOrderColumnDirect() {
  try {
    console.log('🔧 Tentando adicionar coluna board_order diretamente...');
    
    // Tentar inserir um registro com board_order para forçar a criação da coluna
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: 'test',
        board_order: [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao inserir registro de teste:', error);
      return false;
    }

    // Remover o registro de teste
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', 'test');

    console.log('✅ Coluna board_order criada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar coluna:', error);
    return false;
  }
}

// Função para verificar a estrutura da tabela
async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela user_preferences...');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Erro ao verificar tabela:', error);
      return;
    }

    console.log('✅ Tabela user_preferences acessível');
    
    // Tentar verificar se board_order existe
    const columnExists = await checkColumnExists();
    if (columnExists) {
      console.log('✅ Coluna board_order já existe!');
    } else {
      console.log('❌ Coluna board_order não existe');
    }
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
  }
}

// Função principal
async function main() {
  console.log('🛠️  Configuração da Coluna board_order');
  console.log('=====================================');
  
  try {
    // Verificar estrutura atual
    await checkTableStructure();
    
    // Verificar se a coluna já existe
    const columnExists = await checkColumnExists();
    
    if (columnExists) {
      console.log('\n✅ Coluna board_order já existe! Nenhuma ação necessária.');
      return;
    }
    
    console.log('\n🔧 Coluna board_order não existe. Tentando criar...');
    
    // Tentar adicionar a coluna
    let success = false;
    
    // Primeiro, tentar método direto
    success = await addBoardOrderColumnDirect();
    
    if (!success) {
      console.log('\n⚠️  Método direto falhou. Tente executar o SQL manualmente no Supabase:');
      console.log('\n📋 SQL para executar no Supabase SQL Editor:');
      console.log(`
ALTER TABLE user_preferences 
ADD COLUMN board_order INTEGER[] DEFAULT '{}';

COMMENT ON COLUMN user_preferences.board_order IS 'Array com a ordem personalizada dos IDs dos quadros para este usuário';
      `);
    }
    
    // Verificar novamente
    if (success) {
      const finalCheck = await checkColumnExists();
      if (finalCheck) {
        console.log('\n🎉 Configuração concluída com sucesso!');
        console.log('💡 Agora você pode reordenar os quadros e a ordem será salva por usuário.');
      } else {
        console.log('\n❌ Configuração falhou. Execute o SQL manualmente.');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkColumnExists,
  addBoardOrderColumn,
  addBoardOrderColumnDirect,
  checkTableStructure
};
