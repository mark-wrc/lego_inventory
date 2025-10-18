import express from 'express';
import {
	createOrders,
	getAllOrders,
	getOrderById,
	updateOrder,
	deleteOrder,
} from '../controllers/OrderController.js';

const router = express.Router();

router.route('/orders').get(getAllOrders);
router.route('/orders/new').post(createOrders);
router
	.route('/orders/:id')
	.get(getOrderById)
	.put(updateOrder)
	.delete(deleteOrder);

export default router;
