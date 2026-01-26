const root = document.getElementById("landing-root");
const languageSwitcher = document.getElementById("language-switcher");
const sectionTemplate = document.getElementById("section-template");

const state = {
  locale: "en",
  content: null,
};

const renderers = {
  hero: (block, copy) => {
    const highlights = copy.highlights
      .map((item) => `<li>${item}</li>`)
      .join("");
    return `
      <div class="container hero">
        <div>
          <p class="eyebrow">${copy.eyebrow}</p>
          <h1>${copy.title}</h1>
          <p class="lead">${copy.subtitle}</p>
          <div class="cta-row">
            <a class="button" href="#">${copy.primaryCta}</a>
            <a class="button secondary" href="#">${copy.secondaryCta}</a>
          </div>
        </div>
        <div class="hero-card">
          <h3>${copy.mediaTitle}</h3>
          <p class="lead">${copy.mediaText}</p>
          <ul class="steps">${highlights}</ul>
        </div>
      </div>
    `;
  },
  logoCloud: (block, copy) => {
    const logos = copy.logos
      .map((logo) => `<div class="card">${logo}</div>`)
      .join("");
    return `
      <div class="container">
        <p class="eyebrow">${copy.title}</p>
        <div class="card-grid">${logos}</div>
      </div>
    `;
  },
  featureList: (block, copy) => {
    const items = copy.items
      .map(
        (item) => `
          <article class="card">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </article>
        `
      )
      .join("");
    return `
      <div class="container">
        <p class="eyebrow">${copy.eyebrow}</p>
        <h2>${copy.title}</h2>
        <p class="lead">${copy.subtitle}</p>
        <div class="card-grid">${items}</div>
      </div>
    `;
  },
  split: (block, copy) => {
    const stats = copy.stats
      .map(
        (stat) => `
          <div class="stat">
            <strong>${stat.value}</strong>
            <span>${stat.label}</span>
          </div>
        `
      )
      .join("");
    return `
      <div class="container split">
        <div>
          <p class="eyebrow">${copy.eyebrow}</p>
          <h2>${copy.title}</h2>
          <p class="lead">${copy.description}</p>
          <div class="stat-grid">${stats}</div>
        </div>
        <div class="hero-card">
          <p class="eyebrow">${copy.imageLabel}</p>
          <div class="card-grid">
            <div class="card">
              <h3>Session</h3>
              <p>Ella · 3:00 PM · 12 gowns pre-loaded</p>
            </div>
            <div class="card">
              <h3>Top 10</h3>
              <p>Shared with bride + follow-up scheduled</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  steps: (block, copy) => {
    const steps = copy.steps
      .map(
        (step, index) => `
          <li>
            <strong>${index + 1}. ${step.title}</strong>
            <p>${step.description}</p>
          </li>
        `
      )
      .join("");
    return `
      <div class="container">
        <p class="eyebrow">${copy.eyebrow}</p>
        <h2>${copy.title}</h2>
        <ol class="steps">${steps}</ol>
      </div>
    `;
  },
  testimonial: (block, copy) => {
    return `
      <div class="container">
        <div class="testimonial">
          <p class="quote">“${copy.quote}”</p>
          <strong>${copy.name}</strong>
          <p class="lead">${copy.role}</p>
        </div>
      </div>
    `;
  },
  cta: (block, copy) => {
    return `
      <div class="container">
        <div class="hero-card">
          <h2>${copy.title}</h2>
          <p class="lead">${copy.subtitle}</p>
          <div class="cta-row">
            <a class="button" href="#">${copy.primaryCta}</a>
            <a class="button secondary" href="#">${copy.secondaryCta}</a>
          </div>
        </div>
      </div>
    `;
  },
  footer: (block, copy) => {
    const links = copy.links
      .map((link) => `<a href="#">${link}</a>`)
      .join("");
    return `
      <div class="container footer">
        <strong>${copy.title}</strong>
        <p>${copy.description}</p>
        <div class="footer-links">${links}</div>
      </div>
    `;
  },
};

const getBlockCopy = (block) => {
  if (!block.content) {
    return null;
  }
  return block.content[state.locale] || block.content[state.content.defaultLocale];
};

const buildSection = (block) => {
  const copy = getBlockCopy(block);
  if (!copy || !renderers[block.type]) {
    return null;
  }
  const section = sectionTemplate.content.firstElementChild.cloneNode(true);
  if (block.theme === "alt") {
    section.classList.add("alt");
  }
  section.innerHTML = renderers[block.type](block, copy);
  return section;
};

const renderLanguageSwitcher = () => {
  languageSwitcher.innerHTML = "";
  Object.entries(state.content.locales).forEach(([key, locale]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = locale.label;
    if (key === state.locale) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => setLocale(key));
    languageSwitcher.appendChild(button);
  });
};

const renderBlocks = () => {
  root.innerHTML = "";
  state.content.blocks.forEach((block) => {
    const section = buildSection(block);
    if (section) {
      root.appendChild(section);
    }
  });
};

const setLocale = (locale) => {
  state.locale = locale;
  localStorage.setItem("landing-locale", locale);
  renderLanguageSwitcher();
  renderBlocks();
};

const init = async () => {
  const response = await fetch("landing-content.json");
  const data = await response.json();
  state.content = data;
  const storedLocale = localStorage.getItem("landing-locale");
  state.locale = storedLocale || data.defaultLocale;
  renderLanguageSwitcher();
  renderBlocks();
};

init();
