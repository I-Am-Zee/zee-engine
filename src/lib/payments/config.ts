/**
 * Payment Gateway Configuration
 * Central registry of all available payment gateways
 */

import type { PaymentGateway } from './types';

export const GATEWAYS: Record<string, PaymentGateway> = {
  razorpay: {
    id: 'razorpay',
    name: 'UPI, Cards, Wallets', // Generic name for Razorpay Optimizer
    supportedCountries: ['IN'],
    supportedCurrencies: ['INR'],
    enabled: true, // Active now
  },
  
  stripe: {
    id: 'stripe',
    name: 'Credit/Debit Card',
    supportedCountries: ['US', 'GB', 'CA', 'AU', 'SG', 'AE'], // Add more as needed
    supportedCurrencies: ['USD', 'GBP', 'CAD', 'AUD', 'SGD', 'AED'],
    enabled: false, // Will enable when ready for international
  },
  
  // Future Indian gateways
  cashfree: {
    id: 'cashfree',
    name: 'Cashfree',
    supportedCountries: ['IN'],
    supportedCurrencies: ['INR'],
    enabled: false, // Add when needed
  },
  
  phonepe: {
    id: 'phonepe',
    name: 'PhonePe',
    supportedCountries: ['IN'],
    supportedCurrencies: ['INR'],
    enabled: false, // Add when needed
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
