import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    name: string;
    email: string;
}

const initialState: UserState = {
    name: 'John Doe',
    email: 'john.doe@example.com',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ name: string; email: string }>) => {
            state.name = action.payload.name;
            state.email = action.payload.email;
        },
        updateName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        updateEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
    },
});

export const { setUser, updateName, updateEmail } = userSlice.actions;
export default userSlice.reducer;
