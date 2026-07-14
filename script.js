// Ex Ante Fest widget — renders all sections from /data/*.json
// To update content: edit the JSON files in /data. No changes needed here
// unless you're adding a new *type* of section.

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// ---------- Renderers ----------

function renderHero(editions, year) {
  const entry = editions.years.find(y => y.year === year);
  document.getElementById("hero-dates").textContent = entry ? entry.dates : "";
  document.getElementById("hero-eyebrow").textContent = entry
    ? `${entry.label} · Икономически фестивал`
    : "Икономически фестивал";
  if (entry && entry.tagline) {
    document.getElementById("hero-tagline").textContent =
      `Тема на изданието: ${entry.tagline}. Три дни дискусии, лектори и музика в сърцето на Родопите.`;
  }
}

function renderSchedule(days) {
  const container = document.getElementById("schedule-content");
  container.innerHTML = "";
  if (!days || !days.length) {
    container.appendChild(el("p", "empty-state", "Програмата предстои да бъде обявена."));
    return;
  }
  days.forEach(day => {
    const block = el("div", "day-block");
    block.appendChild(el("div", "day-label", day.label || day.date));
    (day.events || []).forEach(ev => {
      const row = el("div", ev.type === "break" ? "event-row event-row--break" : "event-row");
      row.appendChild(el("div", "event-time", ev.time && ev.time.trim() ? ev.time : "TBD"));
      const body = el("div");
      body.appendChild(el("p", "event-title", ev.title || ""));
      if (ev.speaker) body.appendChild(el("p", "event-speaker", ev.speaker));

      if (ev.description && ev.description.trim()) {
        const descId = `desc-${Math.random().toString(36).slice(2, 9)}`;
        const toggle = el("button", "event-toggle", "Прочети повече ▾");
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", descId);

        const desc = el("p", "event-description", ev.description);
        desc.id = descId;
        desc.hidden = true;

        toggle.addEventListener("click", () => {
          const isOpen = toggle.getAttribute("aria-expanded") === "true";
          toggle.setAttribute("aria-expanded", String(!isOpen));
          toggle.textContent = isOpen ? "Прочети повече ▾" : "Скрий ▴";
          desc.hidden = isOpen;
        });

        body.appendChild(toggle);
        body.appendChild(desc);
      }

      row.appendChild(body);
      block.appendChild(row);
    });
    container.appendChild(block);
  });
}

function renderSpeakers(speakers) {
  const container = document.getElementById("speakers-content");
  container.innerHTML = "";
  if (!speakers || !speakers.length) {
    container.appendChild(el("p", "empty-state", "Лекторите предстои да бъдат обявени."));
    return;
  }
  speakers.forEach(sp => {
    const card = el("div", "speaker-card");
    card.appendChild(el("h3", null, sp.name));
    if (sp.role) card.appendChild(el("p", "speaker-role", sp.role));
    if (sp.bio) card.appendChild(el("p", "speaker-bio", sp.bio));
    if (sp.program) card.appendChild(el("p", "speaker-program", `Сесия: ${sp.program}`));
    container.appendChild(card);
  });
}

function renderVenue(venue) {
  const container = document.getElementById("venue-content");
  container.innerHTML = "";
  if (!venue) {
    container.appendChild(el("p", "empty-state", "Информация за мястото предстои."));
    return;
  }
  const heroVenue = document.getElementById("hero-venue");
  if (heroVenue) heroVenue.textContent = venue.name || "—";

  const info = el("div", "venue-card");
  info.appendChild(el("h3", null, venue.name));
  info.appendChild(el("p", null, venue.address || ""));
  if (venue.notes) info.appendChild(el("p", null, venue.notes));

  const mapWrap = el("div", "venue-card venue-map");
  if (venue.mapEmbedUrl) {
    mapWrap.appendChild(el("iframe", null));
    mapWrap.querySelector("iframe").src = venue.mapEmbedUrl;
    mapWrap.querySelector("iframe").loading = "lazy";
    mapWrap.querySelector("iframe").title = "Карта на мястото";
  } else {
    mapWrap.appendChild(el("p", "empty-state", "Картата предстои да бъде добавена."));
  }

  container.appendChild(info);
  container.appendChild(mapWrap);
}

