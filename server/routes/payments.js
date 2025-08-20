const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock database connection - replace with actual database connection
// const db = require('../config/database');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

// Stripe webhook signature verification middleware
const verifyStripeSignature = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook not properly configured' });
  }

  try {
    req.stripeEvent = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    next();
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }
};

// Validation middleware
const validateSubscription = [
  body('priceId').trim().isLength({ min: 1 }).withMessage('Price ID is required'),
  body('paymentMethodId').optional().trim().isLength({ min: 1 }).withMessage('Payment method ID cannot be empty')
];

const validatePaymentIntent = [
  body('amount').isInt({ min: 50 }).withMessage('Amount must be at least $0.50'),
  body('currency').isIn(['usd', 'cad', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
];

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  premium_monthly: {
    name: 'Premium Monthly',
    description: 'Premium features with monthly billing',
    features: ['Unlimited catches', 'Weather forecasts', 'Export data', 'Priority support']
  },
  premium_yearly: {
    name: 'Premium Yearly',
    description: 'Premium features with yearly billing (2 months free)',
    features: ['Unlimited catches', 'Weather forecasts', 'Export data', 'Priority support']
  }
};

// POST /api/payments/create-customer - Create Stripe customer
router.post('/create-customer', authenticateToken, async (req, res) => {
  try {
    // TODO: Check if customer already exists
    // const result = await db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
    // const user = result.rows[0];
    
    // if (user.stripe_customer_id) {
    //   return res.json({ customerId: user.stripe_customer_id });
    // }

    // Get user info for customer creation
    // const userResult = await db.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [req.userId]);
    // const userData = userResult.rows[0];

    // Mock user data for development
    const userData = {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`,
      metadata: {
        userId: req.userId.toString()
      }
    });

    // TODO: Save customer ID to database
    // await db.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, req.userId]);

    res.json({
      customerId: customer.id
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// POST /api/payments/create-setup-intent - Create setup intent for saving payment methods
router.post('/create-setup-intent', authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // TODO: Get customer ID from database
    // const result = await db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
    // let customerId = result.rows[0]?.stripe_customer_id;

    let customerId = `cus_mock_${req.userId}`;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: req.userId.toString()
        }
      });
      customerId = customer.id;
      
      // TODO: Save customer ID to database
      // await db.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, req.userId]);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session'
    });

    res.json({
      clientSecret: setupIntent.client_secret
    });

  } catch (error) {
    console.error('Create setup intent error:', error);
    res.status(500).json({ error: 'Failed to create setup intent' });
  }
});

// POST /api/payments/create-subscription - Create subscription
router.post('/create-subscription', authenticateToken, validateSubscription, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const { priceId, paymentMethodId } = req.body;

    // TODO: Get customer ID from database
    let customerId = `cus_mock_${req.userId}`;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: req.userId.toString()
        }
      });
      customerId = customer.id;
    }

    // Attach payment method to customer if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // TODO: Save subscription info to database
    // await db.query(`
    //   INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, created_at)
    //   VALUES ($1, $2, $3, $4, $5, $6, NOW())
    //   ON CONFLICT (user_id) DO UPDATE SET
    //     stripe_subscription_id = $2,
    //     stripe_price_id = $3,
    //     status = $4,
    //     current_period_start = $5,
    //     current_period_end = $6,
    //     updated_at = NOW()
    // `, [
    //   req.userId,
    //   subscription.id,
    //   priceId,
    //   subscription.status,
    //   new Date(subscription.current_period_start * 1000),
    //   new Date(subscription.current_period_end * 1000)
    // ]);

    // Update user premium status
    // await db.query('UPDATE users SET is_premium = true, subscription_expires_at = $1 WHERE id = $2', [
    //   new Date(subscription.current_period_end * 1000),
    //   req.userId
    // ]);

    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        clientSecret: subscription.latest_invoice.payment_intent?.client_secret
      }
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// POST /api/payments/create-payment-intent - Create one-time payment intent
router.post('/create-payment-intent', authenticateToken, validatePaymentIntent, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const { amount, currency, description } = req.body;

    // TODO: Get customer ID from database
    let customerId = `cus_mock_${req.userId}`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      description: description || 'Markyourfish purchase',
      metadata: {
        userId: req.userId.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// GET /api/payments/subscription - Get current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    // TODO: Get subscription from database
    // const result = await db.query(`
    //   SELECT stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, canceled_at
    //   FROM subscriptions WHERE user_id = $1
    // `, [req.userId]);

    // if (result.rows.length === 0) {
    //   return res.json({ subscription: null });
    // }

    // const subscription = result.rows[0];

    // Mock subscription for development
    const subscription = {
      stripe_subscription_id: 'sub_mock_123',
      stripe_price_id: 'price_mock_premium_monthly',
      status: 'active',
      current_period_start: new Date('2024-01-01'),
      current_period_end: new Date('2024-02-01'),
      canceled_at: null
    };

    // Get plan info
    const planKey = Object.keys(SUBSCRIPTION_PLANS).find(key => 
      subscription.stripe_price_id.includes(key.replace('_', '-'))
    );
    const planInfo = SUBSCRIPTION_PLANS[planKey] || { name: 'Unknown Plan', features: [] };

    res.json({
      subscription: subscription ? {
        id: subscription.stripe_subscription_id,
        priceId: subscription.stripe_price_id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        canceledAt: subscription.canceled_at,
        plan: planInfo
      } : null
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// POST /api/payments/cancel-subscription - Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // TODO: Get subscription from database
    // const result = await db.query('SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1', [req.userId]);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'No active subscription found' });
    // }
    // const subscriptionId = result.rows[0].stripe_subscription_id;

    const subscriptionId = 'sub_mock_123';

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // TODO: Update subscription in database
    // await db.query('UPDATE subscriptions SET canceled_at = NOW(), status = $1 WHERE user_id = $2', 
    //   [subscription.status, req.userId]);

    res.json({
      message: 'Subscription canceled successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// GET /api/payments/payment-methods - Get saved payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // TODO: Get customer ID from database
    let customerId = `cus_mock_${req.userId}`;

    if (!customerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }))
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// DELETE /api/payments/payment-methods/:id - Delete payment method
router.delete('/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const { id } = req.params;

    // Verify payment method belongs to user's customer
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    
    // TODO: Verify customer ownership
    // const result = await db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
    // const customerId = result.rows[0]?.stripe_customer_id;
    // if (paymentMethod.customer !== customerId) {
    //   return res.status(403).json({ error: 'Payment method not found' });
    // }

    await stripe.paymentMethods.detach(id);

    res.json({ message: 'Payment method removed successfully' });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

// GET /api/payments/invoices - Get billing history
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const { limit = 10 } = req.query;

    // TODO: Get customer ID from database
    let customerId = `cus_mock_${req.userId}`;

    if (!customerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: parseInt(limit)
    });

    res.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        amount: invoice.total / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        created: new Date(invoice.created * 1000),
        paidAt: invoice.paid ? new Date(invoice.status_transitions.paid_at * 1000) : null,
        hostedUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf
      }))
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// POST /api/payments/webhook - Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), verifyStripeSignature, async (req, res) => {
  try {
    const event = req.stripeEvent;

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object;
        // TODO: Update subscription in database
        // await db.query(`
        //   UPDATE subscriptions SET 
        //     status = $1, 
        //     current_period_start = $2, 
        //     current_period_end = $3,
        //     updated_at = NOW()
        //   WHERE stripe_subscription_id = $4
        // `, [
        //   subscription.status,
        //   new Date(subscription.current_period_start * 1000),
        //   new Date(subscription.current_period_end * 1000),
        //   subscription.id
        // ]);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        // TODO: Update user premium status
        // await db.query('UPDATE users SET is_premium = false WHERE stripe_customer_id = $1', 
        //   [deletedSubscription.customer]);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // TODO: Log successful payment
        console.log('Payment succeeded for invoice:', invoice.id);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        // TODO: Handle failed payment
        console.log('Payment failed for invoice:', failedInvoice.id);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payments/plans - Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // In production, you'd fetch prices from Stripe
    // const prices = await stripe.prices.list({ active: true });

    // Mock plans for development
    const plans = [
      {
        id: 'price_premium_monthly',
        name: 'Premium Monthly',
        description: 'Premium features with monthly billing',
        amount: 999, // $9.99
        currency: 'usd',
        interval: 'month',
        features: ['Unlimited catches', 'Weather forecasts', 'Export data', 'Priority support']
      },
      {
        id: 'price_premium_yearly',
        name: 'Premium Yearly',
        description: 'Premium features with yearly billing (2 months free)',
        amount: 9999, // $99.99
        currency: 'usd',
        interval: 'year',
        features: ['Unlimited catches', 'Weather forecasts', 'Export data', 'Priority support'],
        savings: '17%'
      }
    ];

    res.json({ plans });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

module.exports = router;