import { createSlice } from '@reduxjs/toolkit'

const initialState = {

    currentUser: null,
    company: null,
    error: null,
    loading: false,
}

const userSlice = createSlice({

    name: 'user',
    initialState,
    reducers: {

        signInStart: (state) => {

            state.loading = true
        },

        signInSuccess: (state, action) => {

            state.currentUser = action.payload
            state.loading = false
            state.error = null
        },

        signInFailiure: (state, action) => {

            state.error = action.payload
            state.loading = false
        },

        signOutStart: (state) => {

            state.loading = true
        },

        signOutSuccess: (state) => {

            state.currentUser = null
            state.company = null
            state.loading = false
            state.error = null
        },

        signOutFailiure: (state, action) => {

            state.error = action.payload
            state.loading = false
        },

        addCompany: (state, action) => {

            state.company = action.payload
            state.error = null
            state.loading = false
        }
    }
})

export const {

    signInStart,
    signInSuccess,
    signInFailiure,
    signOutStart,
    signOutSuccess,
    signOutFailiure,
    addCompany,

} = userSlice.actions

export default userSlice.reducer