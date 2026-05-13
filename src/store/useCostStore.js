import { create } from 'zustand';
import { db } from '../firebase';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';

const defaultCostItems = [
  {
    id: 'material',
    name: 'Material Cost',
    description: 'High-grade structural steel plate inserts',
    quantity: 2,
    unit: 'Units',
    unitPrice: 600,
    total: 1200
  },
  {
    id: 'labor',
    name: 'Labor Charges',
    description: 'Certified Grade-A Welder (Site Visit + 3 hrs Ops)',
    quantity: 1,
    unit: 'Job',
    unitPrice: 2500,
    total: 2500
  },
  {
    id: 'equipment',
    name: 'Equipment Cost',
    description: 'Plasma cutter & specialized TIG welding rig',
    quantity: 1,
    unit: 'Set',
    unitPrice: 500,
    total: 500
  },
  {
    id: 'welding-rods',
    name: 'Welding Rods',
    description: 'E7018 low-hydrogen electrodes (Pack of 10)',
    quantity: 1,
    unit: 'Pack',
    unitPrice: 300,
    total: 300
  }
];

const GST_RATE = 0.18;

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;
  
  return { subtotal, gst, total };
};

const useCostStore = create((set, get) => ({
  costItems: defaultCostItems,
  isLoading: false,
  error: null,
  unsubscribe: null,
  estimationNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
  issueDate: new Date().toLocaleDateString('en-IN'),

  // Initialize real-time listener
  initializeRealTimeCosts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to get real-time updates from Firestore
      const q = query(collection(db, 'pricing'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const items = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              name: data.name,
              description: data.description,
              quantity: data.quantity || 1,
              unit: data.unit || 'Unit',
              unitPrice: data.unitPrice || 0,
              total: (data.quantity || 1) * (data.unitPrice || 0)
            });
          });

          if (items.length > 0) {
            set({ costItems: items, isLoading: false });
          }
        } catch (err) {
          console.error('Error processing Firestore data:', err);
          set({ error: err.message, isLoading: false });
        }
      }, (error) => {
        console.error('Firestore listener error:', error);
        // Fall back to default if Firestore is not available
        set({ costItems: defaultCostItems, isLoading: false });
      });

      set({ unsubscribe, isLoading: false });
    } catch (err) {
      console.error('Error initializing real-time costs:', err);
      set({ error: err.message, isLoading: false, costItems: defaultCostItems });
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
      costItems: defaultCostItems,
      estimationNumber: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
      issueDate: new Date().toLocaleDateString('en-IN')
    });
  },

  // Cleanup listener
  cleanup: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  }
}));

export default useCostStore;
