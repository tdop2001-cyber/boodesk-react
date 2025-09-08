/**
 * Mapeamento entre códigos de estados da API do IBGE e códigos internos do sistema
 */

// Mapeamento de códigos IBGE para códigos internos
export const ibgeToInternalStateMapping: Record<string, string> = {
  'AC': 'AC', // Acre
  'AL': 'AL', // Alagoas
  'AP': 'AP', // Amapá
  'AM': 'AM', // Amazonas
  'BA': 'BA', // Bahia
  'CE': 'CE', // Ceará
  'DF': 'DF', // Distrito Federal
  'ES': 'ESP', // Espírito Santo
  'GO': 'GO', // Goiás
  'MA': 'MAR', // Maranhão
  'MT': 'MT', // Mato Grosso
  'MS': 'MS', // Mato Grosso do Sul
  'MG': 'MG', // Minas Gerais
  'PA': 'PA', // Pará
  'PB': 'PB', // Paraíba
  'PR': 'PR', // Paraná
  'PE': 'PER', // Pernambuco
  'PI': 'PI', // Piauí
  'RJ': 'RJ', // Rio de Janeiro
  'RN': 'RN', // Rio Grande do Norte
  'RS': 'RS', // Rio Grande do Sul
  'RO': 'RON', // Rondônia
  'RR': 'RR', // Roraima
  'SC': 'SC', // Santa Catarina
  'SP': 'SP', // São Paulo
  'SE': 'SER', // Sergipe
  'TO': 'TO'  // Tocantins
};

// Mapeamento reverso: códigos internos para códigos IBGE
export const internalToIbgeStateMapping: Record<string, string> = {
  'AC': 'AC',
  'AL': 'AL',
  'AP': 'AP',
  'AM': 'AM',
  'BA': 'BA',
  'CE': 'CE',
  'DF': 'DF',
  'ESP': 'ES',
  'GO': 'GO',
  'MAR': 'MA',
  'MT': 'MT',
  'MS': 'MS',
  'MG': 'MG',
  'PA': 'PA',
  'PB': 'PB',
  'PR': 'PR',
  'PER': 'PE',
  'PI': 'PI',
  'RJ': 'RJ',
  'RN': 'RN',
  'RS': 'RS',
  'RON': 'RO',
  'RR': 'RR',
  'SC': 'SC',
  'SP': 'SP',
  'SER': 'SE',
  'TO': 'TO'
};

/**
 * Converte código IBGE para código interno
 */
export const convertIbgeToInternal = (ibgeCode: string): string => {
  return ibgeToInternalStateMapping[ibgeCode] || ibgeCode;
};

/**
 * Converte código interno para código IBGE
 */
export const convertInternalToIbge = (internalCode: string): string => {
  return internalToIbgeStateMapping[internalCode] || internalCode;
};
