import { createSlice } from '@reduxjs/toolkit';

const jwtSlice = createSlice({
    name: 'jwt',
    initialState: localStorage.getItem('token') || null,
    reducers: {
        setToken: (_state, action) => {
            localStorage.setItem('token', action.payload);
            return action.payload;
        },
        clearToken: () => {
            localStorage.removeItem('token');
            return null;
        }
    },
});

export const { setToken, clearToken } = jwtSlice.actions;
export default jwtSlice.reducer;
    