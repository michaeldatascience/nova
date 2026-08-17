# NOVA — Whitelabel Smart-Health Storefront

A complete, static eCommerce website for selling smart wearables sourced from
[JointCorp / J-Style](https://www.jointcorp.com/) (JCRing smart rings, JCVital
smart bands, JCHealth smart watches, chronic disease monitors), with a design
language inspired by [ultrahuman.com](https://www.ultrahuman.com/) and
[ringconn.com](https://ringconn.com/).

## What's inside

```
index.html        Homepage — hero, categories, featured products, features, app, press, newsletter
products.html     All 23 products — filter by category, search, sort
product.html      Product detail — dynamic (?id=…), gallery, specs, add-to-cart, buy now
about.html        Brand story, values, quality & certifications
contact.html      Contact form (mailto fallback), WhatsApp, FAQs
cart.html         Cart + checkout form → Stripe Payment Links
assets/
  css/styles.css          Design system (dark premium theme)
  js/config.js            ⭐ Brand, contacts, shipping, Stripe config
  js/products.js          ⭐ All 23 products (prices, specs, images, Stripe links)
  js/cart.js              localStorage cart
  js/main.js              Shared UI (nav, reveal, marquee, toast)
  js/pages/*.js           Per-page logic
  images/                 Product + hero imagery (downloaded from jointcorp.com)
```

## ⚠️ Before you go live — 4 things to change

1. **Brand name** — `SITE_CONFIG.brand.name` in `assets/js/config.js` plus the
   logo (`NOVA`) in each `.html` header/footer (search "NOVA").
2. **Prices** — all prices in `assets/js/products.js` are **placeholder retail
   values** (USD). Replace with your real pricing. Update `compareAt` or remove it.
3. **Payments** — this is a static site, so checkout uses **Stripe Payment
   Links** (no backend needed):
   - Create a Payment Link per product in the Stripe dashboard
     (https://dashboard.stripe.com/payment-links).
   - Paste each URL into the product's `stripe` field in `products.js`.
   - Set the fallback store link in `config.js` → `DEFAULT_PAYMENT_LINK`
     (used for multi-item carts and products without a link).
   - Multi-item carts should point at a Payment Link whose quantity can be
     edited, or switch to a Stripe Checkout Session via a serverless function.
4. **Contact details** — email, WhatsApp, phone in `config.js`.

## How to preview

- **Quick one-file demo:** open **`preview.html`** — a single self-contained file
  (CSS, JS and images all inlined) that renders in any preview, sandbox or email.
  Includes a product quick-view modal and a cart drawer.
- **Full site:** the pages reference shared files (`assets/…`), so either open
  the folder in a browser via a local server, or unzip `nova-store.zip` and open
  `index.html` from the extracted folder:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

> Note: opening `index.html` directly from a file manager works, but opening it
> through an isolated chat/preview pane will not resolve the shared assets —
> that's what `preview.html` is for.

Deploy anywhere static: Netlify, Vercel, GitHub Pages, Cloudflare Pages.

`preview.html` can be regenerated at any time with `python3 tools/make_preview.py`.

## Notes

- Product data, specs and imagery come from jointcorp.com (J-Style OEM line).
  Replace product photos with your own branded photography for launch.
- Health claims: these are wellness/screening devices, not diagnostic tools.
  The site includes a disclaimer on each product page.
- Stats (20+ years, 1000+ partners, etc.) are supplier marketing figures —
  adjust to your own claims.
- The contact form opens the visitor's email client (mailto). For live
  submissions, point it at a form backend (Formspree, Basin, etc.).
