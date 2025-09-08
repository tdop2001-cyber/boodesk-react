// Serviço para consumir a API gratuita do IBGE
// Documentação: https://servicodados.ibge.gov.br/api/docs/localidades

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

class IBGEApiService {
  private baseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  /**
   * Busca todos os estados do Brasil
   */
  async getStates(): Promise<IBGEState[]> {
    const cacheKey = 'states';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/estados`);
      if (!response.ok) {
        throw new Error(`Erro na API do IBGE: ${response.status}`);
      }
      
      const states = await response.json();
      this.setCache(cacheKey, states);
      return states;
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      throw new Error('Erro ao carregar estados. Tente novamente.');
    }
  }

  /**
   * Busca todas as cidades de um estado específico
   */
  async getCitiesByState(stateId: number): Promise<IBGECity[]> {
    const cacheKey = `cities_${stateId}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/estados/${stateId}/municipios`);
      if (!response.ok) {
        throw new Error(`Erro na API do IBGE: ${response.status}`);
      }
      
      const cities = await response.json();
      this.setCache(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      throw new Error('Erro ao carregar cidades. Tente novamente.');
    }
  }

  /**
   * Busca todas as cidades do Brasil (pode ser lento)
   */
  async getAllCities(): Promise<IBGECity[]> {
    const cacheKey = 'all_cities';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/municipios`);
      if (!response.ok) {
        throw new Error(`Erro na API do IBGE: ${response.status}`);
      }
      
      const cities = await response.json();
      this.setCache(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error('Erro ao buscar todas as cidades:', error);
      throw new Error('Erro ao carregar cidades. Tente novamente.');
    }
  }

  /**
   * Busca cidades por nome (busca parcial)
   */
  async searchCities(query: string, stateId?: number): Promise<IBGECity[]> {
    try {
      let url = `${this.baseUrl}/municipios`;
      
      if (stateId) {
        url = `${this.baseUrl}/estados/${stateId}/municipios`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro na API do IBGE: ${response.status}`);
      }
      
      const cities = await response.json();
      
      // Filtrar cidades que contenham o termo de busca
      const filteredCities = cities.filter((city: IBGECity) =>
        city.nome.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredCities.slice(0, 50); // Limitar a 50 resultados para performance
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      throw new Error('Erro ao buscar cidades. Tente novamente.');
    }
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtém informações do cache
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância singleton
export const ibgeApi = new IBGEApiService();

// Função utilitária para converter dados do IBGE para o formato usado no sistema
export const convertIBGEToSystemFormat = {
  states: (ibgeStates: IBGEState[]) => {
    return ibgeStates.map(state => ({
      code: state.sigla,
      name: state.nome,
      id: state.id,
      region: state.regiao.nome
    }));
  },

  cities: (ibgeCities: IBGECity[]) => {
    return ibgeCities.map(city => ({
      id: city.id,
      name: city.nome,
      state: city.microrregiao.mesorregiao.UF.sigla,
      stateName: city.microrregiao.mesorregiao.UF.nome,
      microregion: city.microrregiao.nome,
      mesoregion: city.microrregiao.mesorregiao.nome
    }));
  }
};
