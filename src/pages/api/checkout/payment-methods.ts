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

// This route must be server-rendered
export const prerender = false;

import type { APIRoute } from 'astro';
import { getGatewaysForCountry } from '../../../lib/payments/config';

// Snipcart sends this payload when requesting payment methods
interface SnipcartPaymentRequest {
  invoice: {
    shippingAddress: {
      country?: string;
    };
    billingAddress: {
      country?: string;
    };
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
    
    // Log for debugging
    console.log('[payment-methods] Received request from Snipcart');
    console.log('[payment-methods] Mode:', body.mode);
    console.log('[payment-methods] Amount:', body.invoice.amount, body.invoice.currency);
    console.log('[payment-methods] Billing Country:', body.invoice.billingAddress?.country);
    console.log('[payment-methods] Public Token:', body.publicToken?.substring(0, 20) + '...');

    // Get customer's country (prefer billing, fallback to shipping)
    const customerCountry = body.invoice.billingAddress?.country || 
                           body.invoice.shippingAddress?.country || 
                           'IN'; // Default to India for now
    
    console.log('[payment-methods] Selected country:', customerCountry);

    // Get the base URL for the checkout page
    // DEPLOY_PRIME_URL is provided by Netlify for both preview and production
    // This enables free, unlimited Deploy Previews
    const siteUrl = import.meta.env.DEPLOY_PRIME_URL || 
                    import.meta.env.PUBLIC_SITE_URL || 
                    'http://localhost:4321';
    
    // Get available gateways for customer's country
    const availableGateways = getGatewaysForCountry(customerCountry);
    
    if (availableGateways.length === 0) {
      console.error('[payment-methods] No gateways available for country:', customerCountry);
      return new Response(JSON.stringify({ 
        error: `Payment is not available for your location (${customerCountry}). Please contact support.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map gateways to Snipcart payment methods
    const paymentMethods: PaymentMethod[] = availableGateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      checkoutUrl: `${siteUrl}/checkout/${gateway.id}`,
      // Future: Add gateway-specific icons
      // iconUrl: gateway.iconUrl
    }));

    console.log('[payment-methods] Returning', paymentMethods.length, 'payment methods');
    console.log('[payment-methods] Methods:', paymentMethods.map(m => m.id).join(', '));

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
