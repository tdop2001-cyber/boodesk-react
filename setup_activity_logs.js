/**
 * Script para configurar a tabela de logs de atividades
 * 
 * Este script cria a tabela activity_logs e insere dados de exemplo
 * 
 * Como usar:
 * node setup_activity_logs.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para executar SQL
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return false;
  }
}

// Função para verificar se a tabela existe
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Tabela não existe
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Função para criar a tabela
async function createActivityLogsTable() {
  console.log('🔧 Criando tabela activity_logs...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        activity_description TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        entity_name VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  return await executeSQL(sql);
}

// Função para criar índices
async function createIndexes() {
  console.log('📊 Criando índices...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);'
  ];
  
  for (const indexSQL of indexes) {
    await executeSQL(indexSQL);
  }
  
  return true;
}

// Função para inserir logs de exemplo
async function insertSampleLogs() {
  console.log('📝 Inserindo logs de exemplo...');
  
  const sampleLogs = [
    {
      user_id: 1,
      activity_type: 'login',
      activity_description: 'Usuário fez login no sistema',
      entity_type: 'user',
      entity_id: '1',
      entity_name: 'admin',
      metadata: { ip: '127.0.0.1', user_agent: 'Mozilla/5.0' }
    },
    {
      user_id: 1,
      activity_type: 'create_board',
      activity_description: 'Criou um novo quadro',
      entity_type: 'board',
      entity_id: '1',
      entity_name: 'Quadro de Teste',
      metadata: { board_id: 'board-123', template: 'default' }
    },
    {
      user_id: 1,
      activity_type: 'create_card',
      activity_description: 'Criou um novo card',
      entity_type: 'card',
      entity_id: '1',
      entity_name: 'Card de Teste',
      metadata: { board_id: 'board-123', priority: 'medium' }
    },
    {
      user_id: 1,
      activity_type: 'move_card',
      activity_description: 'Moveu card entre colunas',
      entity_type: 'card',
      entity_id: '1',
      entity_name: 'Card de Teste',
      metadata: { from_column: 'A Fazer', to_column: 'Em Progresso' }
    },
    {
      user_id: 1,
      activity_type: 'complete_subtask',
      activity_description: 'Concluiu uma subtarefa',
      entity_type: 'subtask',
      entity_id: '1',
      entity_name: 'Subtarefa de Teste',
      metadata: { card_id: '1', completion_time: new Date().toISOString() }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(sampleLogs);

    if (error) {
      console.error('Erro ao inserir logs de exemplo:', error);
      return false;
    }

    console.log('✅ Logs de exemplo inseridos com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inserir logs de exemplo:', error);
    return false;
  }
}

// Função para verificar a estrutura da tabela
async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela...');
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Erro ao verificar tabela:', error);
      return false;
    }

    console.log('✅ Tabela activity_logs acessível');
    return true;
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
    return false;
  }
}

// Função para listar logs recentes
async function listRecentLogs() {
  try {
    console.log('📋 Listando logs recentes...');
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao listar logs:', error);
      return;
    }

    console.log('📊 Logs recentes:');
    data.forEach((log, index) => {
      console.log(`${index + 1}. [${log.created_at}] ${log.activity_description} (${log.activity_type})`);
    });
  } catch (error) {
    console.error('Erro ao listar logs:', error);
  }
}

// Função principal
async function main() {
  console.log('🛠️  Configuração da Tabela de Logs de Atividades');
  console.log('===============================================');
  
  try {
    // Verificar se a tabela já existe
    const tableExists = await checkTableExists();
    
    if (tableExists) {
      console.log('✅ Tabela activity_logs já existe!');
      await listRecentLogs();
      return;
    }
    
    console.log('🔧 Tabela não existe. Criando...');
    
    // Criar tabela
    const tableCreated = await createActivityLogsTable();
    if (!tableCreated) {
      console.log('❌ Falha ao criar tabela');
      return;
    }
    
    // Criar índices
    await createIndexes();
    
    // Inserir logs de exemplo
    await insertSampleLogs();
    
    // Verificar estrutura
    const structureOk = await checkTableStructure();
    if (!structureOk) {
      console.log('❌ Falha na verificação da estrutura');
      return;
    }
    
    // Listar logs recentes
    await listRecentLogs();
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('💡 A tabela activity_logs foi criada e está pronta para uso.');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createActivityLogsTable,
  createIndexes,
  insertSampleLogs,
  checkTableStructure,
  listRecentLogs
};
