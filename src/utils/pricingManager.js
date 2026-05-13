import { doc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize pricing collection with default values
 * Run this once to set up the pricing collection
 */
export const initializePricingCollection = async () => {
  try {
    const defaultPrices = {
      material: {
        name: 'Material Cost',
        description: 'High-grade structural steel plate inserts',
        quantity: 2,
        unit: 'Units',
        unitPrice: 600
      },
      labor: {
        name: 'Labor Charges',
        description: 'Certified Grade-A Welder (Site Visit + 3 hrs Ops)',
        quantity: 1,
        unit: 'Job',
        unitPrice: 2500
      },
      equipment: {
        name: 'Equipment Cost',
        description: 'Plasma cutter & specialized TIG welding rig',
        quantity: 1,
        unit: 'Set',
        unitPrice: 500
      },
      'welding-rods': {
        name: 'Welding Rods',
        description: 'E7018 low-hydrogen electrodes (Pack of 10)',
        quantity: 1,
        unit: 'Pack',
        unitPrice: 300
      }
    };

    for (const [id, data] of Object.entries(defaultPrices)) {
      await setDoc(doc(db, 'pricing', id), data);
      console.log(`✓ Initialized ${id} pricing`);
    }

    console.log('✓ Pricing collection initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing pricing collection:', error);
    throw error;
  }
};

/**
 * Update a specific pricing item
 * @param {string} itemId - Document ID (e.g., 'material', 'labor')
 * @param {object} updates - Fields to update (e.g., { unitPrice: 700, quantity: 3 })
 */
export const updatePricingItem = async (itemId, updates) => {
  try {
    await updateDoc(doc(db, 'pricing', itemId), updates);
    console.log(`✓ Updated ${itemId}:`, updates);
    return true;
  } catch (error) {
    console.error(`Error updating ${itemId}:`, error);
    throw error;
  }
};

/**
 * Add a new pricing item
 * @param {string} itemId - New document ID
 * @param {object} data - Item data structure
 */
export const addPricingItem = async (itemId, data) => {
  try {
    await setDoc(doc(db, 'pricing', itemId), data);
    console.log(`✓ Added new item: ${itemId}`);
    return true;
  } catch (error) {
    console.error(`Error adding ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete a pricing item
 * @param {string} itemId - Document ID to delete
 */
export const deletePricingItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'pricing', itemId));
    console.log(`✓ Deleted ${itemId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${itemId}:`, error);
    throw error;
  }
};

/**
 * Get all pricing items (one-time read, not real-time)
 */
export const getAllPricingItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pricing'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    console.log('✓ Retrieved all pricing items:', items);
    return items;
  } catch (error) {
    console.error('Error fetching pricing items:', error);
    throw error;
  }
};

/**
 * Bulk update multiple pricing items
 * @param {object} updates - Object with itemId as key and updates as value
 * Example: { material: { unitPrice: 700 }, labor: { unitPrice: 3000 } }
 */
export const bulkUpdatePricing = async (updates) => {
  try {
    const promises = Object.entries(updates).map(([itemId, data]) =>
      updateDoc(doc(db, 'pricing', itemId), data)
    );
    await Promise.all(promises);
    console.log('✓ Bulk update completed');
    return true;
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw error;
  }
};

/**
 * Calculate totals for given pricing items
 * @param {array} items - Array of pricing items
 * @returns {object} - { subtotal, gst, total }
 */
export const calculatePricingTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  return { subtotal, gst, total };
};

/**
 * Example usage in a React component or admin panel
 */
export const pricingManagerExamples = {
  // Initialize on first setup
  setupExample: async () => {
    await initializePricingCollection();
  },

  // Update single item
  updateExample: async () => {
    await updatePricingItem('material', { unitPrice: 700, quantity: 3 });
  },

  // Add new service category
  addNewItemExample: async () => {
    await addPricingItem('inspection', {
      name: 'Pre-Inspection Assessment',
      description: 'Quality check and damage assessment by certified technician',
      quantity: 1,
      unit: 'Visit',
      unitPrice: 1000
    });
  },

  // Bulk update during season changes
  bulkUpdateExample: async () => {
    await bulkUpdatePricing({
      material: { unitPrice: 650 },
      labor: { unitPrice: 2800 },
      equipment: { unitPrice: 550 }
    });
  }
};
