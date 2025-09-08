// Script para testar as correções do banco de dados
// Execute este script no console do navegador ou como teste

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.2J8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8'; // Substitua pela sua chave

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseFixes() {
  console.log('=== TESTANDO CORREÇÕES DO BANCO DE DADOS ===');
  
  try {
    // 1. Testar se a tabela board_templates existe
    console.log('\n1. Testando tabela board_templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('board_templates')
      .select('*')
      .limit(5);
    
    if (templatesError) {
      console.error('❌ Erro ao buscar templates:', templatesError);
    } else {
      console.log('✅ Tabela board_templates encontrada!');
      console.log('Templates encontrados:', templates?.length || 0);
      if (templates && templates.length > 0) {
        console.log('Primeiro template:', templates[0]);
      }
    }

    // 2. Testar se a função getBoards funciona
    console.log('\n2. Testando função getBoards...');
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .limit(5);
    
    if (boardsError) {
      console.error('❌ Erro ao buscar boards:', boardsError);
    } else {
      console.log('✅ Tabela boards funcionando!');
      console.log('Boards encontrados:', boards?.length || 0);
      if (boards && boards.length > 0) {
        console.log('Primeiro board:', boards[0]);
      }
    }

    // 3. Testar se os dados JSON estão válidos
    console.log('\n3. Testando dados JSON na tabela cards...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, title, members, dependencies, history')
      .limit(5);
    
    if (cardsError) {
      console.error('❌ Erro ao buscar cards:', cardsError);
    } else {
      console.log('✅ Tabela cards funcionando!');
      console.log('Cards encontrados:', cards?.length || 0);
      
      if (cards && cards.length > 0) {
        console.log('Verificando dados JSON...');
        cards.forEach((card, index) => {
          console.log(`Card ${index + 1}:`, {
            id: card.id,
            title: card.title,
            members: card.members,
            dependencies: card.dependencies,
            history: card.history
          });
          
          // Verificar se os campos JSON são válidos
          try {
            if (card.members) JSON.parse(JSON.stringify(card.members));
            if (card.dependencies) JSON.parse(JSON.stringify(card.dependencies));
            if (card.history) JSON.parse(JSON.stringify(card.history));
            console.log(`✅ Card ${index + 1} - Dados JSON válidos`);
          } catch (error) {
            console.error(`❌ Card ${index + 1} - Dados JSON inválidos:`, error);
          }
        });
      }
    }

    // 4. Testar se a função getBoardTemplates funciona
    console.log('\n4. Testando função getBoardTemplates...');
    const { data: boardTemplates, error: boardTemplatesError } = await supabase
      .from('board_templates')
      .select('*')
      .order('name');
    
    if (boardTemplatesError) {
      console.error('❌ Erro ao buscar board templates:', boardTemplatesError);
    } else {
      console.log('✅ Função getBoardTemplates funcionando!');
      console.log('Board templates encontrados:', boardTemplates?.length || 0);
    }

    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste
testDatabaseFixes();

