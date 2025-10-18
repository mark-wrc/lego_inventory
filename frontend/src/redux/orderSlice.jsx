import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderApi = createApi({
	reducerPath: 'orderApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api',
	}),
	tagTypes: ['Order'],

	endpoints: (builder) => ({
		// Create new order(s)
		createOrder: builder.mutation({
			query: (orderData) => ({
				url: '/orders/new',
				method: 'POST',
				body: orderData,
			}),
			invalidatesTags: ['Order'],
		}),

		// Get all orders
		getAllOrders: builder.query({
			query: () => '/orders',
			providesTags: ['Order'],
		}),

		// Get single order by ID
		getOrderById: builder.query({
			query: (id) => `/orders/${id}`,
			providesTags: (result, error, id) => [
				{
					type: 'Order',
					id,
				},
			],
		}),

		// Update an order
		updateOrder: builder.mutation({
			query: ({ id, ...updateData }) => ({
				url: `/orders/${id}`,
				method: 'PUT',
				body: updateData,
			}),
			invalidatesTags: (result, error, { id }) => [
				{
					type: 'Order',
					id,
				},
			],
		}),

		// Delete an order
		deleteOrder: builder.mutation({
			query: (id) => ({
				url: `/orders/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Order'],
		}),
	}),
});

export const {
	useCreateOrderMutation,
	useGetAllOrdersQuery,
	useGetOrderByIdQuery,
	useUpdateOrderMutation,
	useDeleteOrderMutation,
} = orderApi;
