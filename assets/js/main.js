/* Shared UI behaviour: mobile nav, scroll header, reveal animations, marquee. */
(function () {
  "use strict";

  /* Sticky header state */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  const burger = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector(".site-nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      })
    );
  }

  /* Reveal-on-scroll (with graceful fallback if IO is unavailable) */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* Duplicate marquee content for a seamless loop */
  document.querySelectorAll("[data-marquee]").forEach((mq) => {
    const inner = mq.querySelector(".marquee-track");
    if (inner && !mq.dataset.duplicated) {
      inner.innerHTML += inner.innerHTML;
      mq.dataset.duplicated = "1";
    }
  });

  /* Newsletter forms → friendly confirm (static demo) */
  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      const btn = form.querySelector("button");
      if (input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      const original = btn ? btn.textContent : "";
      if (btn) btn.textContent = "✓ Subscribed";
      form.dataset.done = "1";
      if (input) input.value = "";
      setTimeout(() => {
        if (btn) btn.textContent = original;
      }, 3000);
    });
  });

  /* Toast helper for add-to-cart feedback */
  window.toast = function (message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };
})();
