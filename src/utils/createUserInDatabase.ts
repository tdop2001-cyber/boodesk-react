import { supabase } from '../services/database';

export const createUserInDatabase = async (userData: {
  username: string;
  email: string;
  role: string;
  cargo: string;
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
        role: userData.role,
        cargo: userData.cargo,
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
  const adminUser = await createUserInDatabase({
    username: 'admin',
    email: 'admin@boodesk.com',
    role: 'admin',
    cargo: 'Administrador'
  });
  
  const userUser = await createUserInDatabase({
    username: 'user',
    email: 'user@boodesk.com',
    role: 'user',
    cargo: 'Usuário'
  });
  
  const managerUser = await createUserInDatabase({
    username: 'manager',
    email: 'manager@boodesk.com',
    role: 'manager',
    cargo: 'Gerente'
  });
  
  if (adminUser) {
    console.log('✅ Usuários padrão garantidos no banco');
    return adminUser;
  }
  
  return null;
};
