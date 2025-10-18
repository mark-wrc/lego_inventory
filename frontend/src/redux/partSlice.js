import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const partApi = createApi({
	reducerPath: 'partApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api',
	}),
	tagTypes: ['Part'],

	endpoints: (builder) => ({
		// GET all parts
		getParts: builder.query({
			query: () => '/parts',
			method: 'GET',
			providesTags: ['Part'],
		}),

		// GET part by ID
		getPartById: builder.query({
			query: (id) => `/part/${id}`,
			method: 'GET',
			providesTags: (result, error, id) => [{ type: 'Part', id }],
		}),

		// CREATE new part
		createPart: builder.mutation({
			query: (newPart) => ({
				url: '/part/new',
				method: 'POST',
				body: newPart,
			}),
			invalidatesTags: ['Part'],
		}),

		// UPDATE part
		updatePart: builder.mutation({
			query: ({ id, ...updatedFields }) => ({
				url: `/part/${id}`,
				method: 'PUT',
				body: updatedFields,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Part', id }],
		}),

		// DELETE part
		deletePart: builder.mutation({
			query: (id) => ({
				url: `/part/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Part'],
		}),

		// UPLOAD part image
		updatePartImage: builder.mutation({
			query: ({ id, image }) => ({
				url: `/part/${id}/image`,
				method: 'PUT',
				body: { image },
				headers: { 'Content-Type': 'application/json' },
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Part', id }],
		}),
	}),
});
export const {
	useGetPartsQuery,
	useGetPartByIdQuery,
	useCreatePartMutation,
	useUpdatePartMutation,
	useDeletePartMutation,
	useUpdatePartImageMutation,
} = partApi;
