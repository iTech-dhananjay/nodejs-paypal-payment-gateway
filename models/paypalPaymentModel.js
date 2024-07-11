// models/paypalPaymentModel.js

import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: false,
    },
    payerId: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: false,
    },
    currency: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
    }
});

const PayPalPayment = mongoose.model('PayPalPayment', PaymentSchema);

export default PayPalPayment;