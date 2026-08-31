const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const canvas = document.getElementById("stageCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const products = window.ddProducts || [];

const serviceState = {
  sunet: {
    color: "#8c3dff",
    title: "Sunet RCF dimensionat corect",
    copy: "Line Array RCF HDL 10 sau HDL 20, SUB 8008 pentru bass și mixaj digital pe Midas M32R sau Wing Compact.",
    labels: ["Acoperire", "Bass", "Mixaj"],
    meters: [88, 86, 92]
  },
  lumini: {
    color: "#c6a6ff",
    title: "Lumini controlate DMX",
    copy: "LED Bar, Beam, Thunder Wash și moving head-uri pentru atmosferă, scenă, ring și momente sincronizate.",
    labels: ["Atmosferă", "Mișcare", "Control"],
    meters: [88, 84, 90]
  },
  efecte: {
    color: "#ff7ad9",
    title: "Efecte speciale cu operator",
    copy: "CO2, scântei reci, fum greu, hazere și lasere pentru momente care trebuie planificate atent și folosite responsabil.",
    labels: ["Impact", "Sincronizare", "Siguranță"],
    meters: [90, 84, 92]
  },
  scena: {
    color: "#9dffb0",
    title: "Scenă modulară și truss",
    copy: "Buteci de 2 x 1 metri, grinzi truss de 1-4 m și truss tower pentru lumini, video și susținere tehnică.",
    labels: ["Stabilitate", "Adaptare", "Montaj"],
    meters: [92, 82, 86]
  },
  video: {
    color: "#ffd27a",
    title: "Ecrane LED și procesare video",
    copy: "Panouri LED P2.9 și P3.9 cu procesare VX1000 pentru conținut clar, prezentări, live feed și scenă.",
    labels: ["Pixel", "Luminozitate", "Procesare"],
    meters: [88, 90, 84]
  },
  conectivitate: {
    color: "#6ff5ff",
    title: "Cablare curată",
    copy: "XLR, DMX, fibră optică pe rolă, multicor de sunet, PowerCON, link-uri de alimentare și prelungitoare.",
    labels: ["Semnal", "Ordine", "Siguranță"],
    meters: [92, 86, 88]
  },
  curent: {
    color: "#ffffff",
    title: "Distribuții și trifazic",
    copy: "Distribuții profesionale de curent, alimentare trifazică 32A și 63A, plus 125A la cerere specială.",
    labels: ["32A", "63A", "125A"],
    meters: [92, 86, 68]
  }
};

let activeService = "sunet";
let width = 0;
let height = 0;
let pointerX = 0.64;
let pointerY = 0.42;
let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function toggleMenu() {
  if (!header || !menuButton || !nav) return;
  const isOpen = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", isOpen);
  header.classList.toggle("is-open", isOpen);
  menuButton.classList.toggle("is-active", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function closeMenu() {
  if (!header || !menuButton || !nav) return;
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  menuButton.classList.remove("is-active");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function setupReveals() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
}

function setService(key) {
  const state = serviceState[key];
  const readoutTitle = document.querySelector("[data-readout-title]");
  const readoutCopy = document.querySelector("[data-readout-copy]");
  const meterA = document.querySelector("[data-meter-a]");
  const meterB = document.querySelector("[data-meter-b]");
  const meterC = document.querySelector("[data-meter-c]");
  const meterALabel = document.querySelector("[data-meter-a-label]");
  const meterBLabel = document.querySelector("[data-meter-b-label]");
  const meterCLabel = document.querySelector("[data-meter-c-label]");

  if (!state) return;
  activeService = key;

  document.documentElement.style.setProperty("--service-accent", state.color);

  if (!readoutTitle || !readoutCopy || !meterA || !meterB || !meterC || !meterALabel || !meterBLabel || !meterCLabel) return;

  readoutTitle.textContent = state.title;
  readoutCopy.textContent = state.copy;
  meterALabel.textContent = state.labels[0];
  meterBLabel.textContent = state.labels[1];
  meterCLabel.textContent = state.labels[2];
  meterA.style.width = `${state.meters[0]}%`;
  meterB.style.width = `${state.meters[1]}%`;
  meterC.style.width = `${state.meters[2]}%`;

  document.querySelectorAll("[data-service]").forEach((tab) => {
    const selected = tab.dataset.service === key;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const number = parseInt(value, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawBeam(originX, originY, targetX, targetY, spread, color, alpha) {
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(originX, originY, targetX, targetY);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.62, rgba(color, alpha * 0.32));
  gradient.addColorStop(1, rgba(color, 0));

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(targetX - spread, targetY);
  ctx.lineTo(targetX + spread, targetY);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawSpeaker(x, y, scale) {
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-28, -92, 56, 184, 6);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(0, -48 + i * 48, 16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.stroke();
  }
  ctx.restore();
}

function drawStage(time) {
  if (!canvas || !ctx || !width || !height) return;

  const active = serviceState[activeService] || serviceState.sunet;
  const accent = active.color;
  const t = time * 0.001;

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#030306");
  bg.addColorStop(0.48, "#11091f");
  bg.addColorStop(1, "#030306");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  for (let i = 0; i < 44; i += 1) {
    const x = ((i * 97) % width) + Math.sin(t * 0.26 + i) * 8;
    const y = ((i * 53) % height) * 0.72;
    ctx.beginPath();
    ctx.arc(x, y, (i % 3) + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const trussY = height * 0.18;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.48, trussY);
  ctx.lineTo(width * 0.94, trussY + height * 0.0005);
  ctx.stroke();

  for (let i = 0; i < 7; i += 1) {
    const x = width * (0.5 + i * 0.07);
    const y = trussY + Math.sin(t + i) * 3;
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(x - 5, y - 5, 10, 10);
  }

  const origins = [
    [width * 0.52, trussY + 8],
    [width * 0.62, trussY + 3],
    [width * 0.73, trussY + 8],
    [width * 0.84, trussY + 3]
  ];

  origins.forEach(([ox, oy], index) => {
    const sway = Math.sin(t * 0.78 + index * 1.4) * width * 0.08;
    const pointerPull = (pointerX - 0.5) * width * 0.09;
    const targetX = width * (0.55 + index * 0.08) + sway + pointerPull;
    const targetY = height * (0.78 + Math.sin(t * 0.55 + index) * 0.03);
    const color = index % 2 === 0 ? accent : (activeService === "lumini" ? "#8c3dff" : "#6ff5ff");
    drawBeam(ox, oy, targetX, targetY, width * 0.09, color, activeService === "lumini" ? 0.23 : 0.18);
  });

  if (activeService === "lumini") {
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 10; i += 1) {
      const y = height * (0.32 + i * 0.035) + Math.sin(t * 1.7 + i) * 12;
      ctx.strokeStyle = i % 2 ? "rgba(111, 245, 255, 0.46)" : "rgba(198, 166, 255, 0.42)";
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.42);
      ctx.lineTo(width * (0.78 + Math.sin(t + i) * 0.18), y);
      ctx.stroke();
    }
  }

  const screenX = width * 0.64;
  const screenY = height * 0.36;
  const screenW = Math.min(width * 0.25, 360);
  const screenH = screenW * 0.52;
  const screenGradient = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
  screenGradient.addColorStop(0, rgba(accent, 0.34));
  screenGradient.addColorStop(1, "rgba(255, 255, 255, 0.06)");
  ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
  ctx.fillRect(screenX - 10, screenY - 10, screenW + 20, screenH + 20);
  ctx.fillStyle = screenGradient;
  ctx.fillRect(screenX, screenY, screenW, screenH);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    const x = screenX + (screenW / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, screenY);
    ctx.lineTo(x, screenY + screenH);
    ctx.stroke();
  }
  for (let i = 1; i < 4; i += 1) {
    const y = screenY + (screenH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(screenX, y);
    ctx.lineTo(screenX + screenW, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i < 18; i += 1) {
    const barHeight = 10 + Math.sin(t * 2 + i) * 8 + (i % 4) * 5;
    ctx.fillRect(screenX + 22 + i * 15, screenY + screenH - 24 - barHeight, 8, barHeight);
  }

  const floor = ctx.createLinearGradient(0, height * 0.67, 0, height);
  floor.addColorStop(0, "rgba(255, 255, 255, 0.03)");
  floor.addColorStop(1, "rgba(0, 0, 0, 0.78)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, height * 0.67, width, height * 0.33);

  ctx.strokeStyle = rgba(accent, 0.16);
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const y = height * 0.72 + i * height * 0.027;
    ctx.beginPath();
    ctx.moveTo(width * 0.42 - i * 18, y);
    ctx.lineTo(width * 0.98 + i * 28, y);
    ctx.stroke();
  }

  drawSpeaker(width * 0.57, height * 0.62, 0.86);
  drawSpeaker(width * 0.91, height * 0.62, 0.86);

  ctx.fillStyle = "rgba(0, 0, 0, 0.74)";
  ctx.fillRect(width * 0.53, height * 0.76, width * 0.4, height * 0.045);
  ctx.fillStyle = rgba(accent, 0.42);
  ctx.fillRect(width * 0.53, height * 0.755, width * 0.4, 2);

  if (!reduceMotion) {
    requestAnimationFrame(drawStage);
  }
}

function createFallbackVisual(product) {
  const art = document.createElement("div");
  const visual = product.visual || product.category || "gear";
  art.className = `product-art product-art--${visual}`;
  art.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 5; i += 1) {
    art.appendChild(document.createElement("span"));
  }

  return art;
}

function createProductMedia(product, options = {}) {
  const media = document.createElement("div");
  media.className = options.className ? `product-media ${options.className}` : "product-media";
  const imageScale = options.featured ? product.showcaseScale : product.cardScale;
  const imageX = options.featured ? product.showcaseX : product.cardX;
  const imageY = options.featured ? product.showcaseY : product.cardY;
  const imageFit = options.featured ? product.showcaseFit : product.cardFit;
  const imagePadding = options.featured ? product.showcasePadding : product.cardPadding;

  if (imageScale) media.style.setProperty("--product-image-scale", imageScale);
  if (imageX) media.style.setProperty("--product-image-x", imageX);
  if (imageY) media.style.setProperty("--product-image-y", imageY);
  if (imageFit) media.style.setProperty("--product-image-fit", imageFit);
  if (imagePadding) {
    media.style.setProperty(options.featured ? "--product-media-padding" : "--product-image-padding", imagePadding);
  }

  if (product.image) {
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = options.alt ?? product.name;
    img.loading = options.loading || "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => {
      media.classList.add("is-fallback");
      img.remove();
      media.appendChild(createFallbackVisual(product));
    }, { once: true });
    media.appendChild(img);
  } else {
    media.classList.add("is-fallback");
    media.appendChild(createFallbackVisual(product));
  }

  return media;
}

function createProductCard(product, options = {}) {
  const compact = options.compact === true;
  const article = document.createElement("article");
  article.className = compact ? "product-card product-card--compact" : "product-card";
  article.id = compact ? "" : product.id;
  article.dataset.productCategory = product.category;

  const media = createProductMedia(product, { loading: compact ? "eager" : "lazy" });

  const body = document.createElement("div");
  body.className = "product-body";

  const category = document.createElement("span");
  category.className = "product-category";
  category.textContent = product.categoryLabel;

  const meta = document.createElement("div");
  meta.className = "product-meta";
  meta.appendChild(category);

  if (product.quantity) {
    const quantity = document.createElement("span");
    quantity.className = "product-quantity";
    quantity.textContent = product.quantity;
    meta.appendChild(quantity);
  }

  const title = document.createElement("h3");
  title.textContent = product.name;

  const short = document.createElement("p");
  short.textContent = product.short;

  const specs = document.createElement("ul");
  specs.className = "product-specs";
  product.specs.slice(0, compact ? 3 : 6).forEach((spec) => {
    const item = document.createElement("li");
    item.textContent = spec;
    specs.appendChild(item);
  });

  body.append(meta, title, short, specs);

  const actions = document.createElement("div");
  actions.className = "product-actions";

  if (compact) {
    const details = document.createElement("a");
    details.href = `echipamente.html#${product.id}`;
    details.textContent = "Detalii";
    actions.appendChild(details);
  } else if (product.sourceUrl) {
    const source = document.createElement("a");
    source.href = product.sourceUrl;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = "Fișă producător";
    actions.appendChild(source);
  }

  if (actions.children.length) {
    body.appendChild(actions);
  }

  article.append(media, body);
  return article;
}

function setupProductShowcase() {
  const showcase = document.querySelector("[data-product-showcase]");
  if (!showcase || !products.length) return;

  const mediaSlot = showcase.querySelector("[data-showcase-media]");
  const category = showcase.querySelector("[data-showcase-category]");
  const title = showcase.querySelector("[data-showcase-title]");
  const copy = showcase.querySelector("[data-showcase-copy]");
  const specs = showcase.querySelector("[data-showcase-specs]");
  const link = showcase.querySelector("[data-showcase-link]");
  const indexText = showcase.querySelector("[data-showcase-index]");
  const totalText = showcase.querySelector("[data-showcase-total]");
  const thumbs = showcase.querySelector("[data-showcase-thumbs]");
  const dots = showcase.querySelector("[data-showcase-dots]");
  const prev = showcase.querySelector("[data-showcase-prev]");
  const next = showcase.querySelector("[data-showcase-next]");
  let activeIndex = 0;
  let touchStartX = 0;

  const formatIndex = (index) => String(index + 1).padStart(2, "0");

  function setActive(index) {
    activeIndex = (index + products.length) % products.length;
    const product = products[activeIndex];

    mediaSlot?.replaceChildren(createProductMedia(product, { loading: "eager", featured: true }));

    if (category) category.textContent = product.categoryLabel;
    if (title) title.textContent = product.name;
    if (copy) copy.textContent = product.short;
    if (link) link.href = `echipamente.html#${product.id}`;
    if (indexText) indexText.textContent = formatIndex(activeIndex);
    if (totalText) totalText.textContent = `/ ${String(products.length).padStart(2, "0")}`;

    if (specs) {
      specs.replaceChildren(...product.specs.slice(0, 3).map((spec) => {
        const item = document.createElement("li");
        item.textContent = spec;
        return item;
      }));
    }

    thumbs?.querySelectorAll("[data-showcase-thumb]").forEach((button, thumbIndex) => {
      const selected = thumbIndex === activeIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));

      if (selected) {
        button.scrollIntoView({ block: "nearest", inline: "center" });
      }
    });

    dots?.querySelectorAll("[data-showcase-dot]").forEach((button, dotIndex) => {
      const selected = dotIndex === activeIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
  }

  thumbs?.replaceChildren(...products.map((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "showcase-thumb";
    button.dataset.showcaseThumb = String(index);
    button.setAttribute("aria-label", `Arată ${product.name}`);
    button.setAttribute("aria-pressed", "false");

    const label = document.createElement("span");
    label.textContent = product.name;

    button.append(
      createProductMedia(product, {
        className: "showcase-thumb-media",
        loading: index < 8 ? "eager" : "lazy",
        alt: ""
      }),
      label
    );
    button.addEventListener("click", () => setActive(index));
    return button;
  }));

  dots?.replaceChildren(...products.map((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "showcase-dot";
    button.dataset.showcaseDot = String(index);
    button.setAttribute("aria-label", `Slide ${formatIndex(index)}: ${product.name}`);
    button.addEventListener("click", () => setActive(index));
    return button;
  }));

  prev?.addEventListener("click", () => setActive(activeIndex - 1));
  next?.addEventListener("click", () => setActive(activeIndex + 1));

  showcase.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(activeIndex + 1);
    }
  });

  showcase.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });

  showcase.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > 48) {
      setActive(activeIndex + (deltaX < 0 ? 1 : -1));
    }
  }, { passive: true });

  setActive(0);
}

