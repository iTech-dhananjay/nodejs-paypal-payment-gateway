// routes/paymentRoutes.js
import { Router } from 'express';
const router = Router();
import { createPayment, executePayment } from '../controllers/paypalPaymentController.js'
import paypal from 'paypal-rest-sdk';


router.post('/create-payment', createPayment);
router.post('/execute-payment', executePayment);

export default router;
