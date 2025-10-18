import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	useGetOrderByIdQuery,
	useDeleteOrderMutation,
} from '../redux/orderSlice.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const ITEMS_PER_PAGE = 10;

const OrderDetails = () => {
	const { darkMode } = useTheme();
	const { id } = useParams();
	const navigate = useNavigate();

	// Fetch order data
	const { data, error, isLoading } = useGetOrderByIdQuery(id);
	const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

	const [currentPage, setCurrentPage] = useState(1);

	if (isLoading) return <p className='p-8 text-lg'>Loading...</p>;
	if (error) return <p className='p-8 text-red-500'>Error loading order.</p>;

	const order = data?.order;
	const items = order?.items || [];

	// Pagination logic
	const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
	const paginatedItems = items.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const handleDeleteOrder = async () => {
		const confirmDelete = window.confirm(
			`Are you sure you want to delete Order #${order?.orderId}?`
		);
		if (!confirmDelete) return;

		try {
			await deleteOrder(order._id || id).unwrap();
			alert('Order deleted successfully.');
			navigate('/orders');
		} catch (err) {
			console.error('Failed to delete order:', err);
			alert('Failed to delete order. Please try again.');
		}
	};

	return (
		<div
			className={`min-h-screen p-8 ${
				darkMode
					? 'bg-gray-900 text-gray-100'
					: 'bg-gray-100 text-gray-900'
			}`}
		>
			<div className='flex flex-col md:flex-row items-center justify-between mb-6 w-full'>
				<button
					onClick={() => navigate('/orders')}
					className='px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition'
				>
					Back
				</button>

				{/* Delete button - Right */}
				<button
					onClick={handleDeleteOrder}
					disabled={isDeleting}
					className='px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 mt-3 md:mt-0'
				>
					{isDeleting ? 'Deleting...' : 'Delete Order'}
				</button>
			</div>
			<h2 className='text-2xl font-semibold py-2 mb-4 md:mb-0'>
				Order Details - #{order?.orderData.orderId}
			</h2>

			{/* Order Summary */}
			<div
				className={`p-6 rounded-xl shadow-lg mb-8 ${
					darkMode ? 'bg-gray-800' : 'bg-white'
				}`}
			>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<p>
						<strong>Seller:</strong> {order?.orderData?.seller}
					</p>
					<p>
						<strong>Date:</strong>{' '}
						{new Date(order?.orderData?.orderDate).toDateString()}
					</p>
					<p>
						<strong>Location:</strong> {order?.orderData?.location}
					</p>
					<p>
						<strong className='pe-1'>Total Items:</strong>
						{order?.orderData?.totalItems}
					</p>
					<p>
						<strong>Grand Total:</strong> $
						{order?.orderData?.baseGrandTotal?.amount ??
							order?.baseGrandTotal}
					</p>
					<p>
						<strong>Order Status:</strong> {order?.orderStatus}
					</p>
				</div>
			</div>

			{/* Items Table */}
			<h3 className='text-xl font-semibold mb-4'>Items</h3>
			<div
				className={`overflow-x-auto rounded-xl shadow-lg ${
					darkMode ? 'bg-gray-800' : 'bg-white'
				}`}
			>
				<table className='min-w-full text-sm border-collapse'>
					<thead>
						<tr
							className={`${
								darkMode
									? 'bg-gray-700 text-gray-100'
									: 'bg-gray-200 text-gray-900'
							}`}
						>
							<th className='px-4 py-3 text-left'>#</th>
							<th className='px-4 py-3 text-left'>
								Item Description
							</th>
							<th className='px-4 py-3 text-left'>Qty</th>
							<th className='px-4 py-3 text-left'>Each ($)</th>
							<th className='px-4 py-3 text-left'>Total ($)</th>
							<th className='px-4 py-3 text-left'>Condition</th>
							<th className='px-4 py-3 text-left'>Type</th>
							<th className='px-4 py-3 text-left'>Item Number</th>
							<th className='px-4 py-3 text-left'>Weight</th>
						</tr>
					</thead>
					<tbody>
						{paginatedItems.length ? (
							paginatedItems.map((item, index) => (
								<tr
									key={index}
									className={`${
										darkMode
											? index % 2 === 0
												? 'bg-gray-800'
												: 'bg-gray-700'
											: index % 2 === 0
											? 'bg-white'
											: 'bg-gray-50'
									} border-b`}
								>
									<td className='px-4 py-3'>
										{(currentPage - 1) * ITEMS_PER_PAGE +
											index +
											1}
									</td>
									<td className='px-4 py-3 font-medium'>
										{item.itemDescription}
									</td>
									<td className='px-4 py-3'>{item.qty}</td>
									<td className='px-4 py-3'>
										{item.each?.amount ?? item.each}
									</td>
									<td className='px-4 py-3'>
										{item.total?.amount ?? item.total}
									</td>
									<td className='px-4 py-3'>
										{item.condition}
									</td>
									<td className='px-4 py-3'>
										{item.itemType}
									</td>
									<td className='px-4 py-3'>
										{item.itemNumber}
									</td>
									<td className='px-4 py-3'>{item.weight}</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan='9'
									className='text-center py-6 text-gray-500'
								>
									No items found for this order.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className='flex items-center justify-center mt-6 gap-3'>
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className='px-3 py-1 border rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50'
					>
						Previous
					</button>
					<span>
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className='px-3 py-1 border rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50'
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};

export default OrderDetails;
