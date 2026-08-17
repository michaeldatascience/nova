/* Homepage: renders featured products + category cards + marquee items. */
(function () {
  "use strict";
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function cardHTML(p) {
    const cat = CATEGORY_LABEL[p.category] || p.category;
    return `
    <article class="product-card reveal">
      <a class="product-media" href="product.html?id=${p.id}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </a>
      <div class="product-body">
        <span class="product-cat">${cat}</span>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="product-tagline">${p.tagline}</p>
        <div class="product-foot">
          <span class="price">${formatPrice(p.price)}${p.compareAt ? `<span class="compare">${formatPrice(p.compareAt)}</span>` : ""}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+ Add</button>
        </div>
      </div>
    </article>`;
  }

  /* Featured products (hero picks + bestsellers) */
  const featured = ["ring-x3", "band-v10", "ring-x6", "band-v8", "watch-2025f", "ring-x5", "band-v1s", "chronic-mfa1"];
  const grid = document.querySelector("[data-featured-grid]");
  if (grid) {
    grid.innerHTML = featured
      .map((id) => PRODUCTS_BY_ID[id])
      .filter(Boolean)
      .map(cardHTML)
      .join("");
  }

  /* Category cards */
  const catGrid = document.querySelector("[data-cat-grid]");
  if (catGrid) {
    const heroImg = {
      rings: "assets/images/hero/hero-rings.jpg",
      bands: "assets/images/hero/hero-bands.png",
      watches: "assets/images/products/2025f.webp",
      chronic: "assets/images/products/mfa1.jpg",
    };
    catGrid.innerHTML = CATEGORIES.map(
      (c) => `
      <a class="cat-card reveal" href="products.html?cat=${c.id}">
        <img src="${heroImg[c.id]}" alt="${c.label}" loading="lazy">
        <h3>${c.label}</h3>
        <p>${c.blurb}</p>
        <span class="count">${PRODUCTS.filter((p) => p.category === c.id).length} products →</span>
      </a>`
    ).join("");
  }

  /* Marquee items */
  const marquee = document.querySelector("[data-marquee] .marquee-track");
  if (marquee) {
    const items = [
      "Medical-grade SpO₂",
      "Non-invasive Glucose Risk Assessment",
      "ECG Monitoring",
      "AI Health Coach",
      "Sleep Apnea Screening",
      "5ATM Waterproof",
      "7–15 Day Battery",
      "BioAge & VO₂ max",
      "Family Health Sharing",
      "ISO 13485 Certified",
    ];
    marquee.innerHTML = items.map((t) => `<span class="marquee-item">${t}</span>`).join("");
  }

  /* Add to cart (delegated) */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = PRODUCTS_BY_ID[btn.dataset.add];
    Cart.add(p.id);
    toast(`${p.name} added to cart`);
  });
})();