function renderBooths(booths) {
  const container = document.getElementById("booths-content");
  container.innerHTML = "";
  if (!booths || !booths.length) {
    container.appendChild(el("p", "empty-state", "Щандовете и работилниците предстои да бъдат обявени."));
    return;
  }
  booths.forEach(b => {
    const card = el("div", "info-card");
    const h3 = el("h3", null, b.name);
    if (b.confirmed === false) h3.appendChild(el("span", "badge-pending", "В очакване на потвърждение"));
    card.appendChild(h3);
    if (b.description) card.appendChild(el("p", null, b.description));
    const meta = el("div", "info-meta");
    if (b.type) meta.appendChild(el("span", null, b.type));
    if (b.day) meta.appendChild(el("span", null, b.day));
    if (b.time) meta.appendChild(el("span", null, b.time));
    card.appendChild(meta);
    container.appendChild(card);
  });
}

function renderPartners(partners) {
  const container = document.getElementById("partners-content");
  container.innerHTML = "";
  if (!partners || !partners.length) {
    container.appendChild(el("p", "empty-state", "Партньорите предстои да бъдат обявени."));
    return;
  }
  partners.forEach(p => {
    const card = el("div", "partner-card");
    if (p.logo) {
      const img = document.createElement("img");
      img.src = p.logo;
      img.alt = p.name;
      card.appendChild(img);
    }
    const title = p.link ? el("a", null, p.name) : el("h3", null, p.name);
    if (p.link) { title.href = p.link; title.target = "_blank"; title.rel = "noopener"; title.style.fontFamily = "var(--font-display)"; }
    card.appendChild(title);
    if (p.type) card.appendChild(el("p", "partner-type", p.type));
    if (p.notes) card.appendChild(el("p", "partner-notes", p.notes));
    container.appendChild(card);
  });
}

function renderGuide(guide) {
  const stay = document.getElementById("stay-content");
  stay.innerHTML = "";
  (guide.accommodation || []).forEach(item => {
    const card = el("div", "info-card");
    const h3 = el("h3", null, item.name);
    if (item.partner) h3.appendChild(el("span", "badge-partner", "Партньор"));
    card.appendChild(h3);
    if (item.notes) card.appendChild(el("p", null, item.notes));
    const meta = el("div", "info-meta");
    if (item.priceRange) meta.appendChild(el("span", null, item.priceRange));
    if (item.distanceFromVenue) meta.appendChild(el("span", null, item.distanceFromVenue));
    card.appendChild(meta);
    const links = el("div", "info-links");
    if (item.link) {
      const a = el("a", null, "Уебсайт");
      a.href = item.link; a.target = "_blank"; a.rel = "noopener";
      links.appendChild(a);
    }
    if (item.phone) {
      const a = el("a", null, "☎ " + item.phone);
      a.href = "tel:" + item.phone.replace(/\s+/g, "");
      links.appendChild(a);
    }
    if (item.mapLink) {
      const a = el("a", null, "📍 Карта");
      a.href = item.mapLink; a.target = "_blank"; a.rel = "noopener";
      links.appendChild(a);
    }
    if (links.children.length) card.appendChild(links);
    stay.appendChild(card);
  });

  const eat = document.getElementById("eat-content");
  eat.innerHTML = "";
  (guide.food || []).forEach(item => {
    const card = el("div", "info-card");
    card.appendChild(el("h3", null, item.name));
    if (item.notes) card.appendChild(el("p", null, item.notes));
    const meta = el("div", "info-meta");
    if (item.location) meta.appendChild(el("span", null, item.location));
    if (item.cuisine) meta.appendChild(el("span", null, item.cuisine));
    if (item.priceRange) meta.appendChild(el("span", null, item.priceRange));
    if (item.distanceFromVenue) meta.appendChild(el("span", null, item.distanceFromVenue));
    card.appendChild(meta);
    const links = el("div", "info-links");
    if (item.link) {
      const a = el("a", null, "Уебсайт");
      a.href = item.link; a.target = "_blank"; a.rel = "noopener";
      links.appendChild(a);
    }
    if (item.phone) {
      const a = el("a", null, "☎ " + item.phone);
      a.href = "tel:" + item.phone.replace(/\s+/g, "");
      links.appendChild(a);
    }
    if (item.mapLink) {
      const a = el("a", null, "📍 Карта");
      a.href = item.mapLink; a.target = "_blank"; a.rel = "noopener";
      links.appendChild(a);
    }
    if (links.children.length) card.appendChild(links);
    eat.appendChild(card);
  });
}

