(function () {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-book-toggle]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = btn.parentElement.querySelector("[data-book-menu]");
      document.querySelectorAll("[data-book-menu]").forEach((other) => {
        if (other !== menu) other.classList.add("hidden");
      });
      menu.classList.toggle("hidden");
    });
  });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("hidden") === false;
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.querySelector("[data-icon-open]").classList.toggle("hidden", open);
      navToggle.querySelector("[data-icon-close]").classList.toggle("hidden", !open);
    });
  }

  document.addEventListener("click", () => {
    document.querySelectorAll("[data-book-menu]").forEach((menu) => menu.classList.add("hidden"));
  });
})();
