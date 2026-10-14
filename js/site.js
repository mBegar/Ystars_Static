(function () {
  const MENS = "+917071906906";
  const WOMENS = "+917506767367";

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

  const galleryModal = document.querySelector("[data-gallery-modal]");
  if (galleryModal) {
    galleryModal.addEventListener("click", (event) => {
      if (event.target === galleryModal || event.target.closest("[data-gallery-close]")) {
        galleryModal.classList.add("hidden");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") galleryModal.classList.add("hidden");
    });
  }

  const homeServices = document.querySelector("[data-home-services]");
  const serviceGroups = document.querySelector("[data-service-groups]");
  const brandGrid = document.querySelector("[data-brand-grid]");
  const reviewGrid = document.querySelector("[data-review-grid]");
  const galleryRoot = document.querySelector("[data-gallery-root]");

  if (!homeServices && !serviceGroups && !brandGrid && !reviewGrid && !galleryRoot) return;

  const cfg = window.YS_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return;

  async function load(table, query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + table + "?" + query, {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: "Bearer " + cfg.supabaseAnonKey
        },
        signal: controller.signal
      });
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? data : null;
    } catch (error) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function phoneFor(service) {
    return service.gender_target === "womens" ? WOMENS : MENS;
  }

  function durationLabel(minutes) {
    if (!minutes) return "";
    if (minutes < 60) return minutes + " min";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? hours + "h " + rest + "m" : hours + "h";
  }

  function serviceCard(service) {
    const image = service.image_url
      ? '<div class="relative h-48 overflow-hidden"><img src="' + escapeAttr(service.image_url) + '" alt="' + escapeAttr(service.name) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"></div>'
      : "";
    const duration = durationLabel(service.duration_minutes);
    const durationHtml = duration
      ? '<div class="pt-3 border-t border-gray-100 flex items-center text-sm text-gray-700"><span>' + duration + "</span></div>"
      : "";
    return (
      '<article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-full">' +
      image +
      '<div class="p-6 space-y-3">' +
      '<h3 class="text-xl font-bold text-gray-900">' + escapeHtml(service.name) + "</h3>" +
      '<span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">' + escapeHtml(service.category || "Service") + "</span>" +
      (service.description ? '<p class="text-gray-600 text-sm leading-relaxed">' + escapeHtml(service.description) + "</p>" : "") +
      durationHtml +
      '<a href="tel:' + phoneFor(service) + '" class="block w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-green-700 transition-colors">Book Now</a>' +
      "</div></article>"
    );
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function prefer(list, gender) {
    const map = new Map();
    const rank = (item) => (item.gender_target === gender ? 2 : item.gender_target === "unisex" ? 1 : 0);
    list.forEach((item) => {
      const key = String(item.name || "").trim().toLowerCase();
      const current = map.get(key);
      if (!current || rank(item) > rank(current)) map.set(key, item);
    });
    return Array.from(map.values());
  }

  if (homeServices) {
    load("services", "select=*&is_active=eq.true&order=name.asc").then((rows) => {
      if (!rows || !rows.length) return;
      const hidden = new Set(["Hair Colours", "Hair Spa", "Head Massage"]);
      const cards = rows.filter((row) => !hidden.has(row.name)).slice(0, 6).map(serviceCard).join("");
      if (cards) homeServices.innerHTML = cards;
    });
    load("testimonials", "select=*&is_featured=eq.true&order=review_date.desc&limit=3").then(renderReviews);
  }

  if (serviceGroups) {
    const gender = serviceGroups.getAttribute("data-gender");
    const filter = encodeURIComponent("(gender_target.eq." + gender + ",gender_target.eq.unisex)");
    load("services", "select=*&is_active=eq.true&or=" + filter + "&order=name.asc").then((rows) => {
      if (!rows || !rows.length) return;
      let list = prefer(rows, gender);
      if (gender === "mens") list = list.filter((row) => row.name !== "Hair Colours");
      const categories = gender === "mens"
        ? ["Hair Services", "Grooming", "Skin Care"]
        : Array.from(new Set(list.map((row) => row.category).filter(Boolean)));
      const html = categories.map((category) => {
        const items = list.filter((row) => row.category === category);
        if (!items.length) return "";
        return (
          '<div class="mb-16"><h3 class="text-2xl font-bold text-gray-900 mb-8">' + escapeHtml(category) + "</h3>" +
          '<div class="service-scroller flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">' +
          items.map((item) => '<div class="snap-start shrink-0 w-[85%] sm:w-[70%] md:w-auto">' + serviceCard(item) + "</div>").join("") +
          "</div></div>"
        );
      }).join("");
      if (html) serviceGroups.innerHTML = html;
      const popular = document.querySelector("[data-popular-services]");
      if (popular) popular.innerHTML = list.slice(0, 3).map(serviceCard).join("");
    });
  }

  if (brandGrid) {
    load("brands", "select=*&is_active=eq.true&order=display_order.asc").then((rows) => {
      if (!rows || !rows.length) return;
      const hidden = new Set(["loreal professionnelle", "loreal professional", "l'oreal professionnel", "l'oreal professional", "ozone", "raaga", "raaga professional"]);
      const visible = rows.filter((row) => !hidden.has(String(row.name || "").trim().toLowerCase()));
      if (!visible.length) return;
      brandGrid.innerHTML = visible.map((brand) => {
        const dark = /godrej/i.test(brand.name);
        const tall = /shahnaz|lotus|ozone/i.test(brand.name);
        const src = brand.logo_url || "";
        return (
          '<article class="bg-white rounded-xl shadow-lg overflow-hidden">' +
          '<div class="h-48 ' + (dark ? "bg-gray-800" : "bg-gray-50") + ' flex items-center justify-center p-8">' +
          (src ? '<img src="' + escapeAttr(src) + '" alt="' + escapeAttr(brand.name) + ' logo" class="logo-img ' + (tall ? "logo-tall" : "") + '" loading="lazy">' : "") +
          "</div><div class=\"p-6\"><h3 class=\"text-xl font-bold text-gray-900 mb-3\">" + escapeHtml(brand.name) + "</h3>" +
          (brand.description ? '<p class="text-gray-600 text-sm leading-relaxed">' + escapeHtml(brand.description) + "</p>" : "") +
          "</div></article>"
        );
      }).join("");
    });
  }

  function renderReviews(rows) {
    if (!reviewGrid || !rows || !rows.length) return;
    reviewGrid.innerHTML = rows.map((review) => {
      const stars = Array.from({ length: 5 }, (_, index) => {
        const on = index < Number(review.rating || 0);
        return '<svg class="w-4 h-4 ' + (on ? "text-yellow-400" : "text-gray-300") + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.8 6.6 19.6l1-6.1L3.2 9.2l6.1-.9L12 2.8z"/></svg>';
      }).join("");
      const when = review.review_date ? new Date(review.review_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";
      return (
        '<article class="bg-white rounded-xl shadow-lg p-6 h-full"><div class="flex gap-1 mb-4">' + stars + "</div>" +
        '<blockquote class="text-gray-700 leading-relaxed">"' + escapeHtml(review.review_text) + '"</blockquote>' +
        '<div class="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between gap-3">' +
        "<div><p class=\"font-semibold text-gray-900\">" + escapeHtml(review.customer_name) + "</p>" +
        (review.service_used ? '<p class="text-sm text-gray-600">' + escapeHtml(review.service_used) + "</p>" : "") +
        "</div>" + (when ? '<p class="text-sm text-gray-500">' + when + "</p>" : "") + "</div></article>"
      );
    }).join("");
    const wrap = document.querySelector("[data-review-section]");
    if (wrap) wrap.classList.remove("hidden");
  }

  if (reviewGrid && !homeServices) {
    load("testimonials", "select=*&order=review_date.desc&limit=12").then(renderReviews);
  }

  if (galleryRoot) {
    load("gallery_images", "select=*&is_active=eq.true&order=display_order.asc,created_at.desc").then((rows) => {
      if (!rows || !rows.length) return;
      const filters = document.querySelector("[data-gallery-filters]");
      const grid = document.querySelector("[data-gallery-grid]");
      const featured = document.querySelector("[data-gallery-featured]");
      const featuredWrap = document.querySelector("[data-gallery-featured-wrap]");
      const empty = document.querySelector("[data-gallery-empty]");
      const categories = ["all", ...Array.from(new Set(rows.map((row) => row.category).filter(Boolean)))];

      function open(item) {
        if (!galleryModal) return;
        galleryModal.querySelector("img").src = item.image_url;
        galleryModal.querySelector("img").alt = item.title || "Gallery image";
        galleryModal.querySelector("[data-gallery-title]").textContent = item.title || "";
        galleryModal.querySelector("[data-gallery-desc]").textContent = item.description || "";
        galleryModal.classList.remove("hidden");
      }

      function card(item, tall) {
        return (
          '<button type="button" class="text-left group" data-id="' + escapeAttr(item.id) + '">' +
          '<div class="relative overflow-hidden rounded-xl shadow-lg">' +
          '<img src="' + escapeAttr(item.image_url) + '" alt="' + escapeAttr(item.title || "Salon photo") + '" class="w-full ' + (tall ? "h-64" : "h-48") + ' object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">' +
          (item.category ? '<span class="absolute top-4 left-4 px-3 py-1 bg-white/90 text-gray-800 text-xs font-medium rounded-full">' + escapeHtml(item.category) + "</span>" : "") +
          "</div>" +
          (item.title ? '<h3 class="text-sm font-semibold text-gray-900 mt-3">' + escapeHtml(item.title) + "</h3>" : "") +
          "</button>"
        );
      }

      function draw(category) {
        const list = category === "all" ? rows : rows.filter((row) => row.category === category);
        grid.innerHTML = list.map((item) => card(item, false)).join("");
        grid.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", () => open(rows.find((row) => String(row.id) === button.getAttribute("data-id"))));
        });
        if (empty) empty.classList.toggle("hidden", list.length > 0);
      }

      if (filters) {
        filters.innerHTML = categories.map((category, index) => {
          const label = category.charAt(0).toUpperCase() + category.slice(1);
          return '<button type="button" data-cat="' + escapeAttr(category) + '" class="px-6 py-3 rounded-full font-medium shadow-md ' + (index === 0 ? "bg-green-600 text-white" : "bg-white text-gray-700") + '">' + escapeHtml(label) + "</button>";
        }).join("");
        filters.addEventListener("click", (event) => {
          const button = event.target.closest("[data-cat]");
          if (!button) return;
          filters.querySelectorAll("button").forEach((item) => {
            item.className = "px-6 py-3 rounded-full font-medium shadow-md bg-white text-gray-700";
          });
          button.className = "px-6 py-3 rounded-full font-medium shadow-md bg-green-600 text-white";
          draw(button.getAttribute("data-cat"));
        });
      }

      const featuredRows = rows.filter((row) => row.is_featured);
      if (featured && featuredWrap && featuredRows.length) {
        featuredWrap.classList.remove("hidden");
        featured.innerHTML = featuredRows.map((item) => card(item, true)).join("");
        featured.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", () => open(rows.find((row) => String(row.id) === button.getAttribute("data-id"))));
        });
      }
      if (empty) empty.classList.add("hidden");
      draw("all");
    });
  }
})();
