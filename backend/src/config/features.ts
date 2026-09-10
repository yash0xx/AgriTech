/**
 * AgriTech Platform Feature Configuration
 * Centralized feature toggles across backend services and modules.
 * 
 * In demo environments, live payment processing through Razorpay is disabled by default.
 * Non-custodial escrow workflows operate via secure milestone state transitions and verified webhook mocks.
 */
export const FEATURES = {
  /**
   * Razorpay Live Payment Gateway Integration
   * Default: false (sandbox/demo abstraction mode)
   */
  ENABLE_LIVE_PAYMENTS: process.env.ENABLE_LIVE_PAYMENTS === 'true',

  /**
   * Strict Cross-Origin Resource Sharing (CORS)
   * Enforced in production environments.
   */
  STRICT_CORS: process.env.NODE_ENV === 'production',
};
