/**
 * Script para fazer backup antes da limpeza
 * 
 * Este script cria um backup completo dos dados antes de executar a limpeza
 * 
 * Como usar:
 * 1. Execute: node backup_before_cleanup.js
 * 2. O backup será salvo em backup_data_YYYY-MM-DD_HH-MM-SS.json
 * 3. Execute a limpeza
 * 4. Se necessário, restaure os dados usando o arquivo de backup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Função para gerar timestamp
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// Função para fazer backup de uma tabela
async function backupTable(tableName) {
  try {
    console.log(`📋 Fazendo backup da tabela: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`❌ Erro ao fazer backup de ${tableName}:`, error);
      return null;
    }

    console.log(`✅ ${tableName}: ${data.length} registros salvos`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao fazer backup de ${tableName}:`, error);
    return null;
  }
}

// Função para salvar backup em arquivo
function saveBackup(backupData, filename) {
  try {
    const backupPath = path.join(__dirname, filename);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup salvo em: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Erro ao salvar backup:', error);
    return null;
  }
}

// Função para restaurar dados do backup
async function restoreFromBackup(backupData) {
  try {
    console.log('🔄 Iniciando restauração do backup...');
    
    const tables = ['lists', 'cards', 'activities', 'chats', 'subtasks'];
    
    for (const table of tables) {
      if (backupData[table] && backupData[table].length > 0) {
        console.log(`📥 Restaurando ${table}: ${backupData[table].length} registros`);
        
        const { error } = await supabase
          .from(table)
          .insert(backupData[table]);

        if (error) {
          console.error(`❌ Erro ao restaurar ${table}:`, error);
        } else {
          console.log(`✅ ${table} restaurada com sucesso`);
        }
      }
    }
    
    console.log('🎉 Restauração concluída!');
  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
  }
}

// Função principal de backup
async function createBackup() {
  console.log('💾 Iniciando backup completo do banco...');
  
  const timestamp = getTimestamp();
  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  try {
    // Fazer backup de todas as tabelas
    const tables = ['lists', 'cards', 'activities', 'chats', 'subtasks'];
    
    for (const table of tables) {
      const data = await backupTable(table);
      if (data !== null) {
        backupData.tables[table] = data;
      }
    }

    // Salvar backup
    const filename = `backup_data_${timestamp}.json`;
    const backupPath = saveBackup(backupData, filename);
    
    if (backupPath) {
      console.log('\n🎉 Backup criado com sucesso!');
      console.log(`📁 Arquivo: ${filename}`);
      console.log(`📊 Total de tabelas: ${Object.keys(backupData.tables).length}`);
      
      // Mostrar resumo
      Object.entries(backupData.tables).forEach(([table, data]) => {
        console.log(`   • ${table}: ${data.length} registros`);
      });
      
      return { backupPath, backupData };
    } else {
      console.log('❌ Falha ao criar backup');
      return null;
    }

  } catch (error) {
    console.error('❌ Erro durante o backup:', error);
    return null;
  }
}

// Função para listar backups disponíveis
function listBackups() {
  try {
    const files = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('backup_data_') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('📁 Nenhum backup encontrado');
      return [];
    }

    console.log('📁 Backups disponíveis:');
    files.forEach((file, index) => {
      const stats = fs.statSync(path.join(__dirname, file));
      console.log(`   ${index + 1}. ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
    });

    return files;
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    return [];
  }
}

// Função para carregar backup
function loadBackup(filename) {
  try {
    const backupPath = path.join(__dirname, filename);
    const data = fs.readFileSync(backupPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar backup:', error);
    return null;
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      await createBackup();
      break;
      
    case 'list':
      listBackups();
      break;
      
    case 'restore':
      const filename = args[1];
      if (!filename) {
        console.log('❌ Especifique o arquivo de backup: node backup_before_cleanup.js restore backup_data_YYYY-MM-DD_HH-MM-SS.json');
        return;
      }
      
      const backupData = loadBackup(filename);
      if (backupData) {
        await restoreFromBackup(backupData.tables);
      }
      break;
      
    default:
      console.log('💾 Script de Backup do Banco de Dados');
      console.log('=====================================');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  create  - Criar novo backup');
      console.log('  list    - Listar backups disponíveis');
      console.log('  restore - Restaurar de um backup');
      console.log('');
      console.log('Exemplos:');
      console.log('  node backup_before_cleanup.js create');
      console.log('  node backup_before_cleanup.js list');
      console.log('  node backup_before_cleanup.js restore backup_data_2024-01-15_14-30-00.json');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createBackup,
  listBackups,
  loadBackup,
  restoreFromBackup
};
