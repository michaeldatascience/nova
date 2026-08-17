/* Cart: localStorage-backed cart shared across all pages. */
(function () {
  const KEY = "nova_cart_v1";

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }
  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    notify(cart);
  }
  function notify(cart) {
    document.dispatchEvent(new CustomEvent("nova:cart", { detail: cart }));
  }

  window.Cart = {
    get() {
      return load();
    },
    count() {
      return load().reduce((n, i) => n + i.qty, 0);
    },
    add(id, qty = 1) {
      const cart = load();
      const found = cart.find((i) => i.id === id);
      if (found) found.qty += qty;
      else cart.push({ id, qty });
      save(cart);
    },
    setQty(id, qty) {
      const cart = load();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.qty = Math.max(1, qty);
        save(cart);
      }
    },
    remove(id) {
      save(load().filter((i) => i.id !== id));
    },
    clear() {
      save([]);
    },
    lineTotals() {
      return load().map((i) => ({
        ...i,
        product: window.PRODUCTS_BY_ID[i.id],
        lineTotal: (window.PRODUCTS_BY_ID[i.id]?.price || 0) * i.qty,
      }));
    },
    subtotal() {
      return this.lineTotals().reduce((s, i) => s + i.lineTotal, 0);
    },
    shipping() {
      const sub = this.subtotal();
      if (sub === 0) return 0;
      return sub >= SITE_CONFIG.shipping.freeThreshold ? 0 : SITE_CONFIG.shipping.flatRate;
    },
    tax() {
      return this.subtotal() * SITE_CONFIG.taxRate;
    },
    total() {
      return this.subtotal() + this.shipping() + this.tax();
    },
  };

  /* Render the cart badge in every header */
  function renderBadge() {
    document.querySelectorAll("[data-cart-badge]").forEach((el) => {
      const n = Cart.count();
      el.textContent = n;
      el.classList.toggle("is-empty", n === 0);
    });
  }
  document.addEventListener("nova:cart", renderBadge);
  document.addEventListener("DOMContentLoaded", renderBadge);
})();
