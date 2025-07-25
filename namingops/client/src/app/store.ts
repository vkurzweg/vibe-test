import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import nameRequestReducer from '../features/nameRequests/nameRequestSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nameRequests: nameRequestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for non-serializable values like Dates
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
