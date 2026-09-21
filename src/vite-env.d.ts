/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase (client)
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;

  // Stripe (client)
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_STRIPE_PAYMENT_LINK_ED?: string;
  readonly VITE_STRIPE_PAYMENT_LINK_WEIGHT?: string;
  readonly VITE_PAYMENT_STATEMENT_DESCRIPTOR?: string;

  // Company / legal
  readonly VITE_COMPANY_LEGAL_NAME?: string;
  readonly VITE_COMPANY_ADDRESS_LINE1?: string;
  readonly VITE_COMPANY_ADDRESS_LINE2?: string;
  readonly VITE_COMPANY_PHONE?: string;
  readonly VITE_CONTACT_EMAIL?: string;

  // Analytics
  readonly VITE_GTM_ID?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;

  // Provider portal
  readonly VITE_PROVIDER_ACCESS_CODE?: string;

  // Feature flags
  readonly VITE_FEATURE_WEIGHT_LOSS?: string;
  readonly VITE_FEATURE_MESSAGING?: string;
  readonly VITE_FEATURE_REFILLS?: string;

  // Crypto payments (not yet implemented — feature flagged off)
  readonly VITE_STRIPE_CRYPTO_ENABLED?: string;
  readonly VITE_CRYPTO_PAYMENTS_ENABLED?: string;
  readonly VITE_CRYPTO_PROVIDER?: string;
  readonly VITE_COINBASE_COMMERCE_API_KEY?: string;
  readonly VITE_BITPAY_TOKEN?: string;
  readonly VITE_OPENNODE_API_KEY?: string;
  readonly VITE_CRYPTO_CHECKOUT_URL_ED?: string;
  readonly VITE_CRYPTO_CHECKOUT_URL_WEIGHT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
