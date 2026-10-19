const phone = "5493884868202";
const homePlatforms = [
  { name: "Netflix", image: "https://cdn.simpleicons.org/netflix/E50914", color: "#e50914" },
  { name: "Disney+", image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Disney%2B%202024.svg", color: "#3159c9" },
  { name: "HBO Max", image: "https://cdn.simpleicons.org/hbomax/642DE0", color: "#642de0" },
  { name: "Paramount+", image: "https://cdn.simpleicons.org/paramountplus/176FE5", color: "#176fe5" },
  { name: "Crunchyroll", image: "https://cdn.simpleicons.org/crunchyroll/F47521", color: "#f47521" },
  { name: "Apple TV+", image: "https://cdn.simpleicons.org/appletv/ffffff", color: "#e8e8ed" },
  { name: "Prime Video", image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Prime%20Video%20logo%20%282024%29.svg", color: "#00a8e0" },
  { name: "Universal+", image: "https://universalplus.com/assets/logo.svg", color: "#6678df" },
  { name: "CapCut", image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/CapCut%20logo.svg", color: "#ffffff" },
  { name: "ChatGPT", image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/OpenAI%20logo%202025%20%28symbol%29.svg", color: "#10a37f" },
  { name: "Personal", image: "https://www.personal.com.ar/content/dam/teco-cms-ecosystem/logo/brand.svg", color: "#ef3e42" },
  { name: "Claro", image: "https://www.claro.com.ar/static/claro-logo-red-atlas-2.svg", color: "#ed1c24" },
  { name: "L.A.SHOP", image: "assets/tv-apps/la-shop.png", color: "#e8b34d" },
  { name: "Lumix TV", image: "assets/tv-apps/tv-color.png", color: "#8b6cff" },
  { name: "Femon Plus", image: "assets/tv-apps/femon-plus.png", color: "#a26bff" },
  { name: "Vexa APP", image: "assets/tv-apps/vexa-app.png", color: "#ce7dff" },
  { name: "MarTV", image: "assets/tv-apps/martv-logo.png", color: "#22d995" },
  { name: "FutureTV", image: "assets/tv-apps/future-tv.png", color: "#48caff" },
  { name: "Nueva TV", image: "assets/tv-apps/tv-verde.png", color: "#75e85e" },
  { name: "TV Plus 2", image: "assets/tv-apps/tv-plus-2-logo.png", color: "#3f7cff" },
  { name: "Alfa TV Lite", image: "assets/tv-apps/alfa-tv-lite-logo-full.png", color: "#e4bd65" },
  { name: "Flujo", image: "assets/tv-apps/flujo.png", color: "#ff7c38" }
];

const platformMarquee = document.querySelector("#platform-marquee");
if (platformMarquee) {
  [homePlatforms.slice(0, 11), homePlatforms.slice(11)].forEach((platforms, rowIndex) => {
    const row = document.createElement("div");
    row.className = `platform-marquee__row${rowIndex === 1 ? " platform-marquee__row--reverse" : ""}`;
    const track = document.createElement("div");
    track.className = "platform-marquee__track";

    [false, true].forEach((duplicate) => {
      const set = document.createElement("div");
      set.className = "platform-marquee__set";
      if (duplicate) set.setAttribute("aria-hidden", "true");
      platforms.forEach(({ name, image, color }) => {
        const chip = document.createElement("span");
        chip.className = "platform-chip";
        chip.style.setProperty("--brand", color);
        const logo = document.createElement("img");
        logo.src = image;
        logo.alt = "";
        logo.loading = "lazy";
        const label = document.createElement("span");
        label.textContent = name;
        chip.append(logo, label);
        set.append(chip);
      });
      track.append(set);
    });

    row.append(track);
    platformMarquee.append(row);
  });
}
const productCards = [...document.querySelectorAll(".product")];
const filterButtons = [...document.querySelectorAll(".filter")];
document.querySelectorAll(".order-link").forEach((link) => {
  const product = link.dataset.product;
  const card = link.closest(".product");
  if (card?.dataset.category === "streaming") {
    link.innerHTML = 'Consultar <b aria-hidden="true">→</b>';
    link.setAttribute("aria-label", `Consultar por ${product}`);
  }

  const message = "Hola, quiero consultar por " + product + " en RPlay Digital.";
  link.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    productCards.forEach((card) => {
      const visible = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("hidden", !visible);
      if (visible) card.classList.add("visible");
    });
  });
});

document.querySelectorAll(".logo img, .float-logo img, .platform-chip img").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
  }, { once: true });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));




document.querySelectorAll(".payment-link").forEach((paymentLink) => {
  const card = paymentLink.closest(".product");
  const service = paymentLink.dataset.receiptProduct || card?.querySelector("h3")?.textContent.trim() || "servicio";
  const actions = paymentLink.closest(".product-actions");
  if (!actions || actions.querySelector(".receipt-link")) return;

  const isInternet = card?.dataset.category === "internet";
  const customerDetails = isInternet
    ? "Mi nombre es: ___. Operador elegido (Personal o Claro): ___."
    : "Mi nombre es: ___.";
  const receiptLink = document.createElement("a");
  receiptLink.className = "receipt-link";
  receiptLink.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(
    `Hola, ya pagué ${service} en RPlay Digital. Adjunto el comprobante para activar el servicio. ${customerDetails}`
  );
  receiptLink.target = "_blank";
  receiptLink.rel = "noopener noreferrer";
  receiptLink.title = isInternet
    ? "Abrí WhatsApp, adjuntá el comprobante e indicá tu nombre y si elegiste Personal o Claro"
    : "Abrí WhatsApp, adjuntá el comprobante e indicá tu nombre";
  receiptLink.setAttribute("aria-label", `Avisar el pago de ${service} y enviar el comprobante por WhatsApp`);
  receiptLink.innerHTML = 'Ya pagué <b aria-hidden="true">↗</b>';
  actions.append(receiptLink);
});