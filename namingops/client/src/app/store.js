import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import nameRequestReducer from '../features/nameRequests/nameRequestSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    nameRequests: nameRequestReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for non-serializable values like Dates
    })
});

export default store;
