import { create } from 'zustand';
import api from '../utils/api';
import { calculateDynamicCosts } from '../utils/imageAnalysis';

const GST_RATE = 0.18;

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;
  
  return { subtotal, gst, total };
};

const useCostStore = create((set, get) => ({
  costItems: [],
  isLoading: false,
  error: null,
  estimationNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
  issueDate: new Date().toLocaleDateString('en-IN'),

  // Sync costs with the AI Scan Analysis
  syncWithScanResult: (analysis) => {
    const baseItems = get().costItems;
    if (baseItems.length === 0) return;

    const dynamicData = calculateDynamicCosts(analysis, baseItems);
    set({ costItems: dynamicData.costItems });
  },

  // Initialize real-time costs from Backend
  initializeRealTimeCosts: async () => {
    if (get().costItems.length > 0 && !get().error) return; // Prevent double fetch if already synced

    set({ isLoading: true, error: null });
    
    try {
      const allPricing = await api.get('/pricing');
      
      if (!allPricing || !Array.isArray(allPricing)) {
        throw new Error('Invalid pricing data received from server');
      }

      // Map backend pricing to cost items
      const items = allPricing
        .filter(p => p.category === 'material' || p.category === 'labor')
        .map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          quantity: p.id === 'material' ? 2 : 1, 
          unit: p.unit,
          unitPrice: p.unitPrice,
          total: (p.id === 'material' ? 2 : 1) * p.unitPrice
        }));

      // Add standard items if missing
      if (items.length < 3) {
        items.push({ id: 'equip', name: 'Equipment Cost', quantity: 1, unit: 'Set', unitPrice: 550, total: 550 });
        items.push({ id: 'rods', name: 'Welding Rods', quantity: 1, unit: 'Pack', unitPrice: 320, total: 320 });
      }

      set({ costItems: items, isLoading: false, error: null });
    } catch (err) {
      console.error('Error fetching backend pricing:', err);
      // Fallback to safety defaults
      const fallbackItems = [
        { id: 'material', name: 'Material Cost', description: 'Structural steel inserts', quantity: 2, unit: 'Units', unitPrice: 650, total: 1300 },
        { id: 'labor', name: 'Labor Charges', description: 'Certified Welder Ops', quantity: 1, unit: 'Job', unitPrice: 2800, total: 2800 },
        { id: 'equip', name: 'Equipment Cost', description: 'Welding Rig Rental', quantity: 1, unit: 'Set', unitPrice: 550, total: 550 },
        { id: 'rods', name: 'Welding Rods', description: 'E7018 Electrodes', quantity: 1, unit: 'Pack', unitPrice: 320, total: 320 }
      ];
      set({ 
        costItems: fallbackItems, 
        error: 'Offline - using estimated rates', 
        isLoading: false 
      });
    }
  },

  // Update individual cost item
  updateCostItem: (itemId, updates) => {
    set((state) => {
      const updatedItems = state.costItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates };
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      });
      return { costItems: updatedItems };
    });
  },

  // Get current totals
  getTotals: () => {
    const items = get().costItems;
    return calculateTotals(items);
  },

  // Reset to defaults
  reset: () => {
    set({
      costItems: [],
      estimationNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
      issueDate: new Date().toLocaleDateString('en-IN')
    });
  },

  // Cleanup
  cleanup: () => {}
}));

export default useCostStore;
