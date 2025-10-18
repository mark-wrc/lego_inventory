import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
	useCreateOrderMutation,
	useGetAllOrdersQuery,
} from '../redux/orderSlice.jsx';

const Orders = () => {
	const { darkMode } = useTheme();
	const navigate = useNavigate();
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [processedOrders, setProcessedOrders] = useState([]);

	const {
		data: ordersResponse,
		isLoading: isLoadingOrders,
		error: ordersError,
		refetch: refetchOrders,
	} = useGetAllOrdersQuery();

	const [createOrders, { isLoading: isCreating }] = useCreateOrderMutation();

	useEffect(() => {
		if (ordersError) console.error('Error loading orders:', ordersError);
	}, [ordersError]);

	const existingOrders = useMemo(() => {
		if (!ordersResponse) return [];

		if (Array.isArray(ordersResponse)) return ordersResponse;
		if (ordersResponse.data && Array.isArray(ordersResponse.data))
			return ordersResponse.data;
		if (ordersResponse.orders && Array.isArray(ordersResponse.orders))
			return ordersResponse.orders;

		console.warn('Unexpected orders response structure:', ordersResponse);
		return [];
	}, [ordersResponse]);

	// Helpers
	const convertExcelDate = (excelDate) => {
		if (!excelDate) return null;
		if (typeof excelDate === 'number') {
			const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
			return jsDate.toISOString().split('T')[0];
		}
		return excelDate;
	};

	const cleanCurrency = (value) => {
		if (!value) return 0;
		const cleaned = value.toString().replace(/[^\d.-]/g, '');
		return parseFloat(cleaned) || 0;
	};

	const cleanQuantity = (value) => {
		if (!value) return 0;
		if (typeof value === 'string')
			return parseInt(value.replace(/,/g, '')) || 0;
		return Number(value) || 0;
	};

	// Handle Excel upload
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			const dataBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(dataBuffer);
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				defval: null,
			});

			if (!jsonData.length) {
				alert('No data found in the file!');
				return;
			}

			const headers = jsonData[0];
			const allOrders = [];
			let currentOrder = null;
			let currentItems = [];

			for (let i = 1; i < jsonData.length; i++) {
				const row = jsonData[i];
				const rowData = {};
				headers.forEach((header, index) => {
					rowData[header] =
						row[index] !== undefined ? row[index] : null;
				});

				if (rowData['Order ID'] && rowData['Order ID'] !== '') {
					if (currentOrder)
						allOrders.push({
							orderData: currentOrder,
							items: [...currentItems],
						});

					currentOrder = {
						orderId: rowData['Order ID'],
						orderDate: convertExcelDate(rowData['Order Date']),
						seller: rowData['Seller'],
						baseCurrency: rowData['Base Currency'],
						shipping: cleanCurrency(rowData['Shipping']),
						insurance: cleanCurrency(rowData['Insurance']),
						addChrg1: cleanCurrency(rowData['Add Chrg 1']),
						addChrg2: cleanCurrency(rowData['Add Chrg 2']),
						credit: cleanCurrency(rowData['Credit']),
						couponCredit: cleanCurrency(rowData['Coupon Credit']),
						orderTotal: cleanCurrency(rowData['Order Total']),
						tax: cleanCurrency(rowData['Tax']),
						baseGrandTotal: cleanCurrency(
							rowData['Base Grand Total']
						),
						totalLots: cleanQuantity(rowData['Total Lots']),
						totalItems: cleanQuantity(rowData['Total Items']),
						orderStatus: rowData['Order Status'],
						orderStatusChanged: convertExcelDate(
							rowData['Order Status Changed']
						),
						pmtIn: rowData['Pmt In'],
						pmtMethod: rowData['Pmt Method'],
						orderNote: rowData['Order Note'],
						trackingNo: rowData['Tracking No'],
						location: rowData['Location'],
					};
					currentItems = [];

					if (
						rowData['Item Description'] &&
						rowData['Item Description'] !== ''
					) {
						currentItems.push({
							batch: rowData['Batch'],
							batchDate: convertExcelDate(rowData['Batch Date']),
							condition: rowData['Condition'],
							itemDescription: rowData['Item Description'],
							qty: cleanQuantity(rowData['Qty']),
							each: cleanCurrency(rowData['Each']),
							total: cleanCurrency(rowData['Total']),
							itemType: rowData['Item Type'],
							itemNumber: rowData['Item Number'],
							weight: rowData['Weight']
								? parseFloat(rowData['Weight'])
								: 0,
							invId: rowData['Inv ID'],
							subCondition: rowData['Sub-Condition'],
						});
					}
				} else if (
					currentOrder &&
					rowData['Item Description'] &&
					rowData['Item Description'] !== ''
				) {
					currentItems.push({
						batch: rowData['Batch'],
						batchDate: convertExcelDate(rowData['Batch Date']),
						condition: rowData['Condition'],
						itemDescription: rowData['Item Description'],
						qty: cleanQuantity(rowData['Qty']),
						each: cleanCurrency(rowData['Each']),
						total: cleanCurrency(rowData['Total']),
						itemType: rowData['Item Type'],
						itemNumber: rowData['Item Number'],
						weight: rowData['Weight']
							? parseFloat(rowData['Weight'])
							: 0,
						invId: rowData['Inv ID'],
						subCondition: rowData['Sub-Condition'],
					});
				}
			}

			if (currentOrder)
				allOrders.push({
					orderData: currentOrder,
					items: [...currentItems],
				});

			setProcessedOrders(allOrders);
			setShowUploadModal(false);

			if (allOrders.length > 0) {
				const shouldAutoSave = window.confirm(
					`Processed ${allOrders.length} orders. Save them now?`
				);
				if (shouldAutoSave) {
					handleCreateOrders(allOrders);
				}
			}
		} catch (err) {
			console.error(err);
			alert('Error processing file.');
		}
	};

	// FIXED: createOrders call
	const handleCreateOrders = async (ordersToCreate = processedOrders) => {
		if (!ordersToCreate.length) {
			alert('No orders to create!');
			return;
		}

		try {
			console.log('📦 Sending payload to backend:', ordersToCreate);

			// Check API behavior — if your backend expects { orders: [...] }, keep it.
			// Otherwise, send the array directly:
			const response = await createOrders(ordersToCreate).unwrap();

			console.log('✅ Server response:', response);
			alert(`Successfully created ${ordersToCreate.length} orders!`);
			setProcessedOrders([]);
			refetchOrders();
		} catch (error) {
			console.error('❌ Failed to create orders:', error);
			alert(
				error?.data?.message ||
					'Failed to create orders. Check console for details.'
			);
		}
	};

	const handleCardClick = (orderId) => navigate(`/orders/${orderId}`);

	const displayOrders = useMemo(() => {
		const processed = processedOrders.map((p) => ({
			...p,
			isProcessed: true,
			id: p.orderData.orderId,
		}));

		const existing = existingOrders.map((order) => {
			const orderData = order.orderData || order;
			const items = order.items || orderData.items || [];
			return {
				orderData: {
					...orderData,
					_id: order._id || orderData._id,
					orderId:
						orderData.orderId || orderData.orderID || orderData.id,
				},
				items,
				isProcessed: false,
				id: order._id || orderData._id || orderData.orderId,
			};
		});

		return [...processed, ...existing];
	}, [processedOrders, existingOrders]);

	return (
		<div
			className={`min-h-screen p-6 transition-colors ${
				darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
			}`}
		>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>Orders</h1>
				<button
					className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition'
					onClick={() => setShowUploadModal(true)}
				>
					<Plus size={18} /> Upload Excel
				</button>
			</div>

			{/* Upload Modal */}
			{showUploadModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
					<div
						className={`p-6 rounded-xl w-96 ${
							darkMode
								? 'bg-gray-800 text-white'
								: 'bg-white text-gray-900'
						}`}
					>
						<h2 className='text-lg font-semibold mb-4'>
							Upload Excel File
						</h2>
						<input
							type='file'
							accept='.xlsx, .xls'
							onChange={handleFileUpload}
							className='w-full mb-4'
						/>
						<div className='flex justify-end gap-3'>
							<button
								className='px-4 py-2 rounded-md bg-gray-500 text-white hover:opacity-80'
								onClick={() => setShowUploadModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Orders */}
			{isLoadingOrders ? (
				<p>Loading orders...</p>
			) : displayOrders.length === 0 ? (
				<p>No orders found.</p>
			) : (
				<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{displayOrders.map((order) => (
						<div
							key={order.id}
							onClick={() =>
								handleCardClick(
									order.orderData._id ||
										order.orderData.orderId
								)
							}
							className={`p-5 rounded-xl shadow-md cursor-pointer border transition hover:shadow-lg ${
								order.isProcessed
									? 'border-green-400 bg-green-50'
									: darkMode
									? 'border-gray-700 bg-gray-800'
									: 'border-gray-200 bg-white'
							}`}
						>
							<h2 className='text-lg font-semibold mb-1'>
								Order ID: {order.orderData.orderId}
							</h2>
							<p className='text-sm text-gray-500'>
								Seller: {order.orderData.seller || 'N/A'}
							</p>

							<p className='text-sm font-medium mt-2'>
								Total Parts: {order.items?.length || 0}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Orders;
