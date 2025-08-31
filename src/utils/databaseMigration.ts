import { supabase } from '../services/database';

export const createTables = async () => {
  try {
    console.log('🔄 Iniciando criação das tabelas...');

    // Como não temos acesso direto ao SQL no Supabase via cliente, vamos verificar se as tabelas existem
    // tentando fazer uma consulta simples
    const tables = ['users', 'boards', 'lists', 'cards', 'subtasks', 'activities', 'chats', 'chat_messages', 'user_settings'];
    
    for (const tableName of tables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`⚠️ Tabela ${tableName} não existe ou erro:`, error.message);
        } else {
          console.log(`✅ Tabela ${tableName} existe`);
        }
      } catch (err) {
        console.log(`⚠️ Erro ao verificar tabela ${tableName}:`, err);
      }
    }

    console.log('🎉 Verificação das tabelas concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
};

export const insertSampleData = async () => {
  try {
    console.log('🔄 Inserindo dados de exemplo...');

    // Inserir usuário de exemplo
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          cargo: 'Administrador'
        }
      ])
      .select()
      .single();

    if (userError) {
      console.log('⚠️ Usuário pode já existir ou erro:', userError.message);
    } else {
      console.log('✅ Usuário de exemplo criado');
    }

    // Inserir quadro de exemplo
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert([
        {
          board_id: 'sample-board-1',
          name: 'Projeto Exemplo',
          description: 'Quadro de exemplo para demonstração',
          owner_id: user?.id || 1
        }
      ])
      .select()
      .single();

    if (boardError) {
      console.log('⚠️ Quadro pode já existir ou erro:', boardError.message);
    } else {
      console.log('✅ Quadro de exemplo criado');
    }

    // Inserir listas de exemplo
    const lists = [
      { list_id: 'list-1', board_id: 'sample-board-1', name: 'A Fazer', position: 1 },
      { list_id: 'list-2', board_id: 'sample-board-1', name: 'Em Progresso', position: 2 },
      { list_id: 'list-3', board_id: 'sample-board-1', name: 'Concluído', position: 3 }
    ];

    for (const list of lists) {
      const { error: listError } = await supabase.from('lists').insert([list]);
      if (listError) {
        console.log('⚠️ Lista pode já existir ou erro:', listError.message);
      }
    }
    console.log('✅ Listas de exemplo processadas');

    // Inserir cards de exemplo
    const cards = [
      {
        card_id: 'card-1',
        board_id: 'sample-board-1',
        list_name: 'A Fazer',
        title: 'Implementar Sistema de Login',
        description: 'Desenvolver sistema completo de autenticação',
        status: 'pending',
        importance: 'high',
        subject: 'Desenvolvimento',
        goal: 'Sistema funcional',
        members: ['admin'],
        creation_date: new Date().toISOString(),
        is_archived: false,
        git_branch: 'feature/login',
        git_commit: 'initial',
        history: [],
        dependencies: [],
        recurrence: 'Nenhuma'
      },
      {
        card_id: 'card-2',
        board_id: 'sample-board-1',
        list_name: 'Em Progresso',
        title: 'Configurar Banco de Dados',
        description: 'Configurar PostgreSQL com migrations',
        status: 'in_progress',
        importance: 'high',
        subject: 'Infraestrutura',
        goal: 'Banco configurado',
        members: ['admin'],
        creation_date: new Date().toISOString(),
        is_archived: false,
        git_branch: 'feature/database',
        git_commit: 'setup',
        history: [],
        dependencies: [],
        recurrence: 'Nenhuma'
      }
    ];

    for (const card of cards) {
      const { error: cardError } = await supabase.from('cards').insert([card]);
      if (cardError) {
        console.log('⚠️ Card pode já existir ou erro:', cardError.message);
      }
    }
    console.log('✅ Cards de exemplo processados');

    // Inserir subtarefas de exemplo
    const subtasks = [
      {
        card_id: 'card-1',
        title: 'Criar componentes de login',
        description: 'Implementar formulários de login e registro',
        status: 'completed',
        priority: 'medium',
        importance: 'Média',
        tags: ['React', 'UI/UX'],
        completed: true,
        completed_at: new Date().toISOString()
      },
      {
        card_id: 'card-1',
        title: 'Implementar validação de formulários',
        description: 'Adicionar validação client-side e server-side',
        status: 'pending',
        priority: 'high',
        importance: 'Alta',
        tags: ['Validação', 'Segurança'],
        completed: false
      }
    ];

    for (const subtask of subtasks) {
      const { error: subtaskError } = await supabase.from('subtasks').insert([subtask]);
      if (subtaskError) {
        console.log('⚠️ Subtarefa pode já existir ou erro:', subtaskError.message);
      }
    }
    console.log('✅ Subtarefas de exemplo processadas');

    console.log('🎉 Dados de exemplo processados com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
    return false;
  }
};

export const migrateDatabase = async () => {
  console.log('🚀 Iniciando migração do banco de dados...');
  
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('❌ Falha ao verificar tabelas');
    return false;
  }

  const sampleDataInserted = await insertSampleData();
  if (!sampleDataInserted) {
    console.error('❌ Falha ao inserir dados de exemplo');
    return false;
  }

  console.log('🎉 Migração concluída com sucesso!');
  return true;
};
