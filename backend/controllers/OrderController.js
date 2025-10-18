import Order from '../models/Order.js';
import OrderDetails from '../models/OrderDetails.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import { customErrorHandler } from '../utils/customErrorHandler.js';

// Create multiple orders
export const createOrders = catchAsyncError(async (req, res, next) => {
	const orders = req.body;

	if (!orders || !Array.isArray(orders)) {
		return next(
			new customErrorHandler(
				'Invalid request body, expected array of orders',
				400
			)
		);
	}

	const createdOrders = [];
	const skippedOrders = [];

	for (const orderObj of orders) {
		const { orderData, items } = orderObj;

		// Validate required fields
		if (!orderData) {
			return next(
				new customErrorHandler(
					'orderData is required for each order',
					400
				)
			);
		}
		if (!items || !Array.isArray(items)) {
			return next(
				new customErrorHandler(
					'items array is required for each order',
					400
				)
			);
		}

		try {
			// Check if order already exists
			const existingOrder = await OrderDetails.findOne({
				orderId: orderData.orderId,
			});

			if (existingOrder) {
				skippedOrders.push(orderData.orderId);
				continue; // Skip duplicates
			}

			// Create new OrderDetails
			const orderDetails = await OrderDetails.create(orderData);

			// Deep copy of items so they’re not shared between orders
			const itemsCopy = items.map((item) => ({ ...item }));

			// Create Order linked to OrderDetails
			const order = await Order.create({
				orderData: orderDetails._id,
				items: itemsCopy,
			});

			createdOrders.push(order);
		} catch (err) {
			// Handle duplicate orderId error
			if (err.code === 11000 && err.keyPattern?.orderId) {
				skippedOrders.push(orderData.orderId);
				continue;
			}
			return next(err);
		}
	}

	res.status(201).json({
		success: true,
		message: 'Orders processed successfully',
		createdCount: createdOrders.length,
		skippedCount: skippedOrders.length,
		skippedOrders,
		orders: createdOrders,
	});
});

// Get all orders
export const getAllOrders = catchAsyncError(async (req, res, next) => {
	const orders = await Order.find().populate('orderData');
	res.status(200).json({ success: true, orders });
});

// Get single order by ID
export const getOrderById = catchAsyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate('orderData');
	if (!order) return next(new customErrorHandler('Order not found', 404));
	res.status(200).json({ success: true, order });
});

// Update an order
export const updateOrder = catchAsyncError(async (req, res, next) => {
	const { orderData, items } = req.body;
	const order = await Order.findById(req.params.id);

	if (!order) return next(new customErrorHandler('Order not found', 404));

	// Update OrderDetails
	if (orderData) {
		try {
			await OrderDetails.findByIdAndUpdate(order.orderData, orderData, {
				new: true,
				runValidators: true,
			});
		} catch (err) {
			if (
				err.code === 11000 &&
				err.keyPattern &&
				err.keyPattern.orderId
			) {
				return next(
					new CustomError(
						`Duplicate orderId: ${orderData.orderId}`,
						400
					)
				);
			}
			return next(err);
		}
	}

	// Update items
	if (items) {
		order.items = items;
		await order.save();
	}

	const updatedOrder = await Order.findById(req.params.id).populate(
		'orderData'
	);
	res.status(200).json({
		success: true,
		message: 'Order updated successfully',
		order: updatedOrder,
	});
});

// Delete an order
export const deleteOrder = catchAsyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) return next(new customErrorHandler('Order not found', 404));

	// Delete associated OrderDetails
	await OrderDetails.findByIdAndDelete(order.orderData);

	// Delete order
	await order.deleteOne();

	res.status(200).json({
		success: true,
		message: 'Order deleted successfully',
	});
});
