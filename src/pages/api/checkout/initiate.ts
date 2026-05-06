/**
 * Razorpay Order Initiation Endpoint
 * 
 * Called from the payment page (pay.astro) to create a Razorpay order.
 * This must be done server-side because it requires the secret key.
 */

// This route must be server-rendered
export const prerender = false;

import type { APIRoute } from 'astro';

interface InitiateRequest {
  amount: number;        // Amount in currency subunits (paise for INR)
  currency: string;      // e.g., 'INR'
  receipt: string;       // Unique receipt ID (can use Snipcart order ID)
  paymentSessionId: string;  // Snipcart payment session ID
  customerEmail?: string;
  customerName?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: InitiateRequest = await request.json();
    
    console.log('[initiate] Creating Razorpay order');
    console.log('[initiate] Amount:', body.amount, body.currency);
    console.log('[initiate] Payment Session ID:', body.paymentSessionId);

    // Validate required fields
    if (!body.amount || !body.currency || !body.paymentSessionId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: amount, currency, paymentSessionId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Razorpay credentials
    const keyId = import.meta.env.PUBLIC_RAZORPAY_KEY_ID?.trim();
    const keySecret = import.meta.env.RAZORPAY_KEY_SECRET?.trim();
    
    console.log('[initiate] Key ID:', keyId ? `${keyId.substring(0, 12)}...` : 'MISSING');
    console.log('[initiate] Key Secret:', keySecret ? `${keySecret.substring(0, 8)}...` : 'MISSING');
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay API keys are not configured');
    }

    // Create Razorpay order using direct REST API instead of SDK
    // This bypasses potential SDK bugs
    const amountInPaise = Math.round(body.amount * 100);
    
    const orderData = {
      amount: amountInPaise,
      currency: body.currency.toUpperCase(),
      receipt: body.receipt || `snipcart_${body.paymentSessionId}`,
      notes: {
        snipcart_payment_session_id: body.paymentSessionId,
        customer_email: body.customerEmail || '',
        customer_name: body.customerName || '',
      }
    };
    
    console.log('[initiate] Creating order via REST API:', orderData);
    
    // Create Basic Auth header manually
    const authString = `${keyId}:${keySecret}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
    
    console.log('[initiate] Auth header created (first 20 chars):', authHeader.substring(0, 20) + '...');
    
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('[initiate] Razorpay API response status:', response.status);
      
      const responseText = await response.text();
      console.log('[initiate] Razorpay API response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Razorpay API returned ${response.status}: ${responseText}`);
      }
      
      const order = JSON.parse(responseText);
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
    } catch (rzpError: any) {
      console.error('[initiate] Razorpay API Error:', {
        message: rzpError.message,
        stack: rzpError.stack
      });
      throw rzpError;
    }

  } catch (error: any) {
    console.error('[initiate] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create Razorpay order',
      details: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Debug endpoint
export const GET: APIRoute = async () => {
  const hasKeyId = !!import.meta.env.PUBLIC_RAZORPAY_KEY_ID;
  const hasKeySecret = !!import.meta.env.RAZORPAY_KEY_SECRET;
  
  return new Response(JSON.stringify({ 
    message: 'Razorpay Order Initiation Endpoint',
    status: 'ready',
    config: {
      hasKeyId,
      hasKeySecret,
      keyIdPrefix: hasKeyId ? import.meta.env.PUBLIC_RAZORPAY_KEY_ID.substring(0, 8) + '...' : 'missing'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
