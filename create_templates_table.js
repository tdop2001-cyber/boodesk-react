const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://noxhoaarzezagzsbypsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODQwMDgsImV4cCI6MjA3MjA2MDAwOH0.--5wiBXbXoJQNylU3COyYpfH7L3LqbzTXU0xCo29fcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBoardTemplatesTable() {
  try {
    console.log('Criando tabela board_templates...');

    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS board_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'custom',
        icon VARCHAR(100),
        color VARCHAR(50) DEFAULT 'bg-gray-500',
        columns JSONB NOT NULL DEFAULT '[]',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Executar SQL para criar a tabela
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.log('Erro ao criar tabela:', createError);
      console.log('Tentando método alternativo...');
      
      // Método alternativo: usar query direta
      const { error: altError } = await supabase
        .from('board_templates')
        .select('id')
        .limit(1);
      
      if (altError && altError.code === 'PGRST205') {
        console.log('Tabela não existe. Você precisa criar manualmente no painel do Supabase.');
        console.log('Execute o SQL no painel SQL Editor do Supabase:');
        console.log(createTableSQL);
        return;
      }
    }

    console.log('Tabela board_templates criada com sucesso!');

    // Inserir templates padrão
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
      return;
    }

    if (existingTemplates && existingTemplates.length > 0) {
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
createBoardTemplatesTable();
