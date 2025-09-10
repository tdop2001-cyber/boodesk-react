/**
 * Script simples para configurar logs de atividades
 * 
 * Este script cria a tabela activity_logs usando inserção direta
 * 
 * Como usar:
 * node setup_activity_logs_simple.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para inserir um log de atividade
async function insertActivityLog(logData) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([logData]);

    if (error) {
      console.error('Erro ao inserir log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao inserir log:', error);
    return false;
  }
}

// Função para criar logs de exemplo
async function createSampleLogs() {
  console.log('📝 Criando logs de exemplo...');
  
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
  
  let successCount = 0;
  
  for (const log of sampleLogs) {
    const success = await insertActivityLog(log);
    if (success) {
      successCount++;
      console.log(`✅ Log inserido: ${log.activity_description}`);
    } else {
      console.log(`❌ Falha ao inserir: ${log.activity_description}`);
    }
  }
  
  console.log(`📊 ${successCount}/${sampleLogs.length} logs inseridos com sucesso`);
  return successCount > 0;
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

    if (data.length === 0) {
      console.log('📭 Nenhum log encontrado');
      return;
    }

    console.log('📊 Logs recentes:');
    data.forEach((log, index) => {
      const date = new Date(log.created_at).toLocaleString('pt-BR');
      console.log(`${index + 1}. [${date}] ${log.activity_description} (${log.activity_type})`);
    });
  } catch (error) {
    console.error('Erro ao listar logs:', error);
  }
}

// Função principal
async function main() {
  console.log('🛠️  Configuração Simples de Logs de Atividades');
  console.log('=============================================');
  
  try {
    // Tentar criar logs de exemplo
    const logsCreated = await createSampleLogs();
    
    if (logsCreated) {
      console.log('\n✅ Logs de exemplo criados com sucesso!');
      
      // Listar logs recentes
      await listRecentLogs();
      
      console.log('\n🎉 Configuração concluída!');
      console.log('💡 Os logs de atividades estão prontos para uso.');
    } else {
      console.log('\n❌ Falha ao criar logs de exemplo');
      console.log('💡 Execute o SQL manualmente no Supabase:');
      console.log(`
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
      `);
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
  insertActivityLog,
  createSampleLogs,
  listRecentLogs
};
