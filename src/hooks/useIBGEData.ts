import { useState, useEffect, useCallback } from 'react';
import { ibgeApi, convertIBGEToSystemFormat, IBGEState, IBGECity } from '../services/ibgeApi';

export interface SystemState {
  code: string;
  name: string;
  id: number;
  region: string;
}

export interface SystemCity {
  id: number;
  name: string;
  state: string;
  stateName: string;
  microregion: string;
  mesoregion: string;
}

export interface UseIBGEDataReturn {
  states: SystemState[];
  cities: SystemCity[];
  loading: boolean;
  error: string | null;
  loadStates: () => Promise<void>;
  loadCitiesByState: (stateId: number) => Promise<void>;
  searchCities: (query: string, stateId?: number) => Promise<SystemCity[]>;
  clearError: () => void;
}

export const useIBGEData = (): UseIBGEDataReturn => {
  const [states, setStates] = useState<SystemState[]>([]);
  const [cities, setCities] = useState<SystemCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadStates = useCallback(async () => {
    if (states.length > 0) return; // Já carregado

    setLoading(true);
    setError(null);
    
    try {
      const ibgeStates = await ibgeApi.getStates();
      const systemStates = convertIBGEToSystemFormat.states(ibgeStates);
      setStates(systemStates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estados';
      setError(errorMessage);
      console.error('Erro ao carregar estados:', err);
    } finally {
      setLoading(false);
    }
  }, [states.length]);

  const loadCitiesByState = useCallback(async (stateId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const ibgeCities = await ibgeApi.getCitiesByState(stateId);
      const systemCities = convertIBGEToSystemFormat.cities(ibgeCities);
      setCities(systemCities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar cidades';
      setError(errorMessage);
      console.error('Erro ao carregar cidades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (query: string, stateId?: number): Promise<SystemCity[]> => {
    if (!query.trim()) return [];

    try {
      const ibgeCities = await ibgeApi.searchCities(query, stateId);
      return convertIBGEToSystemFormat.cities(ibgeCities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cidades';
      setError(errorMessage);
      console.error('Erro ao buscar cidades:', err);
      return [];
    }
  }, []);

  // Carregar estados automaticamente quando o hook é inicializado
  useEffect(() => {
    loadStates();
  }, [loadStates]);

  return {
    states,
    cities,
    loading,
    error,
    loadStates,
    loadCitiesByState,
    searchCities,
    clearError
  };
};
