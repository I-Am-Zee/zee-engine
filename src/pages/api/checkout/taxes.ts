export const prerender = false;

import type { APIRoute } from "astro";
import { getEntry } from "astro:content";

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
    const brandEntry = await getEntry("settings" as any, "brand");
    if (!brandEntry) throw new Error("[Taxes Webhook] Brand settings not found.");
    
    const { tax_rate, tax_origin_state, tax_gstin } = brandEntry.data;

    // Use shipping address, fallback to billing if digital/no-shipping
    const address = order.shippingAddress || order.billingAddress || {};
    const province = (address.province || "").toLowerCase();
    
    // Check if the shipping state is Punjab (Intra-state)
    const isOriginState = province.trim() === tax_origin_state.toLowerCase() || 
                         province.trim() === "in-" + tax_origin_state.toLowerCase().substring(0, 2);

    // 2. Taxable Amount Calculation for decentralized HSN
    let taxableSubtotal = 0;
    const taxesToApply: { name: string; amount: number; rate: number; includedInPrice?: boolean; numberForInvoice?: string }[] = [];

    // Calculate total price of all items to base the tax amount on
    (order.items || []).forEach((item: any) => {
        taxableSubtotal += item.totalPrice || item.price || 0;
    });

    // Handle "Principal Supply" Rule for Indian GST:
    const shippingFees = order.shippingInformation?.fees || order.shippingAddress?.shippingRate || order.shippingRate || 0;
    taxableSubtotal += Number(shippingFees);

    if (taxableSubtotal > 0) {
      if (isOriginState) {
        // Intra-state split
        const totalTaxAmount = taxableSubtotal - (taxableSubtotal / (1 + tax_rate));
        const splitAmount = Number((totalTaxAmount / 2).toFixed(2));
        const splitRate = tax_rate / 2;

        taxesToApply.push({
          name: `CGST (${(splitRate * 100).toFixed(1)}%) [Included]`,
          amount: splitAmount,
          rate: splitRate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${tax_gstin}`
        });
        taxesToApply.push({
          name: `SGST (${(splitRate * 100).toFixed(1)}%) [Included]`,
          amount: splitAmount,
          rate: splitRate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${tax_gstin}`
        });
      } else {
        // Inter-state: Single IGST
        const igstAmount = Number((taxableSubtotal - (taxableSubtotal / (1 + tax_rate))).toFixed(2));

        taxesToApply.push({
          name: `IGST (${(tax_rate * 100).toFixed(0)}%) [Included]`,
          amount: igstAmount,
          rate: tax_rate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${tax_gstin}`
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
