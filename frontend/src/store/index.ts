import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../modules/auth/authSlice'
import notificationsReducer from '../modules/notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
