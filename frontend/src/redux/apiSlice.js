import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const legoApi = createApi({
	reducerPath: 'legoApi',
	baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
	tagTypes: ['LegoSet'],

	endpoints: (builder) => ({
		getLegoSets: builder.query({
			query: () => '/legoset',
			method: 'GET',
			providesTags: ['LegoSet'],
		}),

		getSetById: builder.query({
			query: (id) => `/legoset/${id}`, // ensure your backend supports this route
			providesTags: (result, error, id) => [
				{
					type: 'LegoSet',
					id,
				},
			],
		}),

		createSet: builder.mutation({
			query: (newSet) => ({
				url: '/legoset/new',
				method: 'POST',
				body: newSet,
			}),
			invalidatesTags: ['LegoSet'], // refreshes getLegoSets automatically
		}),

		/* updateSet: builder.mutation({
			query: ({ id, setName, setDescription }) => ({
				url: `/legoset/${id}`,
				method: 'PUT',
				body: { setName, setDescription, x, y},
			}),
			invalidatesTags: ['LegoSet'],
		}), */
		updateSet: builder.mutation({
			query: ({
				id,
				setName,
				setDescription,
				numberOfSets,
				xValue,
				yValue,
			}) => ({
				url: `/legoset/${id}`,
				method: 'PUT',
				body: { setName, setDescription, numberOfSets, xValue, yValue },
			}),
			invalidatesTags: ['LegoSet'],
		}),

		deleteSet: builder.mutation({
			query: (id) => ({
				url: `/legoset/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['LegoSet'],
		}),

		updateSetImage: builder.mutation({
			query: ({ id, image }) => ({
				url: `/legoset/${id}/image`,
				method: 'PUT',
				body: { image }, // must be JSON
				headers: { 'Content-Type': 'application/json' },
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'LegoSet', id },
			],
		}),
	}),
});

export const {
	useGetLegoSetsQuery,
	useCreateSetMutation,
	useUpdateSetMutation,
	useDeleteSetMutation,
	useGetSetByIdQuery,
	useUpdateSetImageMutation,
} = legoApi;
