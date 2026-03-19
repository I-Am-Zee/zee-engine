/**
 * Payment Gateway Configuration
 * Central registry of all available payment gateways
 * 
 * NOTE: Razorpay supports multiple Indian payment methods through Razorpay Optimizer:
 * - UPI (PhonePe, Google Pay, etc.)
 * - Cards (Debit/Credit)
 * - Wallets
 * - Net Banking
 * - Other Indian payment methods (Cashfree integration happens via Razorpay Optimizer)
 * 
 * Razorpay Optimizer is an AI-powered payment router that automatically routes
 * transactions to the best-performing gateway, no additional integration needed.
 */

import type { PaymentGateway } from './types';

export const GATEWAYS: Record<string, PaymentGateway> = {
  razorpay: {
    id: 'razorpay',
    name: 'UPI, Cards, Wallets', // Generic name - Razorpay Optimizer handles routing
    supportedCountries: ['IN'],
    supportedCurrencies: ['INR'],
    enabled: true, // Active for Indian customers
    iconUrl: 'https://cdn.razorpay.com/logos/Hw8mUaDxyC6d8j_medium.png'
  },
  
  stripe: {
    id: 'stripe',
    name: 'Credit/Debit Card',
    supportedCountries: ['US', 'GB', 'CA', 'AU', 'SG', 'AE'], // Add more as needed
    supportedCurrencies: ['USD', 'GBP', 'CAD', 'AUD', 'SGD', 'AED'],
    enabled: false, // Will enable when ready for international
  },
};

/**
 * Get available payment gateways for a country
 */
export function getGatewaysForCountry(countryCode: string): PaymentGateway[] {
  return Object.values(GATEWAYS).filter(
    (gateway) => gateway.enabled && gateway.supportedCountries.includes(countryCode)
  );
}

/**
 * Get available payment gateways for a currency
 */
export function getGatewaysForCurrency(currency: string): PaymentGateway[] {
  return Object.values(GATEWAYS).filter(
    (gateway) => gateway.enabled && gateway.supportedCurrencies.includes(currency)
  );
}

/**
 * Get best gateway for country + currency combo
 */
export function selectGateway(countryCode: string, currency: string): PaymentGateway | null {
  const gateways = Object.values(GATEWAYS).filter(
    (gateway) =>
      gateway.enabled &&
      gateway.supportedCountries.includes(countryCode) &&
      gateway.supportedCurrencies.includes(currency)
  );
  
  // Return first match (could add priority logic here)
  return gateways[0] || null;
}
