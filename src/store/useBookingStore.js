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

const issuePricing = {
  'Broken Chassis': [
    { label: 'Labor Cost (Welding Specialist)', amount: 35 },
    { label: 'Materials & Consumables', amount: 10 },
    { label: 'Safety & Equipment Surcharge', amount: 3 },
    { label: 'Service Tax (GST 10%)', amount: 5 }
  ],
  'Pipeline Leak': [
    { label: 'Labor Cost (Welding Specialist)', amount: 1 },
    { label: 'Materials & Consumables', amount: 1 },
    { label: 'Safety & Equipment Surcharge', amount: 1 },
    { label: 'Service Tax (GST 10%)', amount: 1 }
  ],
  'Conveyor Rift': [
    { label: 'Labor Cost (Welding Specialist)', amount: 32 },
    { label: 'Materials & Consumables', amount: 9 },
    { label: 'Safety & Equipment Surcharge', amount: 280 },
    { label: 'Service Tax (GST 10%)', amount: 1 }
  ],
  'Other Critical': [
    { label: 'Labor Cost (Welding Specialist)', amount: 42 },
    { label: 'Materials & Consumables', amount: 15 },
    { label: 'Safety & Equipment Surcharge', amount: 420 },
    { label: 'Service Tax (GST 10%)', amount: 7 }
  ]
};

const getLineItemsForIssue = (issue) => issuePricing[issue] || defaultLineItems;

const useBookingStore = create((set, get) => ({
  booking: defaultBooking,
  userBookings: [],
  isLoading: false,
  error: null,

  setBooking: (patch) => {
    const current = get().booking;
    const updated = {
      ...current,
      ...patch
    };

    if (patch.issue) {
      const lineItems = getLineItemsForIssue(patch.issue);
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
