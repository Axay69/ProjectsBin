import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
    // DevTools are enabled by default in Development mode with configureStore
    // But we can explicitly set it to __DEV__ as per instructions
    devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
