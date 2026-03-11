import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const userSlice = createSlice({
    name: 'user',
    initialState: localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token') || '') : {},
    reducers: {
        setUser: (_state, action) => {
            return action.payload;
        },

        removeUser: (state) => {
            return {};
        }
    },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
    