function setupProductRail() {
  const rail = document.querySelector("[data-product-rail]");
  if (!rail || !products.length) return;

  rail.replaceChildren(...products.map((product) => createProductCard(product, { compact: true })));

  const prev = document.querySelector("[data-rail-prev]");
  const next = document.querySelector("[data-rail-next]");
  const scrollBy = () => Math.min(rail.clientWidth * 0.86, 760);

  prev?.addEventListener("click", () => rail.scrollBy({ left: -scrollBy(), behavior: "smooth" }));
  next?.addEventListener("click", () => rail.scrollBy({ left: scrollBy(), behavior: "smooth" }));
}

function productMatches(product, filter, query) {
  const inCategory = filter === "all" || product.category === filter;
  const searchable = [
    product.name,
    product.categoryLabel,
    product.short,
    product.quantity || "",
    ...product.specs
  ].join(" ").toLocaleLowerCase("ro-RO");

  return inCategory && searchable.includes(query);
}

function setupCatalog() {
  const grid = document.querySelector("[data-catalog-grid]");
  if (!grid || !products.length) return;

  const count = document.querySelector("[data-catalog-count]");
  const search = document.querySelector("[data-catalog-search]");
  const filters = document.querySelectorAll("[data-filter]");
  let activeFilter = "all";

  function render() {
    const query = (search?.value || "").trim().toLocaleLowerCase("ro-RO");
    const visibleProducts = products.filter((product) => productMatches(product, activeFilter, query));

    grid.replaceChildren(...visibleProducts.map((product) => createProductCard(product)));

    if (count) {
      count.textContent = String(visibleProducts.length);
    }

    requestAnimationFrame(() => {
      const targetId = decodeURIComponent(window.location.hash.replace("#", ""));
      const target = targetId ? document.getElementById(targetId) : null;
      document.querySelectorAll(".product-card.is-target").forEach((card) => card.classList.remove("is-target"));

      if (target) {
        target.classList.add("is-target");
        target.scrollIntoView({ block: "center" });
      }
    });
  }

  filters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      activeFilter = filterButton.dataset.filter || "all";
      filters.forEach((button) => {
        const selected = button === filterButton;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
      render();
    });
  });

  search?.addEventListener("input", render);
  render();
}

