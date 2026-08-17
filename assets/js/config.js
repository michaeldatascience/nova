/* ============================================================================
 * SITE CONFIG — everything you need to rebrand / go live lives here.
 *
 * HOW TO GO LIVE:
 * 1. Rename the brand: change BRAND.name, tagline and the logo text in each
 *    <header> (search for "NOVA" in the .html files).
 * 2. Prices: prices in products.js are PLACEHOLDERS — update to your retail
 *    prices before launching.
 * 3. Payments: create a Stripe Payment Link per product
 *    (https://dashboard.stripe.com/payment-links) and paste the URL into the
 *    product.stripe field in products.js. If a product has no link, checkout
 *    falls back to DEFAULT_PAYMENT_LINK. For a multi-item cart, use one
 *    Stripe Payment Link with configurable quantity, or a Checkout Session.
 * 4. Replace placeholder contact details below.
 * ========================================================================== */
window.SITE_CONFIG = {
  brand: {
    name: "NOVA",                       // ← your whitelabel brand name
    tagline: "Health, in the round.",
    description: "NOVA is a next-generation digital health brand — precision smart rings, screenless health bands and clinical-grade monitoring devices engineered for everyday wellness.",
    currency: "USD",
    currencySymbol: "$",
  },
  contact: {
    email: "hello@novahealth.example.com",        // ← replace
    whatsapp: "https://wa.me/15551234567",        // ← replace (country code + number)
    phone: "+1 (555) 123-4567",                   // ← replace
    supportNote: "Orders ship within 48 hours. 30-day returns, 12-month warranty.",
  },
  shipping: {
    freeThreshold: 100,      // free shipping above this subtotal
    flatRate: 9.95,          // otherwise this flat rate
  },
  taxRate: 0,                // 0 = not charged; set e.g. 0.08 for 8%
  DEFAULT_PAYMENT_LINK: "https://buy.stripe.com/REPLACE_ME", // ← paste your Stripe Payment Link
  store: {
    name: "NOVA Store",
    currency: "USD",
  },
};
