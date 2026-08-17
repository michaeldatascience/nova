/* Cart page + checkout form → Stripe Payment Links redirect. */
(function () {
  "use strict";

  const mount = document.querySelector("[data-cart-root]");
  if (!mount) return;

  function render() {
    const lines = Cart.lineTotals();

    if (!lines.length) {
      mount.innerHTML = `
        <div class="empty-cart">
          <div class="big">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Explore our health wearables and find the one that fits your life.</p>
          <a class="btn btn-primary" href="products.html">Browse products</a>
        </div>`;
      return;
    }

    mount.innerHTML = `
      <div class="cart-layout">
        <div>
          ${lines
            .map(
              (l) => `
            <div class="cart-row" data-line="${l.id}">
              <a href="product.html?id=${l.id}"><img src="${l.product.images[0]}" alt="${l.product.name}"></a>
              <div>
                <div class="c-name"><a href="product.html?id=${l.id}">${l.product.name}</a></div>
                <div class="c-meta">${formatPrice(l.product.price)} each · ${CATEGORY_LABEL[l.product.category]}</div>
                <div class="qty" style="margin-top:.6rem">
                  <button data-qty-minus aria-label="Decrease">−</button>
                  <output data-qty-value>${l.qty}</output>
                  <button data-qty-plus aria-label="Increase">+</button>
                </div>
              </div>
              <div class="c-controls">
                <span class="c-price">${formatPrice(l.lineTotal)}</span>
                <button class="remove-btn" data-remove>Remove</button>
              </div>
            </div>`
            )
            .join("")}
          <p class="muted" style="font-size:.85rem;margin-top:1.2rem">
            <a href="products.html" style="color:var(--accent)">← Continue shopping</a>
          </p>
        </div>

        <aside class="summary-card">
          <h3>Order summary</h3>
          <div class="sum-line"><span>Subtotal</span><b data-sum-sub>${formatPrice(Cart.subtotal())}</b></div>
          <div class="sum-line"><span>Shipping</span><b data-sum-ship>${Cart.shipping() === 0 ? "Free" : formatPrice(Cart.shipping())}</b></div>
          ${SITE_CONFIG.taxRate ? `<div class="sum-line"><span>Estimated tax</span><b data-sum-tax>${formatPrice(Cart.tax())}</b></div>` : ""}
          <div class="sum-line sum-total"><span>Total</span><b data-sum-total>${formatPrice(Cart.total())}</b></div>
          ${Cart.shipping() > 0 ? `<p class="free-ship-note">Add ${formatPrice(SITE_CONFIG.shipping.freeThreshold - Cart.subtotal())} more for free shipping</p>` : `<p class="free-ship-note">✓ Free shipping unlocked</p>`}
          <button class="btn btn-primary btn-lg btn-block" style="margin-top:1.2rem" data-to-checkout>Proceed to checkout</button>
          <p class="faint" style="font-size:.75rem;text-align:center;margin-top:.8rem">Secure payment via Stripe · 30-day returns</p>
        </aside>
      </div>

      <!-- Checkout form (shown after clicking checkout) -->
      <div data-checkout-panel hidden style="margin-top:2.5rem;border-top:1px solid var(--border);padding-top:2.5rem">
        <div class="section-head"><span class="eyebrow">Checkout</span><h2>Shipping details</h2><p>We'll redirect you to a secure Stripe payment page after confirming your details.</p></div>
        <form data-checkout-form novalidate class="form-grid" style="max-width:720px">
          <div class="field"><label>First name *</label><input name="first" required><span class="err"></span></div>
          <div class="field"><label>Last name *</label><input name="last" required><span class="err"></span></div>
          <div class="field full"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"><span class="err"></span></div>
          <div class="field full"><label>Address *</label><input name="address" required><span class="err"></span></div>
          <div class="field"><label>City *</label><input name="city" required><span class="err"></span></div>
          <div class="field"><label>ZIP / Postal code *</label><input name="zip" required><span class="err"></span></div>
          <div class="field full"><label>Country *</label>
            <select name="country" required>
              <option value="">Select country…</option>
              <option>United States</option><option>United Kingdom</option>
              <option>Canada</option><option>Australia</option><option>Singapore</option>
              <option>Germany</option><option>France</option><option>United Arab Emirates</option>
              <option>Japan</option><option>Other</option>
            </select><span class="err"></span>
          </div>
          <div class="payment-note full">
            <span>🔒</span>
            <span>Payment happens on Stripe's secure page. Single-product orders use the product's Stripe Payment Link; multi-item orders use the store's default link (configure in <code style="color:var(--accent)">assets/js/config.js</code>).</span>
          </div>
          <div class="full" style="display:flex;gap:.75rem;flex-wrap:wrap">
            <button type="button" class="btn btn-outline" data-back-cart>← Back to cart</button>
            <button type="submit" class="btn btn-primary btn-lg">Pay ${formatPrice(Cart.total())} securely</button>
          </div>
        </form>
      </div>`;

    bind();
  }

  function bind() {
    mount.querySelectorAll("[data-line]").forEach((row) => {
      const id = row.dataset.line;
      const out = row.querySelector("[data-qty-value]");
      row.querySelector("[data-qty-plus]").addEventListener("click", () => {
        Cart.setQty(id, Number(out.value) + 1);
        render();
      });
      row.querySelector("[data-qty-minus]").addEventListener("click", () => {
        if (Number(out.value) > 1) {
          Cart.setQty(id, Number(out.value) - 1);
          render();
        }
      });
      row.querySelector("[data-remove]").addEventListener("click", () => {
        Cart.remove(id);
        render();
      });
    });

    const toCheckout = mount.querySelector("[data-to-checkout]");
    if (toCheckout)
      toCheckout.addEventListener("click", () => {
        const panel = mount.querySelector("[data-checkout-panel]");
        panel.hidden = false;
        panel.scrollIntoView({ behavior: "smooth" });
      });

    const back = mount.querySelector("[data-back-cart]");
    if (back)
      back.addEventListener("click", () => {
        mount.querySelector("[data-checkout-panel]").hidden = true;
      });

    const form = mount.querySelector("[data-checkout-form]");
    if (form)
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        form.querySelectorAll("[required]").forEach((input) => {
          const valid = input.checkValidity();
          input.classList.toggle("invalid", !valid);
          input.closest(".field").querySelector(".err").textContent = valid ? "" : "This field is required";
          if (!valid) ok = false;
        });
        if (!ok) return;

        /* Build the Stripe redirect: use the product's link when single-item,
           otherwise the store default link (see config.js). */
        const lines = Cart.lineTotals();
        let target = SITE_CONFIG.DEFAULT_PAYMENT_LINK;
        if (lines.length === 1 && lines[0].product.stripe) target = lines[0].product.stripe;

        if (!target || target.includes("REPLACE_ME")) {
          toast("Payment link not configured yet — set it in assets/js/config.js");
          return;
        }
        toast("Redirecting to secure checkout…");
        setTimeout(() => (location.href = target), 700);
      });
  }

  render();
})();
