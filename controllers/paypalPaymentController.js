import paypal from 'paypal-rest-sdk';
import PayPalPayment from '../models/paypalPaymentModel.js';

const createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: 'amount and currency are required' });
        }

        const createPaymentJson = {
            intent: 'sale',
            payer: {
                paymentMethod: 'paypal',
            },
            redirectUrls: {
                returnUrl: 'http://return.url',
                cancelUrl: 'http://cancel.url',
            },
            transactions: [{
                amount: {
                    currency: currency,
                    total: amount,
                },
                description: 'This is the payment description.',
            }],
        };

        const payment = await PayPalPayment.create(createPaymentJson);
        res.json({ id: payment.id, links: payment.links });
    } catch (error) {
        console.error('Error creating PayPal payment:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment' });
    }
};

const executePayment = async (req, res) => {
    try {
        const { paymentId, payerId } = req.body;

        if (!paymentId || !payerId) {
            return res.status(400).json({ error: 'paymentId and payerId are required' });
        }

        const executePaymentJson = {
            payerId: payerId,
        };

        const payment = await new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, executePaymentJson, (error, payment) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(payment);
                }
            });
        });

        if (!payment.id || !payment.payer.payerInfo.payerId || !payment.transactions[0].amount.total || !payment.transactions[0].amount.currency || !payment.state) {
            return res.status(400).json({ error: 'Incomplete PayPal payment data' });
        }

        const newPayment = new PayPalPayment({
            paymentId: payment.id,
            payerId: payment.payer.payerInfo.payerId,
            amount: payment.transactions[0].amount.total,
            currency: payment.transactions[0].amount.currency,
            status: payment.state,
        });

        await newPayment.save();
        res.json(payment);
    } catch (error) {
        console.error('Error executing PayPal payment:', error);
        res.status(500).json({ error: error.message || 'Failed to execute payment' });
    }
};

export { createPayment, executePayment };