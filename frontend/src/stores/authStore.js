// Auth store for managing authentication state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../utils/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Get Firestore instance
const db = getFirestore();

// Create store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      authInitialized: false,
      authListener: null,

      // Initialize auth state from Firebase
      initializeAuth: () => {
        // Don't reinitialize if already done
        if (get().authListener) return get().authListener;
        
        // Mark as initialized to prevent multiple listeners
        set({ authInitialized: true });
        
        // Create a persistent listener for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is logged in - set basic auth immediately
            set({ 
              isAuthenticated: true,
              isLoading: true
            });
            
            try {
              // Get additional user data from Firestore
              const userRef = doc(db, "users", user.uid);
              const docSnap = await getDoc(userRef);
              
              if (docSnap.exists()) {
                // We have user data in Firestore
                const userData = docSnap.data();
                
                set({ 
                  user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData.displayName,
                    photoURL: user.photoURL || userData.photoURL,
                    emailVerified: user.emailVerified,
                    userType: userData.userType,
                    onboardingCompleted: userData.onboardingCompleted || false,
                  }, 
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
              } else {
                // No Firestore data yet, just use Firebase auth data
                set({ 
                  user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    onboardingCompleted: false,
                  }, 
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
              }
            } catch (err) {
              console.error("Error fetching user data:", err);
              // Fallback to basic user info
              set({ 
                user: {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified,
                }, 
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
            }
          } else {
            // User is not logged in
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        });
        
        // Store the listener reference and return unsubscribe function
        set({ authListener: unsubscribe });
        return unsubscribe;
      },

      // Set user on login/signup
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      }),
      
      // Update user properties
      updateUser: (userData) => set(state => ({
        user: state.user ? { ...state.user, ...userData } : userData
      })),

      // Clear user on logout
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        error: null
      }),
      
      // Clean up auth listener
      cleanup: () => {
        const listener = get().authListener;
        if (listener && typeof listener === 'function') {
          listener();
          set({ authListener: null });
        }
      },

      // Set error
      setError: (error) => set({ error, isLoading: false }),

      // Set loading state
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'auth-storage', // name of the item in storage
      getStorage: () => localStorage, // storage engine (defaults to localStorage)
    }
  )
);

export default useAuthStore;