import { create } from 'zustand';
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from '../firebase';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  userProfile: null,
  isLoading: false,
  authMethod: null, // 'email' or 'google'
  phoneNumber: '',
  otpSent: false,
  otpVerified: false,
  error: null,
  isDemoMode: false,
  email: '',

  // FREE Email OTP Authentication (Backend Driven)
  requestOTP: async (email) => {
    set({ isLoading: true, error: null });

    if (!email || !email.includes('@')) {
      set({ error: 'Please enter a valid email address', isLoading: false });
      return false;
    }

    try {
      const response = await api.post('/auth/request-otp', { email });
      
      set({
        email,
        otpSent: true,
        authMethod: 'email',
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to send OTP. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  verifyOTP: async (enteredOtp, userData = {}) => {
    set({ isLoading: true, error: null });
    const { email } = get();

    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp: enteredOtp,
        userData: {
          displayName: userData.name,
          workshopName: userData.workshopName,
          specialization: userData.specialization,
          phoneNumber: userData.phone
        }
      });

      const { user, token } = response;

      const userProfile = {
        name: user.displayName,
        title: user.specialization || 'Welding Specialist',
        id: user.id,
        email: user.email,
        workshopName: user.workshopName,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0XWfLufJOy_Kq5oVd5WI4Ne95bOWjng086gDDCkbVjSCFUPqRv5Zo2THmajG7CHeWhPSh5HXZsMt7Zrsw7YIzMmYVAyZ_usefvv5-ZbL7Ua5q2eiFOJuEj8ZXqmW31_MwNcCMCSBrtuzSte-BrGe4DAHa_bkiitlDYbT15cIGpecnLJc2IpBDj8Pdv_gk66-yX-0FY1f_D_v-rfoYRbtEdYOy2NaFPwxvz9cqgBv03q8iKftV-9Q2WN7Cifb5znZuAOlWxoLmtWWo',
        token
      };

      set({
        isAuthenticated: true,
        userProfile,
        otpVerified: true,
        isLoading: false,
        error: null
      });

      localStorage.setItem('smartweld_auth', JSON.stringify({
        isAuthenticated: true,
        userProfile,
        authMethod: 'email',
        timestamp: Date.now()
      }));

      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Invalid OTP. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  // Google OAuth with real Firebase
  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Sync with our PostgreSQL Backend
      let backendData;
      try {
        backendData = await api.post('/auth/register', {
          phoneNumber: user.phoneNumber || '',
          email: user.email,
          displayName: user.displayName || 'Google User',
          firebaseUid: user.uid
        });
      } catch (err) {
        // If already registered, try login
        backendData = await api.post('/auth/login', {
          email: user.email,
          firebaseUid: user.uid
        });
      }

      const userProfile = {
        name: backendData.user.displayName || user.displayName || 'Google User',
        title: 'Verified Welding Specialist',
        id: backendData.user.id,
        email: user.email,
        avatar: user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0XWfLufJOy_Kq5oVd5WI4Ne95bOWjng086gDDCkbVjSCFUPqRv5Zo2THmajG7CHeWhPSh5HXZsMt7Zrsw7YIzMmYVAyZ_usefvv5-ZbL7Ua5q2eiFOJuEj8ZXqmW31_MwNcCMCSBrtuzSte-BrGe4DAHa_bkiitlDYbT15cIGpecnLJc2IpBDj8Pdv_gk66-yX-0FY1f_D_v-rfoYRbtEdYOy2NaFPwxvz9cqgBv03q8iKftV-9Q2WN7Cifb5znZuAOlWxoLmtWWo',
        token: backendData.token
      };

      set({
        isAuthenticated: true,
        userProfile,
        authMethod: 'google',
        isLoading: false,
        error: null
      });

      // Store auth state
      localStorage.setItem('smartweld_auth', JSON.stringify({
        isAuthenticated: true,
        userProfile,
        authMethod: 'google',
        timestamp: Date.now()
      }));

      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked by browser. Please allow popups.';
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Initialize auth state from localStorage
  initializeAuth: () => {
    const storedAuth = localStorage.getItem('smartweld_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        const AUTH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
        const isExpired = Date.now() - authData.timestamp > AUTH_EXPIRY_MS;

        if (!isExpired && authData.isAuthenticated) {
          set({
            isAuthenticated: true,
            userProfile: authData.userProfile,
            authMethod: authData.authMethod || 'phone'
          });
        } else {
          // Clear expired auth
          localStorage.removeItem('smartweld_auth');
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('smartweld_auth');
      }
    }
  },

  logout: () => {
    localStorage.removeItem('smartweld_auth');
    localStorage.removeItem('smartweld_otp');
    localStorage.removeItem('smartweld_phone');
    set({
      isAuthenticated: false,
      userProfile: null,
      authMethod: null,
      phoneNumber: '',
      otpSent: false,
      otpVerified: false,
      error: null
    });
  },

  // Reset auth state (for switching between methods)
  resetAuth: () => set({
    authMethod: null,
    phoneNumber: '',
    otpSent: false,
    otpVerified: false,
    error: null,
    confirmationResult: null
  })
}));

export default useAuthStore;
