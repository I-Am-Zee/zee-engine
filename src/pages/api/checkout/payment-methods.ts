/**
 * Snipcart Custom Payment Gateway - Payment Methods Endpoint
 * 
 * This endpoint is called by Snipcart when a customer reaches checkout.
 * It returns the available payment methods with their checkout URLs.
 * 
 * Configure in Snipcart Dashboard:
 *   Account → Payment Gateway → Custom Gateway
 *   Payment Methods URL: https://your-domain/api/checkout/payment-methods
 */

import type { APIRoute } from 'astro';

// Snipcart sends this payload when requesting payment methods
interface SnipcartPaymentRequest {
  invoice: {
    shippingAddress: object;
    billingAddress: object;
    email: string;
    language: string;
    currency: string;
    amount: number;
    targetId: string;
    items: Array<{
      name: string;
      unitPrice: number;
      quantity: number;
      type: string;
      amount: number;
    }>;
  };
  publicToken: string;
  mode: 'test' | 'live';
}

// Response format expected by Snipcart
interface PaymentMethod {
  id: string;
  name: string;
  checkoutUrl: string;
  iconUrl?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: SnipcartPaymentRequest = await request.json();
    
    // Log for debugging (helpful during ngrok testing)
    console.log('[payment-methods] Received request from Snipcart');
    console.log('[payment-methods] Mode:', body.mode);
    console.log('[payment-methods] Amount:', body.invoice.amount, body.invoice.currency);
    console.log('[payment-methods] Public Token:', body.publicToken?.substring(0, 20) + '...');

    // Optional: Validate the publicToken with Snipcart API
    // This ensures the request is genuinely from Snipcart
    /* 
    const isValid = await validateSnipcartToken(body.publicToken);
    if (!isValid) {
      console.error('[payment-methods] Invalid Snipcart token');
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    */

    // Get the base URL for the checkout page
    // In production, use PUBLIC_SITE_URL env var
    // During development with ngrok, this should be the ngrok URL
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
    
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'razorpay',
        name: 'Pay with Razorpay (UPI, Cards, Wallets)',
        checkoutUrl: `${siteUrl}/checkout/pay`,
        // Optional: Add Razorpay logo
        // iconUrl: 'https://razorpay.com/favicon.png'
      }
    ];

    console.log('[payment-methods] Returning checkout URL:', paymentMethods[0].checkoutUrl);

    return new Response(JSON.stringify(paymentMethods), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[payment-methods] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Validate the Snipcart public token
 * This confirms the request is genuinely from Snipcart
 */
async function validateSnipcartToken(publicToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://payment.snipcart.com/api/public/custom-payment-gateway/payment-session?publicToken=${publicToken}`
    );
    return response.ok;
  } catch (error) {
    console.error('[payment-methods] Token validation error:', error);
    // In development, you might want to skip validation
    // return true; // Uncomment for debugging
    return false;
  }
}

// Also handle GET for debugging
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    message: 'Snipcart Payment Methods Endpoint',
    status: 'ready',
    hint: 'This endpoint expects POST requests from Snipcart'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
