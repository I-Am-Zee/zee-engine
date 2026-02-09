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
  razorpay_order_id?: string; // Optional: only for order-based payments
  razorpay_payment_id: string;
  razorpay_signature?: string; // Optional: only for order-based payments
  paymentSessionId: string;  // Snipcart payment session ID
  amount?: number; // For logging
  currency?: string; // For logging
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: VerifyRequest = await request.json();
    
    console.log('[verify] Verifying Razorpay payment');
    console.log('[verify] Order ID:', body.razorpay_order_id || 'N/A (direct payment)');
    console.log('[verify] Payment ID:', body.razorpay_payment_id);
    console.log('[verify] Payment Session ID:',body.paymentSessionId);
    if (body.amount) console.log('[verify] Amount:', body.amount, body.currency);

    // Validate required fields
    if (!body.razorpay_payment_id || !body.paymentSessionId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: razorpay_payment_id, paymentSessionId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Verify Razorpay signature (only if order_id and signature are provided)
    if (body.razorpay_order_id && body.razorpay_signature) {
      console.log('[verify] Order-based payment - verifying signature...');
      
      const isValidSignature = verifyRazorpaySignature(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature,
        import.meta.env.RAZORPAY_KEY_SECRET
      );

      if (!isValidSignature) {
        console.error('[verify] Invalid Razorpay signature!');
        
        // Notify Snipcart of failed payment
        await notifySnipcartPayment(body.paymentSessionId, 'failed', body.razorpay_payment_id, {
          code: 'signature_verification_failed',
          message: 'Payment signature verification failed'
        });

        return new Response(JSON.stringify({ 
          error: 'Invalid payment signature',
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('[verify] Signature verified successfully!');
    } else {
      console.log('[verify] Direct payment (no order) - proceeding without signature verification');
    }

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
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
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

    console.log('[verify] Notifying Snipcart:', JSON.stringify(payload));

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
      console.error('[verify] Snipcart API error:', response.status, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log('[verify] Snipcart response:', JSON.stringify(result));
    
    return { 
      success: true, 
      redirectUrl: result.returnUrl || result.paymentAuthorizationRedirectUrl 
    };

  } catch (error: any) {
    console.error('[verify] Snipcart notification error:', error);
    return { success: false, error: error.message };
  }
}

// Debug endpoint
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    message: 'Razorpay Payment Verification Endpoint',
    status: 'ready',
    hint: 'POST with razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentSessionId'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
