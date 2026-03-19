/**
 * Payment Gateway Types
 * Shared interfaces for all payment gateway integrations
 */

export interface PaymentGateway {
  id: string;
  name: string;
  supportedCountries: string[]; // ISO country codes
  supportedCurrencies: string[]; // ISO currency codes
  enabled: boolean;
  iconUrl?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  checkoutUrl: string;
  iconUrl?: string;
}

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  country: string;
  email: string;
  billingAddress: {
    name?: string;
    country?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  gateway: string;
  error?: string;
}
