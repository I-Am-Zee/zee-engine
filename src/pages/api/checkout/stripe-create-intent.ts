/**
 * Stripe Create Payment Intent Endpoint
 * 
 * Creates a Stripe Payment Intent for processing payment
 * 
 * NOTE: This endpoint is ready but will return an error until you:
 * 1. npm install stripe
 * 2. Add STRIPE_SECRET_KEY to environment variables
 * 3. Enable stripe gateway in src/lib/payments/config.ts
 */

import type { APIRoute } from 'astro';

interface CreateIntentRequest {
  paymentSessionId: string;
  amount: number;
  currency: string;
  email: string;
}

// Try to load Stripe, but don't fail if it's not installed
let StripeClass: any = null;
let stripeLoadError: string | null = null;

try {
  // @ts-ignore - Stripe may not be installed yet
  const stripeModule = await import('stripe');
  StripeClass = stripeModule.default;
} catch (error) {
  stripeLoadError = 'Stripe package not installed. Run: npm install stripe';
  console.warn('[stripe-create-intent]', stripeLoadError);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
    
    // Check if Stripe is configured
    if (!stripeSecretKey) {
      console.error('[stripe-create-intent] STRIPE_SECRET_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if Stripe package is loaded
    if (!StripeClass || stripeLoadError) {
      console.error('[stripe-create-intent]', stripeLoadError);
      return new Response(JSON.stringify({ 
        error: stripeLoadError 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body: CreateIntentRequest = await request.json();
    
    console.log('[stripe-create-intent] Creating payment intent');
    console.log('[stripe-create-intent] Amount:', body.amount, body.currency);
    console.log('[stripe-create-intent] Session:', body.paymentSessionId);
    
    // Create Stripe instance
    const stripe = new StripeClass(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia' as any, // Use latest API version
    });
    
    // Convert amount to cents/smallest currency unit
    const amountInCents = Math.round(body.amount * 100);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: body.currency.toLowerCase(),
      receipt_email: body.email,
      metadata: {
        snipcartSessionId: body.paymentSessionId,
      },
    });
    
    console.log('[stripe-create-intent] Payment intent created:', paymentIntent.id);
    
    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('[stripe-create-intent] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create payment intent' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle GET for debugging
export const GET: APIRoute = async () => {
  const stripeConfigured = !!import.meta.env.STRIPE_SECRET_KEY;
  
  return new Response(JSON.stringify({ 
    message: 'Stripe Create Payment Intent Endpoint',
    status: stripeConfigured ? 'ready' : 'not configured',
    hint: stripeConfigured 
      ? 'POST with paymentSessionId, amount, currency, email' 
      : 'Add STRIPE_SECRET_KEY to environment variables'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
