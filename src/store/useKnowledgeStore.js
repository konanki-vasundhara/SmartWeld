import { create } from 'zustand';
import api from '../utils/api';

const useKnowledgeStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchKnowledge: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/knowledge${queryParams ? `?${queryParams}` : ''}`;
      const data = await api.get(endpoint);
      set({ items: data, isLoading: false });
    } catch (error) {
      console.error('Fetch knowledge error:', error);
      set({ error: error.message, isLoading: false });
    }
  }
}));

export default useKnowledgeStore;