function setupMixer() {
  document.querySelectorAll("[data-service]").forEach((tab) => {
    tab.addEventListener("click", () => setService(tab.dataset.service));
  });
}

function setupQuoteForm() {
  const form = document.querySelector("[data-quote-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const body = [
      `Nume: ${data.get("name")}`,
      `Telefon: ${data.get("phone")}`,
      `Tip eveniment: ${data.get("eventType")}`,
      `Operatori tehnici: ${data.get("crew")}`,
      `Data: ${data.get("date") || "de stabilit"}`,
      "",
      `Detalii: ${data.get("message") || "Nu au fost adăugate încă."}`
    ].join("\n");

    status.textContent = "Se deschide emailul cu cererea completată.";
    window.location.href = `mailto:contact@ddsound.ro?subject=${encodeURIComponent("Cerere ofertă D&D Sound")}&body=${encodeURIComponent(body)}`;
  });
}

window.addEventListener("scroll", setHeaderState, { passive: true });

window.addEventListener("resize", () => {
  resizeCanvas();
  if (reduceMotion) drawStage(0);
});

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX / Math.max(window.innerWidth, 1);
  pointerY = event.clientY / Math.max(window.innerHeight, 1);
}, { passive: true });

menuButton?.addEventListener("click", toggleMenu);
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

setupProductShowcase();
setupProductRail();
setupCatalog();
setHeaderState();
setupReveals();
setupMixer();
setupQuoteForm();
resizeCanvas();
setService(activeService);
drawStage(0);
