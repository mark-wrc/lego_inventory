import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
	{
		orderData: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'OrderDetails',
			required: true,
		},
		items: [
			{
				batch: Number,
				batchDate: Date,
				condition: {
					type: String,
					enum: ['New', 'Used'],
					default: 'New',
				},
				itemDescription: String,
				qty: Number,
				each: Number,
				total: Number,
				itemType: String,
				itemNumber: mongoose.Schema.Types.Mixed,
				weight: Number,
			},
		],
	},
	{ timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
