// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { legoApi } from './apiSlice.js';
import { partApi } from './partSlice.js';
import { orderApi } from './orderSlice.jsx';

export const store = configureStore({
	reducer: {
		[legoApi.reducerPath]: legoApi.reducer,
		[partApi.reducerPath]: partApi.reducer,
		[orderApi.reducerPath]: orderApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			legoApi.middleware,
			partApi.middleware,
			orderApi.middleware
		),
});
