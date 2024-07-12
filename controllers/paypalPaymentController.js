import paypal from 'paypal-rest-sdk';
import {promisify} from 'util';
import dotenv from 'dotenv';
dotenv.config();
import PayPalPaymentModel from "../models/paypalPaymentModel.js";
paypal.configure({
    mode: process.env.PAYPAL_MODE,
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: "amount and currency are required" });
        }

        const createPaymentJson = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: "http://localhost:4009/api/success",
                cancel_url: "http://localhost:4009/api/cancel",
            },
            transactions: [
                {
                    amount: {
                        currency: currency,
                        total: amount,
                    },
                    description: "This is the payment description.",
                },
            ],
        };

        // Promisify the PayPal payment creation method
        const createPayment = promisify(paypal.payment.create.bind(paypal.payment));

        // Create the payment
        const payment = await createPayment(createPaymentJson);

        // Save the payment details in the database
        const newPayment = new PayPalPaymentModel({
            paymentId: payment.id,
           // payerId: payment.payer.payer_info.payer_id,
            payerId : null,
            amount: amount,
            currency: currency,
            status: payment.state,
        });

        await newPayment.save();

        res.json({ id: payment.id, links: payment.links });

        /*

              paypal.payment.create(createPaymentJson, async (error, payment) => {
            if (error) {
                console.error('Error creating PayPal payment:', error.response ? error.response : error);
                return res.status(500).json({ error: error.response ? error.response.message : 'Failed to create payment' });
            } else {
                // Save the payment details in the database
                const newPayment = new PayPalPaymentModel({
                    paymentId: payment.id,
                    //payerId: payment.payer.payer_info.payer_id,
                    amount: amount,
                    currency: currency,
                    status: payment.state,
                });

                await newPayment.save();

                res.json({ id: payment.id, links: payment.links });
            }
        });

       * */
    } catch (error) {
        console.error("Error creating PayPal payment:", error);
        res.status(500).json({ error: error.message || "Failed to create payment" });
    }
};



const executePayment = async (req, res) => {
    try {
        const { paymentId, payerId } = req.body;

        if (!paymentId || !payerId) {
            return res.status(400).json({ error: 'paymentId and payerId are required' });
        }

        const executePaymentJson = {
            payer_id: payerId,
        };

        const executePayment = promisify(paypal.payment.execute.bind(paypal.payment));
        const payment = await executePayment(paymentId, executePaymentJson);

        // Update the payment details in the database
        await PayPalPaymentModel.findOneAndUpdate(
              { paymentId: payment.id },
            { payerId: payment.payer.payer_info.payer_id, status: payment.state }
        );

        res.json({ success: true, payment });
    } catch (error) {
        console.error('Error executing PayPal payment:', error.response ? error.response : error);
        res.status(500).json({ error: error.response ? error.response.message : 'Failed to execute payment' });
    }
};

export { createPayment, executePayment };