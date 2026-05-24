/**
 * Razorpay Payment Verification Endpoint
 * 
 * Called after successful Razorpay payment to:
 * 1. Verify the payment signature (security check)
 * 2. Confirm the payment to Snipcart
 */

// This route must be server-rendered
export const prerender = false;

import type { APIRoute } from 'astro';
import crypto from 'crypto';

interface VerifyRequest {
  razorpay_order_id: string; 
  razorpay_payment_id: string;
  razorpay_signature: string; 
  paymentSessionId: string;  // Snipcart payment session ID
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: VerifyRequest = await request.json();
    
    console.log('[verify] Verifying Razorpay payment signature');
    console.log('[verify] Order ID:', body.razorpay_order_id);
    console.log('[verify] Payment ID:', body.razorpay_payment_id);
    console.log('[verify] Payment Session ID:', body.paymentSessionId);

    // Validate required fields
    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature || !body.paymentSessionId) {
      console.error('[verify] Missing required verification fields');
      return new Response(JSON.stringify({ 
        error: 'Missing required security verification fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Verify Razorpay signature
    // Signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
    const keySecret = import.meta.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      throw new Error('Razorpay secret is not configured');
    }

    const isValidSignature = verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      keySecret
    );

    if (!isValidSignature) {
      console.error('[verify] INVALID SIGNATURE! Possible fraud attempt.');
      
      // Notify Snipcart of failed payment
      await notifySnipcartPayment(body.paymentSessionId, 'failed', body.razorpay_payment_id, {
        code: 'signature_verification_failed',
        message: 'Payment signature verification failed. The transaction was flagged as insecure.'
      });

      return new Response(JSON.stringify({ 
        error: 'Security verification failed: Invalid payment signature',
        success: false
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[verify] Signature verified successfully!');

    // Step 2: Confirm payment to Snipcart
    const snipcartResult = await notifySnipcartPayment(
      body.paymentSessionId, 
      'processed', 
      body.razorpay_payment_id
    );

    if (!snipcartResult.success) {
      console.error('[verify] Failed to confirm with Snipcart:', snipcartResult.error);
      return new Response(JSON.stringify({ 
        error: 'Failed to confirm payment with Snipcart',
        details: snipcartResult.error,
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[verify] Payment confirmed with Snipcart!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified and confirmed',
      redirectUrl: snipcartResult.redirectUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[verify] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Verification failed',
      details: error.message || 'Unknown error',
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Verify Razorpay signature using HMAC-SHA256
 * Signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
function verifyRazorpaySignature(
  orderId: string, 
  paymentId: string, 
  signature: string, 
  secret: string
): boolean {
  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    // signature is provided as hex from Razorpay
    const sigBuffer = Buffer.from(signature, 'hex');
    const expBuffer = Buffer.from(expectedSignature, 'hex');

    // Explicit length check prevents "TypeError: Inputs must be of equal length"
    // which timingSafeEqual throws in Node/Cloudflare if buffers differ.
    if (sigBuffer.length !== expBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch (err) {
    // This now only catches actual system or cryptographic failures
    console.error('[verifySignature] Crypto error:', err);
    return false;
  }
}

/**
 * Notify Snipcart about the payment status
 */
async function notifySnipcartPayment(
  paymentSessionId: string,
  state: 'processing' | 'processed' | 'failed' | 'invalidated',
  transactionId: string,
  error?: { code: string; message: string }
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    const snipcartSecretKey = import.meta.env.SNIPCART_SECRET_API_KEY;
    
    const payload: any = {
      paymentSessionId,
      state,
      transactionId,
    };

    if (error) {
      payload.error = error;
    }

    const response = await fetch(
      'https://payment.snipcart.com/api/private/custom-payment-gateway/payment',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${snipcartSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[notifySnipcart] API error:', response.status, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json() as any;
    
    return { 
      success: true, 
      redirectUrl: result.returnUrl || result.paymentAuthorizationRedirectUrl 
    };

  } catch (error: any) {
    console.error('[notifySnipcart] Error:', error);
    return { success: false, error: error.message };
  }
}