function renderArchive(editions, activeYear, onSelect) {
  const list = document.getElementById("archive-content");
  list.innerHTML = "";
  const past = editions.years.filter(y => y.year !== editions.current);
  if (!past.length) {
    list.appendChild(el("li", null, `<span class="archive-empty">Това е първото издание в архива — миналите години ще се появят тук.</span>`));
    return;
  }
  past.forEach(y => {
    const isActive = y.year === activeYear;
    const li = el("li", isActive ? "archive-item archive-item--active" : "archive-item");
    li.innerHTML = `<span>${y.label} · ${y.year}</span><span>${y.dates}</span>`;
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-pressed", String(isActive));
    li.addEventListener("click", () => onSelect(y.year));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(y.year);
      }
    });
    list.appendChild(li);
  });
}

function updateEditionBanner(editions, year) {
  const banner = document.getElementById("edition-banner");
  const text = document.getElementById("edition-banner-text");
  if (!banner || !text) return;
  if (year === editions.current) {
    banner.hidden = true;
    return;
  }
  const entry = editions.years.find(y => y.year === year);
  text.textContent = `Преглеждате: ${entry ? entry.label : "издание"} · ${year} г.`;
  banner.hidden = false;
}

// ---------- Load flow ----------

async function loadYear(editions, year) {
  try {
    const [schedule, speakers, venue, partners, booths] = await Promise.all([
      getJSON(`data/${year}/schedule.json`),
      getJSON(`data/${year}/speakers.json`),
      getJSON(`data/${year}/venue.json`),
      getJSON(`data/${year}/partners.json`),
      getJSON(`data/${year}/booths.json`),
    ]);
    renderHero(editions, year);
    renderSchedule(schedule);
    renderSpeakers(speakers);
    renderVenue(venue);
    renderPartners(partners);
    renderBooths(booths);
  } catch (err) {
    console.error(err);
    document.getElementById("schedule-content").innerHTML =
      `<p class="empty-state">Няма данни за ${year} г. все още.</p>`;
    document.getElementById("speakers-content").innerHTML = "";
    document.getElementById("venue-content").innerHTML = "";
    document.getElementById("partners-content").innerHTML = "";
    document.getElementById("booths-content").innerHTML = "";
  }
}

async function switchYear(editions, year) {
  await loadYear(editions, year);
  renderArchive(editions, year, (y) => switchYear(editions, y));
  updateEditionBanner(editions, year);
}

async function init() {
  try {
    const [editions, guide] = await Promise.all([
      getJSON("data/editions.json"),
      getJSON("data/chepelare-guide.json"),
    ]);
    renderGuide(guide);
    renderArchive(editions, editions.current, (y) => switchYear(editions, y));

    const backBtn = document.getElementById("edition-banner-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => switchYear(editions, editions.current));
    }

    await loadYear(editions, editions.current);
  } catch (err) {
    console.error("Failed to initialize widget:", err);
  }
}

init();
