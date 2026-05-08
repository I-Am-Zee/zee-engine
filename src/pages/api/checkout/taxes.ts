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

    // 1. Location & Tax Settings Detection
    const [legalEntry, legalTaxonomyEntry, brandEntry] = await Promise.all([
      getEntry("settings" as any, "legal"),
      getEntry("settings" as any, "legal-taxonomy"),
      getEntry("settings" as any, "brand")
    ]);

    if (!legalEntry || !legalTaxonomyEntry || !brandEntry) {
      throw new Error("[Taxes Webhook] Required settings (legal, legal-taxonomy, or brand) not found.");
    }
    
    const { tax_origin_state, tax_origin_state_code, gstin } = legalEntry.data;
    const { tax_classes } = legalTaxonomyEntry.data;

    if (!tax_classes || tax_classes.length === 0) {
      throw new Error("[Taxes Webhook] No tax classes defined in legal-taxonomy.");
    }

    const defaultTaxClass = tax_classes[0];

    // Use shipping address, fallback to billing if digital/no-shipping
    const address = order.shippingAddress || order.billingAddress || {};
    const province = (address.province || "").toLowerCase().trim();

    // Build province match list from state name + ISO code (e.g. "punjab", "pb", "in-pb")
    const stateName = tax_origin_state.toLowerCase();
    const stateCode = (tax_origin_state_code || "").toLowerCase();
    const originStateAliases: string[] = [stateName];
    if (stateCode) originStateAliases.push(stateCode, `in-${stateCode}`);
    const isOriginState = originStateAliases.includes(province);

    // 2. Taxable Amount Calculation (Per-item HSN lookup)
    const taxesByRate: Map<number, number> = new Map();

    (order.items || []).forEach((item: any) => {
      const itemPrice = item.totalPrice || item.price || 0;
      if (itemPrice <= 0) return;

      // Find HSN override
      const hsnOverride = item.metadata?.hsn || 
                         item.customFields?.find((cf: any) => cf.name === "HSN")?.value;
      
      const taxClass = tax_classes.find((tc: any) => tc.hsn === hsnOverride) || defaultTaxClass;
      const rate = taxClass.rate;

      const currentAmount = taxesByRate.get(rate) || 0;
      taxesByRate.set(rate, currentAmount + itemPrice);
    });

    // Handle Shipping Fees (Principal Supply Rule: using default rate for now)
    const shippingFees = Number(order.shippingInformation?.fees || order.shippingAddress?.shippingRate || order.shippingRate || 0);
    if (shippingFees > 0) {
      const defaultRate = defaultTaxClass.rate;
      const currentAmount = taxesByRate.get(defaultRate) || 0;
      taxesByRate.set(defaultRate, currentAmount + shippingFees);
    }

    const taxesToApply: { name: string; amount: number; rate: number; includedInPrice?: boolean; numberForInvoice?: string }[] = [];

    for (const [rate, totalAmount] of taxesByRate.entries()) {
      if (totalAmount <= 0) continue;

      if (isOriginState) {
        // Intra-state split: CGST + SGST
        const totalTaxAmount = totalAmount - (totalAmount / (1 + rate));
        const splitAmount = Number((totalTaxAmount / 2).toFixed(2));
        const splitRate = rate / 2;

        taxesToApply.push({
          name: `CGST (${(splitRate * 100).toFixed(1)}%) [Included]`,
          amount: splitAmount,
          rate: splitRate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${gstin}`
        });
        taxesToApply.push({
          name: `SGST (${(splitRate * 100).toFixed(1)}%) [Included]`,
          amount: splitAmount,
          rate: splitRate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${gstin}`
        });
      } else {
        // Inter-state: Single IGST
        const igstAmount = Number((totalAmount - (totalAmount / (1 + rate))).toFixed(2));

        taxesToApply.push({
          name: `IGST (${(rate * 100).toFixed(1)}%) [Included]`,
          amount: igstAmount,
          rate: rate,
          includedInPrice: true,
          numberForInvoice: `GSTIN: ${gstin}`
        });
      }
    }

    console.log(`[Snipcart Taxes Webhook] Province: '${province}', Origin match: ${isOriginState}`);
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
