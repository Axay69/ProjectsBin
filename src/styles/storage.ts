import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'app-theme-storage' });
export const THEME_KEY = 'app.theme';
