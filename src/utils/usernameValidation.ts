/**
 * Utilitários para validação e normalização de nomes de usuário
 */

/**
 * Normaliza um nome de usuário removendo acentos, espaços e convertendo para minúsculas
 * @param username - Nome de usuário a ser normalizado
 * @returns Nome de usuário normalizado
 */
export const normalizeUsername = (username: string): string => {
  return username
    .toLowerCase() // Converte para minúsculas
    .trim() // Remove espaços no início e fim
    .replace(/\s+/g, '') // Remove todos os espaços
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Valida se um nome de usuário está no formato correto
 * @param username - Nome de usuário a ser validado
 * @returns Objeto com isValid e message
 */
export const validateUsernameFormat = (username: string): { isValid: boolean; message: string } => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, message: 'Nome de usuário é obrigatório' };
  }

  const normalized = normalizeUsername(username);
  
  // Verifica se contém apenas letras, números e underscore
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return { 
      isValid: false, 
      message: 'Nome de usuário deve conter apenas letras minúsculas, números e underscore (_)' 
    };
  }

  // Verifica se tem pelo menos 3 caracteres
  if (normalized.length < 3) {
    return { 
      isValid: false, 
      message: 'Nome de usuário deve ter pelo menos 3 caracteres' 
    };
  }

  // Verifica se tem no máximo 20 caracteres
  if (normalized.length > 20) {
    return { 
      isValid: false, 
      message: 'Nome de usuário deve ter no máximo 20 caracteres' 
    };
  }

  // Verifica se não começa com número
  if (/^[0-9]/.test(normalized)) {
    return { 
      isValid: false, 
      message: 'Nome de usuário não pode começar com número' 
    };
  }

  return { isValid: true, message: 'Nome de usuário válido' };
};

/**
 * Verifica se o nome de usuário original precisa ser normalizado
 * @param originalUsername - Nome de usuário original
 * @returns true se precisa ser normalizado
 */
export const needsNormalization = (originalUsername: string): boolean => {
  const normalized = normalizeUsername(originalUsername);
  return originalUsername !== normalized;
};
