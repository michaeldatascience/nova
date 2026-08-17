/* Product detail page: renders product from ?id= query param. */
(function () {
  "use strict";
  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS_BY_ID[id];

  const root = document.querySelector("[data-pdp]");
  if (!root) return;

  if (!p) {
    root.innerHTML = `<div class="empty-cart" style="grid-column:1/-1">
      <div class="big">404</div><h3>Product not found</h3>
      <p>The product you are looking for does not exist.</p>
      <a class="btn btn-primary" href="products.html">Browse products</a></div>`;
    return;
  }

  document.title = `${p.name} — ${SITE_CONFIG.brand.name}`;
  document.querySelector("[data-crumb-name]").textContent = p.name;

  root.innerHTML = `
    <div class="pdp-gallery">
      <div class="main-img"><img src="${p.images[0]}" alt="${p.name}"></div>
      ${
        p.images.length > 1
          ? `<div class="thumb-row">${p.images
              .map(
                (src, i) =>
                  `<button class="thumb ${i === 0 ? "is-active" : ""}" data-thumb="${i}" aria-label="View image ${i + 1}"><img src="${src}" alt=""></button>`
              )
              .join("")}</div>`
          : ""
      }
    </div>
    <div class="pdp-info">
      <span class="pdp-cat">${CATEGORY_LABEL[p.category]} · Model ${p.model}</span>
      <h1>${p.name}</h1>
      <div class="pdp-price">${formatPrice(p.price)}${p.compareAt ? `<span class="compare">${formatPrice(p.compareAt)}</span>` : ""}</div>
      <p class="pdp-desc">${p.description}</p>
      <ul class="pdp-feats">${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      <div class="buy-row">
        <div class="qty" data-qty>
          <button data-qty-minus aria-label="Decrease quantity">−</button>
          <output data-qty-value>1</output>
          <button data-qty-plus aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-outline" data-add-cart>Add to cart</button>
        <button class="btn btn-primary" data-buy-now>Buy now</button>
      </div>
      <div class="pdp-meta">
        <div><b>Shipping</b>Free over ${formatPrice(SITE_CONFIG.shipping.freeThreshold)} · ships in 48h</div>
        <div><b>Returns</b>30-day money-back guarantee</div>
        <div><b>Warranty</b>12-month manufacturer warranty</div>
      </div>
      <details class="accordion"><summary>Specifications</summary>
        <div class="acc-body"><table class="specs-table">${p.specs
          .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
          .join("")}</table></div>
      </details>
      <details class="accordion"><summary>Shipping & returns</summary>
        <div class="acc-body">Orders are dispatched within 48 hours. Free standard shipping on orders over ${formatPrice(
          SITE_CONFIG.shipping.freeThreshold
        )}; otherwise a flat rate of ${formatPrice(SITE_CONFIG.shipping.flatRate)} applies. You have 30 days to return an unused product for a full refund.</div>
      </details>
      <details class="accordion"><summary>Health disclaimer</summary>
        <div class="acc-body">These devices support wellness and screening insights and are not medical diagnostic devices. Always consult a physician for medical decisions. Non-invasive glucose assessment indicates risk trends, not clinical blood glucose values.</div>
      </details>
    </div>`;

  /* Gallery thumbs */
  const mainImg = root.querySelector(".main-img img");
  root.querySelectorAll("[data-thumb]").forEach((t) =>
    t.addEventListener("click", () => {
      root.querySelectorAll("[data-thumb]").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
      mainImg.src = p.images[Number(t.dataset.thumb)];
    })
  );

  /* Quantity stepper */
  const qtyValue = root.querySelector("[data-qty-value]");
  let qty = 1;
  root.querySelector("[data-qty-plus]").addEventListener("click", () => (qtyValue.value = ++qty));
  root.querySelector("[data-qty-minus]").addEventListener("click", () => {
    if (qty > 1) qtyValue.value = --qty;
  });

  /* Actions */
  root.querySelector("[data-add-cart]").addEventListener("click", () => {
    Cart.add(p.id, qty);
    toast(`${qty} × ${p.name} added to cart`);
  });
  root.querySelector("[data-buy-now]").addEventListener("click", () => {
    Cart.add(p.id, qty);
    location.href = "cart.html";
  });
})();
