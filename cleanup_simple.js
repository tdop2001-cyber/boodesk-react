/**
 * Script Simples para Limpeza Rápida
 * 
 * Este script executa a limpeza sem confirmação (use com cuidado!)
 * 
 * Como usar:
 * node cleanup_simple.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function quickCleanup() {
  console.log('🧹 Limpeza rápida iniciada...');
  
  try {
    // Deletar tudo em paralelo
    const results = await Promise.allSettled([
      supabase.from('subtasks').delete(),
      supabase.from('activities').delete(),
      supabase.from('chats').delete(),
      supabase.from('cards').delete(),
      supabase.from('lists').delete()
    ]);

    console.log('✅ Limpeza concluída!');
    
    results.forEach((result, index) => {
      const tables = ['subtasks', 'activities', 'chats', 'cards', 'lists'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${tables[index]} deletados`);
      } else {
        console.log(`❌ Erro em ${tables[index]}:`, result.reason);
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

quickCleanup();
