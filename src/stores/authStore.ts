import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'auth-storage' });

const zustandStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => (storage as any).delete(name),
};

interface AuthState {
    providerEmail: string | null;
    setProviderEmail: (email: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            providerEmail: null,
            setProviderEmail: (email) => set({ providerEmail: email }),
            logout: () => set({ providerEmail: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
