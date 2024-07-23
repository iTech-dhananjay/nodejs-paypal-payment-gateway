import express from 'express';
import cors from 'cors';
import paymentGatewayModule from './modules/payment-gateway/index.js';
import { logInfo } from './utils/logger.js';

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the module with the app instance
paymentGatewayModule.init(app);

// Route to get the API key
app.get('/api/getkey', (req, res) => {
    const apiKey = process.env.RAZORPAY_API_KEY;
    if (apiKey) {
        res.status(200).json({ key: apiKey });
    } else {
        res.status(500).json({ error: 'API key not found' });
    }
});

export default app;