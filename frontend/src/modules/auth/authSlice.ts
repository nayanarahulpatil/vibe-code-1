import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const login = createAsyncThunk('auth/login', async (creds: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API}/auth/login`, creds)
    return data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

interface AuthState {
  token: string | null
  user: any | null
  loading: boolean
  error: string | null
}

const stored = localStorage.getItem('tems_auth')
const initial: AuthState = stored ? JSON.parse(stored) : { token: null, user: null, loading: false, error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('tems_auth')
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access_token
        state.user = action.payload.user
        localStorage.setItem('tems_auth', JSON.stringify({ token: state.token, user: state.user, loading: false, error: null }))
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
