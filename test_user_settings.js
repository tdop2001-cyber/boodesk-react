// Script para testar a tabela user_settings
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseKey = 'SUA_CHAVE_DO_SUPABASE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserSettings() {
  try {
    console.log('Testando tabela user_settings...');
    
    // 1. Verificar se a tabela existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Erro ao acessar tabela user_settings:', tableError);
      return;
    }
    
    console.log('✅ Tabela user_settings existe');
    
    // 2. Testar inserção de configuração
    const testSettings = {
      boardSettings: { test: 'value' },
      cardSettings: { test: 'value' },
      visualSettings: { test: 'value' },
      userSettings: { test: 'value' }
    };
    
    const settingsToSave = Object.entries(testSettings).map(([key, value]) => ({
      user_id: 1, // ID de teste
      setting_key: key,
      setting_value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }));
    
    console.log('Tentando salvar configurações de teste:', settingsToSave);
    
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settingsToSave)
      .select();
    
    if (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    } else {
      console.log('✅ Configurações salvas com sucesso:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testUserSettings();
