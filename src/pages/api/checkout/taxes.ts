export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[Snipcart Taxes Webhook] Payload is not valid JSON.", e);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    if (body.eventName !== "taxes.calculate") {
      console.warn(`[Snipcart Taxes Webhook] Ignoring non-taxes event: ${body.eventName}`);
      return new Response(JSON.stringify({ message: "Ignored event type." }), { status: 200 });
    }

    const { content: order } = body;
    if (!order) {
      return new Response(JSON.stringify({ error: "Invalid order payload" }), { status: 400 });
    }

    // 1. Location Detection
    // Use shipping address, fallback to billing if digital/no-shipping
    const address = order.shippingAddress || order.billingAddress || {};
    const province = (address.province || "").toLowerCase();
    
    // Check if the shipping state is Punjab (Intra-state)
    const isPunjab = ["pb", "punjab", "03", "in-pb"].includes(province.trim());

    // 2. Taxable Amount Calculation for HSN 7117
    // For inclusive taxes, the Snipcart documentation states we just need to return the rate.
    // If the Snipcart Dashboard is set to "Taxes are included in price" and the product HTML 
    // has data-item-has-taxes-included="true", Snipcart does the reverse math itself.
    // The webhook just needs to return the tax name and the rate (e.g. 0.03 for 3%).
    
    // We only apply this to items that have the HSN 7117 metadata tag.
    // (Though for this store, assuming all items are Costume Jewellery)
    let taxableSubtotal = 0;
    const taxesToApply: { name: string; amount: number; rate: number; includedInPrice?: boolean }[] = [];

    // Check if there's any HSN 7117 item in the cart to trigger the GST logic
    const hasHSN7117 = (order.items || []).some((item: any) => 
      item.metadata?.hsn === "7117" || item.customFields?.some((cf: any) => cf.name === "HSN" && cf.value === "7117")
    );

    // Calculate total price of all items to base the tax amount on
    // Even though Snipcart calculates the final math based on `rate`, the payload format
    // usually requires `amount` as well.
    (order.items || []).forEach((item: any) => {
        taxableSubtotal += item.totalPrice || item.price || 0;
    });

    if (taxableSubtotal > 0) {
      if (isPunjab) {
        // Intra-state: Split 3% into 1.5% CGST and 1.5% SGST
        // Because taxes are INCLUSIVE and combine to 3%, the base price is P / 1.03
        // Total Tax Amount = P - (P / 1.03)
        // CGST and SGST are each half of this Total Tax Amount.
        const totalTaxRate = 0.03;
        const totalTaxAmount = taxableSubtotal - (taxableSubtotal / (1 + totalTaxRate));
        const splitAmount = Number((totalTaxAmount / 2).toFixed(2));

        taxesToApply.push({
          name: "CGST (1.5%)",
          amount: splitAmount,
          rate: 0.015,
          includedInPrice: true
        });
        taxesToApply.push({
          name: "SGST (1.5%)",
          amount: splitAmount,
          rate: 0.015,
          includedInPrice: true
        });
      } else {
        // Inter-state: Single 3% IGST
        const igstRate = 0.03;
        const igstAmount = Number((taxableSubtotal - (taxableSubtotal / (1 + igstRate))).toFixed(2));

        taxesToApply.push({
          name: "IGST (3%)",
          amount: igstAmount,
          rate: igstRate,
          includedInPrice: true
        });
      }
    }

    console.log(`[Snipcart Taxes Webhook] Calculated taxes for province '${province}':`, taxesToApply);

    // 3. Respond with exact Snipcart expected format
    return new Response(JSON.stringify({ 
      taxes: taxesToApply
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("[Snipcart Taxes Webhook Error]:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
};
