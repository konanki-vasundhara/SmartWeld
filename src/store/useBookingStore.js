import { create } from 'zustand';
import api from '../utils/api';

const defaultLineItems = [];

const calculateTotal = (items) => items.reduce((sum, item) => sum + item.amount, 0);

const defaultBooking = {
  issue: '',
  assetId: '',
  notes: '',
  locationName: '',
  coords: null,
  nearbyUnit: null,
  etaMinutes: 0,
  lineItems: defaultLineItems,
  amount: 0,
  paymentMethod: 'GPay',
  status: 'draft',
  createdAt: null,
  transactionId: null
};

const useBookingStore = create((set, get) => ({
  booking: defaultBooking,
  userBookings: [],
  issuePricing: {}, // Real-time pricing from backend
  isLoading: false,
  error: null,

  // Initialize issue pricing from Backend
  initializeBookingPricing: async () => {
    try {
      const prices = await api.get('/pricing/category/emergency_issue');
      const pricingMap = {};
      prices.forEach(p => {
        pricingMap[p.name] = p.metadata?.lineItems || [];
      });
      set({ issuePricing: pricingMap });
    } catch (err) {
      console.error('Failed to fetch booking pricing:', err);
    }
  },

  setBooking: (patch) => {
    const { booking, issuePricing } = get();
    const updated = {
      ...booking,
      ...patch
    };

    if (patch.issue) {
      const lineItems = issuePricing[patch.issue] || [];
      updated.lineItems = lineItems;
      updated.amount = calculateTotal(lineItems);
    }

    if (patch.lineItems) {
      updated.amount = calculateTotal(patch.lineItems);
    }

    set({ booking: updated });
  },

  resetBooking: () => set({ booking: defaultBooking }),

  fetchUserBookings: async (token) => {
    set({ isLoading: true });
    try {
      const bookings = await api.get('/bookings', token);
      set({ userBookings: bookings, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      set({ error: 'Failed to load bookings', isLoading: false });
    }
  },

  createBooking: async (token) => {
    const { booking } = get();
    set({ isLoading: true });

    try {
      const bookingData = {
        issue: booking.issue,
        description: booking.notes,
        location: {
          address: booking.locationName,
          coords: booking.coords
        },
        pricing: {
          lineItems: booking.lineItems,
          total: booking.amount
        },
        payment: {
          method: booking.paymentMethod,
          status: 'pending'
        },
        status: 'confirmed'
      };

      const result = await api.post('/bookings', bookingData, token);
      set((state) => ({
        userBookings: [result, ...state.userBookings],
        isLoading: false
      }));
      return result;
    } catch (error) {
      console.error('Failed to create booking:', error);
      set({ error: 'Failed to create booking', isLoading: false });
      throw error;
    }
  }
}));

export default useBookingStore;
