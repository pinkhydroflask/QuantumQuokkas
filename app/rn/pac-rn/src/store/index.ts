import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  // Policy settings
  textRules: string[];
  imageRules: string[];
  locationFuzzRadius: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTextRules: (rules: string[]) => void;
  setImageRules: (rules: string[]) => void;
  setLocationFuzzRadius: (radius: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      textRules: ['EMAIL', 'PHONE', 'ADDRESS', 'NAME', 'ID', 'CARD'],
      imageRules: ['FACE', 'PLATE', 'DOCUMENT'],
      locationFuzzRadius: 100,
      isLoading: false,
      error: null,
      
      // Actions
      setTextRules: (rules) => set({ textRules: rules }),
      setImageRules: (rules) => set({ imageRules: rules }),
      setLocationFuzzRadius: (radius) => set({ locationFuzzRadius: radius }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      resetError: () => set({ error: null }),
    }),
    {
      name: 'pac-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAppStore;
