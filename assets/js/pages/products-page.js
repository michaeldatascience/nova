/* Products listing: filter by category, search, sort. */
(function () {
  "use strict";
  const grid = document.querySelector("[data-products-grid]");
  const count = document.querySelector("[data-result-count]");
  const pills = document.querySelectorAll("[data-filter]");
  const search = document.querySelector("[data-search]");
  const sort = document.querySelector("[data-sort]");

  const params = new URLSearchParams(location.search);
  let activeCat = params.get("cat") || "all";
  let query = "";
  let sortMode = "featured";

  function matches(p) {
    if (activeCat !== "all" && p.category !== activeCat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (p.name + " " + p.model + " " + p.tagline + " " + CATEGORY_LABEL[p.category]).toLowerCase().includes(q);
  }

  function sorted(list) {
    const arr = [...list];
    if (sortMode === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sortMode === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sortMode === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }

  function render() {
    const list = sorted(PRODUCTS.filter(matches));
    grid.innerHTML = list.length
      ? list
          .map(
            (p) => `
          <article class="product-card reveal is-in">
            <a class="product-media" href="product.html?id=${p.id}">
              ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
              <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
            </a>
            <div class="product-body">
              <span class="product-cat">${CATEGORY_LABEL[p.category]}</span>
              <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
              <p class="product-tagline">${p.tagline}</p>
              <div class="product-foot">
                <span class="price">${formatPrice(p.price)}${p.compareAt ? `<span class="compare">${formatPrice(p.compareAt)}</span>` : ""}</span>
                <button class="add-btn" data-add="${p.id}">+ Add</button>
              </div>
            </div>
          </article>`
          )
          .join("")
      : `<div class="no-results"><h3>No products found</h3><p>Try a different search or category.</p></div>`;
    if (count) count.textContent = `${list.length} of ${PRODUCTS.length} products`;
  }

  pills.forEach((pill) => {
    if (pill.dataset.filter === activeCat) pill.classList.add("is-active");
    pill.addEventListener("click", () => {
      pills.forEach((x) => x.classList.remove("is-active"));
      pill.classList.add("is-active");
      activeCat = pill.dataset.filter;
      render();
    });
  });
  if (search)
    search.addEventListener("input", (e) => {
      query = e.target.value;
      render();
    });
  if (sort)
    sort.addEventListener("change", (e) => {
      sortMode = e.target.value;
      render();
    });

  render();
})();
