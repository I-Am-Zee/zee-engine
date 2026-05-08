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
    
    const { tax_rate, tax_origin_state, tax_origin_state_code, tax_gstin, tax_hsn_code } = brandEntry.data;

    // Use shipping address, fallback to billing if digital/no-shipping
    const address = order.shippingAddress || order.billingAddress || {};
    const province = (address.province || "").toLowerCase().trim();

    // Build province match list from state name + ISO code (e.g. "punjab", "pb", "in-pb")
    // Using the explicit state code field prevents auto-derivation bugs (e.g. "pu" vs "pb").
    const stateName = tax_origin_state.toLowerCase();
    const stateCode = (tax_origin_state_code || "").toLowerCase();
    const originStateAliases: string[] = [stateName];
    if (stateCode) originStateAliases.push(stateCode, `in-${stateCode}`);
    const isOriginState = originStateAliases.includes(province);

    // 2. Taxable Amount Calculation
    // Per-item HSN check: restored from original design.
    // For Zelia Vance, all items are HSN 7117 (Costume Jewellery) — this will always be true.
    // For multi-brand: if brand has no HSN configured, tax is applied to all items by default.
    const hasMatchingHSN = !tax_hsn_code || (order.items || []).some((item: any) =>
      item.metadata?.hsn === tax_hsn_code ||
      item.customFields?.some((cf: any) => cf.name === "HSN" && cf.value === tax_hsn_code)
    );

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

    console.log(`[Snipcart Taxes Webhook] Province: '${province}', Origin match: ${isOriginState}, HSN match: ${hasMatchingHSN}`);
    console.log(`[Snipcart Taxes Webhook] Calculated taxes:`, taxesToApply);

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
