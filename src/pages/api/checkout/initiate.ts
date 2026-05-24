/**
 * Razorpay Order Initiation Endpoint
 * 
 * Called from the payment page (razorpay.astro) to create a Razorpay order.
 * This fetches the authoritative amount from Snipcart using the publicToken.
 */

// This route must be server-rendered
export const prerender = false;

import type { APIRoute } from 'astro';

interface InitiateRequest {
  publicToken: string;      // Snipcart public token for session fetching
  paymentSessionId: string;  // Snipcart payment session ID
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: InitiateRequest = await request.json();
    const { publicToken, paymentSessionId } = body;
    
    console.log('[initiate] Initiating secure Razorpay order');
    console.log('[initiate] Session ID:', paymentSessionId);

    // Validate required fields
    if (!publicToken || !paymentSessionId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: publicToken, paymentSessionId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Fetch authoritative session details from Snipcart
    console.log('[initiate] Fetching authoritative session from Snipcart...');
    const snipcartRes = await fetch(
      `https://payment.snipcart.com/api/public/custom-payment-gateway/payment-session?publicToken=${publicToken}`
    );

    if (!snipcartRes.ok) {
      const errorText = await snipcartRes.text();
      console.error('[initiate] Snipcart session fetch failed:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch payment session from Snipcart',
        details: errorText
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sessionData = await snipcartRes.json();
    
    // Cross-verify paymentSessionId to prevent token reuse across sessions
    if (sessionData.id !== paymentSessionId) {
       console.error('[initiate] Session ID mismatch!', {
         expected: paymentSessionId,
         received: sessionData.id
       });
       return new Response(JSON.stringify({ error: 'Session ID mismatch' }), { status: 403 });
    }

    const authoritativeAmount = sessionData.invoice.amount;
    const authoritativeCurrency = sessionData.invoice.currency;

    console.log('[initiate] Authoritative Amount:', authoritativeAmount, authoritativeCurrency);

    // 2. Initialize Razorpay credentials
    const keyId = import.meta.env.PUBLIC_RAZORPAY_KEY_ID?.trim();
    const keySecret = import.meta.env.RAZORPAY_KEY_SECRET?.trim();
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay API keys are not configured');
    }

    // 3. Create Razorpay order
    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(authoritativeAmount * 100);
    
    const orderData = {
      amount: amountInPaise,
      currency: authoritativeCurrency.toUpperCase(),
      receipt: `snipcart_${paymentSessionId.substring(0, 16)}`,
      notes: {
        snipcart_payment_session_id: paymentSessionId,
        customer_email: sessionData.invoice.email || '',
        customer_name: sessionData.invoice.billingAddress?.name || '',
      }
    };
    
    // Create Basic Auth header
    // Using btoa for broader compatibility as suggested in audit tips
    const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
    
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(orderData)
    });
    
    if (!rzpResponse.ok) {
      const errorText = await rzpResponse.text();
      console.error('[initiate] Razorpay API Error:', errorText);
      throw new Error(`Razorpay API returned ${rzpResponse.status}: ${errorText}`);
    }
    
    const order = await rzpResponse.json();
    console.log('[initiate] Razorpay order created:', order.id);
    
    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[initiate] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to initiate secure checkout',
      details: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
