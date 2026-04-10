import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
    name: 'profile',
    initialState: {},
    reducers: {
        setprofile: (_state, action) => {
            return action.payload;
        },

        removeprofile: (state) => {
            return {};
        }
    },
});

export const { setprofile, removeprofile } = profileSlice.actions;
export default profileSlice.reducer;
    