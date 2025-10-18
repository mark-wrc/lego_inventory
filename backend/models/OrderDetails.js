import mongoose from 'mongoose';

const OrderDetailsSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    seller: String,
    baseCurrency: String,
    shipping: Number,
    orderTotal: {
      amount: Number,
      currency: String,
    },
    tax: {
      amount: Number,
      currency: String,
    },
    baseGrandTotal: {
      amount: Number,
      currency: String,
    },
    totalLots: Number,
    totalItems: Number,
    payment: {
      pmtIn: String,
      pmtMethod: String,
    },
    orderNote: String,
    trackingNo: String,
    location: String,
  },
  { timestamps: true }
);

const OrderDetails = mongoose.model('OrderDetails', OrderDetailsSchema);
export default OrderDetails;
