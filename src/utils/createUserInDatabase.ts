import { supabase } from '../services/database';

export const createUserInDatabase = async (userData: {
  username: string;
  email: string;
  role: string;
  cargo: string;
  password?: string;
}) => {
  try {
    console.log('🔄 Criando usuário no banco de dados...');
    
    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', userData.username)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar usuário existente:', checkError);
      return null;
    }
    
    if (existingUser) {
      console.log('✅ Usuário já existe:', existingUser);
      return existingUser;
    }
    
    // Criar novo usuário
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        username: userData.username,
        email: userData.email,
        password_hash: userData.password || 'default123',
        role: userData.role,
        cargo: userData.cargo,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError);
      return null;
    }
    
    console.log('✅ Usuário criado com sucesso:', newUser);
    return newUser;
    
  } catch (error) {
    console.error('❌ Erro inesperado ao criar usuário:', error);
    return null;
  }
};

export const ensureAdminUserExists = async () => {
  // Criar usuário admin com dados completos
  const adminUser = await createUserInDatabase({
    username: 'admin',
    email: 'admin@boodesk.com',
    role: 'admin',
    cargo: 'Administrador',
    password: 'admin123'
  });
  
  // Atualizar admin com dados completos
  if (adminUser) {
    await updateUserWithCompleteData(adminUser.id, {
      nome_completo: 'Administrador do Sistema',
      telefone: '+55 (11) 99999-9999',
      biografia: 'Administrador do sistema Boodesk com foco em gestão de projetos e equipes.',
      fuso_horario: 'America/Sao_Paulo',
      pais: 'BR',
      tipo_localizacao: 'brasil',
      cidade: 'São Paulo',
      estado: 'SP'
    });
  }
  
  // Criar usuário thalles com dados completos
  const thallesUser = await createUserInDatabase({
    username: 'thalles',
    email: 'thallesdanielcs@gmail.com',
    role: 'admin',
    cargo: 'Administrador',
    password: 'v123x9ll'
  });
  
  // Atualizar thalles com dados completos
  if (thallesUser) {
    await updateUserWithCompleteData(thallesUser.id, {
      nome_completo: 'Thalles Daniel',
      telefone: '+55 (11) 99999-9999',
      biografia: 'Administrador do sistema Boodesk com foco em gestão de projetos e equipes.',
      fuso_horario: 'America/Sao_Paulo',
      pais: 'BR',
      tipo_localizacao: 'brasil',
      cidade: 'Pouso Alegre',
      estado: 'MG'
    });
  }
  
  await createUserInDatabase({
    username: 'user',
    email: 'user@boodesk.com',
    role: 'user',
    cargo: 'Usuário',
    password: 'user123'
  });
  
  await createUserInDatabase({
    username: 'manager',
    email: 'manager@boodesk.com',
    role: 'manager',
    cargo: 'Gerente',
    password: 'manager123'
  });
  
  if (adminUser) {
    console.log('✅ Usuários padrão garantidos no banco');
    return adminUser;
  }
  
  return null;
};

// Função auxiliar para atualizar usuário com dados completos
const updateUserWithCompleteData = async (userId: number, data: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      console.error('Erro ao atualizar dados completos do usuário:', error);
    } else {
      console.log('✅ Dados completos atualizados para usuário ID:', userId);
    }
  } catch (error) {
    console.error('Erro inesperado ao atualizar dados completos:', error);
  }
};
