/* =====================================================
   Matdaan Mitra – Election Awareness Portal
   One JS file for all pages. Each feature first checks
   that its element exists, so it only runs on its page.
   ===================================================== */

// ---------- 1. THEME (Local Storage #1) ----------
const root = document.documentElement;
// getItem returns null if nothing is saved yet
const savedTheme = localStorage.getItem("theme");
root.dataset.theme = savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

// ---------- 2. SHARED NAVBAR + FOOTER ----------
const pages = [["Home","index.html"],["About","about.html"],["Services","services.html"],["Gallery","gallery.html"],["Contact","contact.html"]];
const current = location.pathname.split("/").pop() || "index.html";
const links = pages.map(([name, url]) =>
  `<li><a href="${url}" ${url === current ? 'class="active" aria-current="page"' : ""}>${name}</a></li>`).join("");

document.getElementById("site-header").innerHTML = `
  <header class="site"><nav class="nav wrap" aria-label="Main">
    <a class="brand" href="index.html">🗳️ Matdaan Mitra</a>
    <button id="menuBtn" aria-label="Open menu" aria-expanded="false">☰</button>
    <ul id="menu">${links}</ul>
    <button id="themeBtn" aria-label="Switch light or dark theme"></button>
  </nav></header>`;

document.getElementById("site-footer").innerHTML = `
  <footer class="site"><div class="wrap">
    <div class="row">
      <div><strong>Matdaan Mitra</strong><br>Election awareness portal (college project)</div>
      <div>Voter Helpline: <a href="tel:1950">1950</a><br><a href="https://voters.eci.gov.in" target="_blank" rel="noopener">voters.eci.gov.in</a></div>
      <div>${pages.map(([n,u]) => `<a href="${u}">${n}</a>`).join(" · ")}</div>
    </div>
    <p>For awareness only. Confirm dates and rules on the official Election Commission of India website.</p>
  </div></footer>`;

// Hamburger menu: just toggle the "open" class, CSS does the rest
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

// Theme button
const themeBtn = document.getElementById("themeBtn");
const showThemeIcon = () => themeBtn.textContent = root.dataset.theme === "dark" ? "☀️" : "🌙";
showThemeIcon();
themeBtn.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", root.dataset.theme);   // remember choice
  showThemeIcon();
});

// ---------- 3. IMAGE SLIDER (Home page) ----------
const slides = document.querySelectorAll(".slide");
if (slides.length) {
  let index = 0, timer;
  function showSlide(n) {
    index = (n + slides.length) % slides.length;        // wraps around at both ends
    slides.forEach((s, k) => s.classList.toggle("active", k === index));
  }
  function startAuto() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => showSlide(index + 1), 4000);   // change every 4 seconds
  }
  function restartAuto() { clearInterval(timer); startAuto(); }
  document.getElementById("next").addEventListener("click", () => { showSlide(index + 1); restartAuto(); });
  document.getElementById("prev").addEventListener("click", () => { showSlide(index - 1); restartAuto(); });
  showSlide(0);
  startAuto();
}

// ---------- 4. SERVICES: DATA + SEARCH + SAVED (Local Storage #2) ----------
const services = [
  {id:1, icon:"📝", title:"Voter Registration", text:"Apply for a new voter ID using Form 6 if you are 18 or older.", url:"https://voters.eci.gov.in"},
  {id:2, icon:"🔎", title:"Check Name in Voter List", text:"Search the electoral roll with your name or EPIC number.", url:"https://electoralsearch.eci.gov.in"},
  {id:3, icon:"📍", title:"Find Polling Booth", text:"Know your polling station and serial number before election day.", url:"https://voters.eci.gov.in"},
  {id:4, icon:"👤", title:"Know Your Candidate", text:"Read candidate affidavits on assets, education and criminal cases.", url:"https://affidavit.eci.gov.in"},
  {id:5, icon:"🖲️", title:"How EVM and VVPAT Work", text:"Press the button, see the paper slip for about 7 seconds, done.", url:"about.html"},
  {id:6, icon:"🚨", title:"Report Code of Conduct Violation", text:"Report bribery or rule breaking through the cVIGIL app.", url:"https://eci.gov.in"},
  {id:7, icon:"📞", title:"Voter Helpline 1950", text:"Call 1950 (with your STD code) for any voting related question.", url:"tel:1950"}
];

const grid = document.getElementById("serviceGrid");
if (grid) {
  const search = document.getElementById("search");
  const count = document.getElementById("favCount");
  // JSON.parse turns the saved text back into an array
  let saved = JSON.parse(localStorage.getItem("savedServices")) || [];

  function renderServices() {
    const q = search.value.trim().toLowerCase();
    // filter keeps only services whose title or text contains the typed word
    const list = services.filter(s => (s.title + " " + s.text).toLowerCase().includes(q));
    grid.innerHTML = list.length ? list.map(s => `
      <article class="card">
        <button class="fav" data-id="${s.id}" aria-label="Save ${s.title}" aria-pressed="${saved.includes(s.id)}">${saved.includes(s.id) ? "★" : "☆"}</button>
        <div class="icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <a href="${s.url}">Open</a>
      </article>`).join("") : "<p>No service matches your search. Try another word.</p>";
    count.textContent = `Saved services: ${saved.length}`;
  }
  search.addEventListener("input", renderServices);       // runs on every keystroke
  // Event delegation: one listener for all star buttons
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".fav");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    localStorage.setItem("savedServices", JSON.stringify(saved));  // arrays must become text
    renderServices();
  });
  renderServices();
}

