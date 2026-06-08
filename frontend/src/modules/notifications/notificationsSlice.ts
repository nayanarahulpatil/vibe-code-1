import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { unreadCount: 0, items: [] as any[] },
  reducers: {
    setUnreadCount(state, action) { state.unreadCount = action.payload },
    setItems(state, action) { state.items = action.payload },
    markRead(state) { state.unreadCount = Math.max(0, state.unreadCount - 1) },
  },
})

export const { setUnreadCount, setItems, markRead } = notificationsSlice.actions
export default notificationsSlice.reducer
