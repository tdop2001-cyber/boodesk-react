const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTemplates() {
  try {
    console.log('Iniciando configuração dos templates...');

    // 1. Excluir o card "aaaa"
    console.log('Excluindo card "aaaa"...');
    const { data: cardsToDelete, error: searchError } = await supabase
      .from('cards')
      .select('id, card_id')
      .eq('title', 'aaaa');

    if (searchError) {
      console.error('Erro ao buscar card "aaaa":', searchError);
    } else if (cardsToDelete && cardsToDelete.length > 0) {
      for (const card of cardsToDelete) {
        // Excluir subtarefas primeiro
        await supabase
          .from('subtasks')
          .delete()
          .eq('card_id', card.card_id);

        // Excluir o card
        await supabase
          .from('cards')
          .delete()
          .eq('id', card.id);

        console.log(`Card "aaaa" (ID: ${card.id}) excluído com sucesso!`);
      }
    } else {
      console.log('Card "aaaa" não encontrado.');
    }

    // 2. Inserir templates padrão
    console.log('Inserindo templates padrão...');
    
    const defaultTemplates = [
      {
        name: 'Desenvolvimento',
        description: 'Template para projetos de desenvolvimento de software',
        category: 'development',
        icon: 'desenvolvimento',
        color: 'bg-blue-500',
        columns: ['Backlog', 'Em Desenvolvimento', 'Em Teste', 'Pronto para Deploy', 'Deployado'],
        is_default: true
      },
      {
        name: 'Design',
        description: 'Template para projetos de design e UX/UI',
        category: 'design',
        icon: 'design',
        color: 'bg-purple-500',
        columns: ['Briefing', 'Em Design', 'Em Revisão', 'Aprovado', 'Finalizado'],
        is_default: true
      },
      {
        name: 'Manutenção',
        description: 'Template para tarefas de manutenção e suporte',
        category: 'maintenance',
        icon: 'manutencao',
        color: 'bg-orange-500',
        columns: ['Reportado', 'Em Análise', 'Em Correção', 'Em Teste', 'Resolvido'],
        is_default: true
      },
      {
        name: 'Marketing',
        description: 'Template para campanhas e estratégias de marketing',
        category: 'marketing',
        icon: 'marketing',
        color: 'bg-green-500',
        columns: ['Planejamento', 'Em Execução', 'Em Revisão', 'Aprovado', 'Finalizado'],
        is_default: true
      },
      {
        name: 'Produto',
        description: 'Template para desenvolvimento de produtos',
        category: 'product',
        icon: 'produto',
        color: 'bg-indigo-500',
        columns: ['Ideação', 'Validação', 'Desenvolvimento', 'Teste', 'Lançamento'],
        is_default: true
      },
      {
        name: 'Projeto',
        description: 'Template para gerenciamento de projetos gerais',
        category: 'project',
        icon: 'projeto',
        color: 'bg-red-500',
        columns: ['Início', 'Em Andamento', 'Em Revisão', 'Finalização', 'Concluído'],
        is_default: true
      },
      {
        name: 'RH',
        description: 'Template para processos de recursos humanos',
        category: 'hr',
        icon: 'rh',
        color: 'bg-pink-500',
        columns: ['Candidatura', 'Em Análise', 'Entrevista', 'Avaliação', 'Contratado'],
        is_default: true
      },
      {
        name: 'Suporte',
        description: 'Template para tickets de suporte técnico',
        category: 'support',
        icon: 'suporte',
        color: 'bg-yellow-500',
        columns: ['Aberto', 'Em Análise', 'Em Andamento', 'Aguardando Cliente', 'Fechado'],
        is_default: true
      },
      {
        name: 'Tarefas',
        description: 'Template simples para gerenciamento de tarefas',
        category: 'tasks',
        icon: 'tarefas',
        color: 'bg-gray-500',
        columns: ['A Fazer', 'Em Progresso', 'Concluído'],
        is_default: true
      },
      {
        name: 'Vendas',
        description: 'Template para pipeline de vendas',
        category: 'sales',
        icon: 'vendas',
        color: 'bg-teal-500',
        columns: ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'],
        is_default: true
      }
    ];

    // Verificar se já existem templates
    const { data: existingTemplates, error: checkError } = await supabase
      .from('board_templates')
      .select('id');

    if (checkError) {
      console.error('Erro ao verificar templates existentes:', checkError);
    } else if (existingTemplates && existingTemplates.length > 0) {
      console.log('Templates já existem, pulando inserção...');
    } else {
      // Inserir templates
      for (const template of defaultTemplates) {
        const { data, error } = await supabase
          .from('board_templates')
          .insert([template])
          .select()
          .single();

        if (error) {
          console.error(`Erro ao inserir template ${template.name}:`, error);
        } else {
          console.log(`Template "${template.name}" inserido com sucesso!`);
        }
      }
    }

    console.log('Configuração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração:', error);
  }
}

// Executar o script
setupTemplates();