// ---------- 5. GALLERY: FILTER + LIGHTBOX ----------
// To use real photos, add img:"images/photo1.jpg" to an item.
const photos = [
  {t:"Voter Registration Camp", c:"Awareness", e:"📝", bg:"#2a1a6e"},
  {t:"First-Time Voters", c:"Youth", e:"🎓", bg:"#b85e00"},
  {t:"Inked Finger", c:"Voting", e:"☝️", bg:"#5b3fd1"},
  {t:"Polling Booth Queue", c:"Voting", e:"🏫", bg:"#0f5a33"},
  {t:"Rally for Awareness", c:"Awareness", e:"📣", bg:"#8a2b5c"},
  {t:"Youth Pledge", c:"Youth", e:"🤝", bg:"#1b6a8a"},
  {t:"EVM and VVPAT", c:"Voting", e:"🖲️", bg:"#3b3f5c"},
  {t:"Voter Pledge Poster", c:"Awareness", e:"🖼️", bg:"#a0471b"}
];
const gal = document.getElementById("galleryGrid");
if (gal) {
  const filterBox = document.getElementById("galleryFilters");
  const box = document.getElementById("lightbox");
  const cats = ["All", ...new Set(photos.map(p => p.c))];     // unique categories
  let active = "All";

  function renderGallery() {
    const list = photos.filter(p => active === "All" || p.c === active);
    gal.innerHTML = list.map(p => `
      <div class="tile" role="button" tabindex="0" data-t="${p.t}" style="background:${p.bg}">
        ${p.img ? `<img src="${p.img}" alt="${p.t}">` : p.e}<span>${p.t}</span>
      </div>`).join("");
    filterBox.innerHTML = cats.map(c => `<button class="${c === active ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  }
  filterBox.addEventListener("click", e => { if (e.target.dataset.c) { active = e.target.dataset.c; renderGallery(); } });
  function openTile(e) {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    box.innerHTML = tile.outerHTML;                            // copy the clicked tile into the popup
    box.classList.add("show");
  }
  gal.addEventListener("click", openTile);
  gal.addEventListener("keydown", e => { if (e.key === "Enter") openTile(e); });
  box.addEventListener("click", () => box.classList.remove("show"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") box.classList.remove("show"); });
  renderGallery();
}

// ---------- 6. CONTACT FORM: VALIDATION + SAVED MESSAGES (Local Storage #3) ----------
const form = document.getElementById("contactForm");
if (form) {
  const rules = {
    name:    v => /^[A-Za-z ]{3,}$/.test(v)          ? "" : "Enter your name (letters only, at least 3).",
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email like name@example.com.",
    phone:   v => /^[6-9]\d{9}$/.test(v)             ? "" : "Enter a 10 digit Indian mobile number starting with 6 to 9.",
    message: v => v.length >= 10                     ? "" : "Write at least 10 characters."
  };
  const list = document.getElementById("msgList");

  function check(field) {
    const input = form.elements[field];
    const error = rules[field](input.value.trim());
    input.classList.toggle("bad", error !== "");
    document.getElementById(field + "Err").textContent = error;
    return error === "";
  }
  Object.keys(rules).forEach(f => form.elements[f].addEventListener("blur", () => check(f)));

  function showMessages() {
    const all = JSON.parse(localStorage.getItem("messages")) || [];
    list.innerHTML = "";
    if (!all.length) { list.textContent = "No messages saved on this device yet."; return; }
    all.forEach(m => {
      const d = document.createElement("div");
      d.className = "msg";
      d.textContent = `${m.name} (${m.phone}): ${m.message}`;   // textContent is safe from HTML injection
      const s = document.createElement("small");
      s.textContent = ` ${m.date}`;
      d.appendChild(s);
      list.appendChild(d);
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();                                          // stop the page from reloading
    const allValid = Object.keys(rules).map(check).every(Boolean);
    const status = document.getElementById("formStatus");
    if (!allValid) { status.className = "err"; status.textContent = "Please fix the errors above."; return; }
    const all = JSON.parse(localStorage.getItem("messages")) || [];
    all.push({
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(), message: form.elements.message.value.trim(),
      date: new Date().toLocaleString()
    });
    localStorage.setItem("messages", JSON.stringify(all));
    form.reset();
    status.className = "ok";
    status.textContent = "Thank you! Your message has been saved.";
    showMessages();
  });
  document.getElementById("clearMsgs").addEventListener("click", () => { localStorage.removeItem("messages"); showMessages(); });
  showMessages();
}
