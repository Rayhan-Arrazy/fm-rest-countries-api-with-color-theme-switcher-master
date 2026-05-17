/**
 * REST Countries API with color theme switcher
 * Pure Vanilla JavaScript Implementation
 */

// Global State
let countries = [];
let currentTheme = 'light';

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const contentContainer = document.getElementById('content-container');
const logoBtn = document.getElementById('logo-btn');

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  // Check localStorage first, fallback to system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemPrefersDark) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  currentTheme = theme;

  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-moon';
    themeText.textContent = 'Light Mode';
  } else {
    themeIcon.className = 'fa-regular fa-moon';
    themeText.textContent = 'Dark Mode';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(nextTheme);
});

/* ==========================================================================
   2. Data Normalization & Fetching
   ========================================================================== */

/**
 * Normalizes country data from both REST Countries API v3.1 and local data.json (v2)
 * into a single unified schema for frontend components.
 */
function normalizeCountryData(country) {
  // 1. Resolve Name
  const name = typeof country.name === 'object' ? country.name.common : country.name;

  // 2. Resolve Code (CCA3 / Alpha3)
  const code = country.cca3 || country.alpha3Code || '';

  // 3. Resolve Capital
  const capital = Array.isArray(country.capital)
    ? country.capital[0]
    : (country.capital || 'N/A');

  // 4. Resolve Currencies (standardizing into a simple string list)
  let currencies = [];
  if (country.currencies) {
    if (Array.isArray(country.currencies)) {
      currencies = country.currencies.map(c => c.name);
    } else {
      currencies = Object.values(country.currencies).map(c => c.name);
    }
  }

  // 5. Resolve Languages (standardizing into a simple string list)
  let languages = [];
  if (country.languages) {
    if (Array.isArray(country.languages)) {
      languages = country.languages.map(l => l.name);
    } else {
      languages = Object.values(country.languages);
    }
  }

  return {
    name,
    code,
    capital,
    region: country.region || 'N/A',
    subregion: country.subregion || 'N/A',
    population: country.population || 0,
    nativeName: typeof country.name === 'object'
      ? (Object.values(country.name.nativeName || {})[0]?.common || name)
      : (country.nativeName || name),
    tld: country.tld ? country.tld[0] : (country.topLevelDomain ? country.topLevelDomain[0] : 'N/A'),
    flag: country.flags?.svg || country.flags?.png || '',
    borders: country.borders || [],
    currencies: currencies.join(', ') || 'N/A',
    languages: languages.join(', ') || 'N/A'
  };
}

async function fetchCountries() {
  const API_URL = 'https://restcountries.com/v3.1/all';
  const FALLBACK_URL = '../data.json'; // Local backup if the API goes down

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API failed');
    const rawCountries = await response.json();
    countries = rawCountries.map(normalizeCountryData);
    console.log('Data loaded and normalized successfully from REST Countries API');
    renderHomepage();
  } catch (error) {
    console.warn('API fetch failed, falling back to local data.json:', error);
    try {
      const response = await fetch(FALLBACK_URL);
      const rawCountries = await response.json();
      countries = rawCountries.map(normalizeCountryData);
      console.log('Data loaded and normalized successfully from fallback local data.json');
      renderHomepage();
    } catch (fallbackError) {
      console.error('Failed to load local data as well:', fallbackError);
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 0;">
          <p style="color: red; font-weight: bold; font-size: 18px;">Error loading countries data.</p>
          <p>Please check your internet connection or try again later.</p>
        </div>
      `;
    }
  }
}

/* ==========================================================================
   3. Router & Dynamic Views (Homepage rendering, searching, filtering)
   ========================================================================== */

// Local Homepage Filtering State
let searchQuery = '';
let selectedRegion = '';

function renderHomepage() {
  // Inject controls structure and grid viewport
  contentContainer.innerHTML = `
    <div class="controls-row">
      <!-- Search Input Container -->
      <div class="search-container">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input 
          type="text" 
          id="search-input" 
          class="search-input" 
          placeholder="Search for a country..." 
          value="${searchQuery}"
          autocomplete="off"
        >
      </div>

      <!-- Custom styled Region Dropdown Container -->
      <div class="filter-container">
        <button class="filter-btn" id="filter-btn" aria-haspopup="listbox" aria-expanded="false">
          <span id="filter-text">${selectedRegion ? selectedRegion : 'Filter by Region'}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <ul class="filter-options" id="filter-options" role="listbox">
          <li class="filter-option" data-region="" role="option">All Regions</li>
          <li class="filter-option" data-region="Africa" role="option">Africa</li>
          <li class="filter-option" data-region="Americas" role="option">Americas</li>
          <li class="filter-option" data-region="Asia" role="option">Asia</li>
          <li class="filter-option" data-region="Europe" role="option">Europe</li>
          <li class="filter-option" data-region="Oceania" role="option">Oceania</li>
        </ul>
      </div>
    </div>

    <!-- Countries Cards Grid -->
    <div class="countries-grid" id="countries-grid"></div>
  `;

  // Grab active DOM nodes
  const searchInput = document.getElementById('search-input');
  const filterBtn = document.getElementById('filter-btn');
  const filterOptions = document.getElementById('filter-options');
  const filterText = document.getElementById('filter-text');

  // 1. Search Keystroke Event Listener
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterAndRenderCards();
  });

  // 2. Custom Dropdown Toggle Operations
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = filterOptions.classList.toggle('show');
    filterBtn.setAttribute('aria-expanded', isShown ? 'true' : 'false');
  });

  // 3. Dropdown Options Selectors
  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', (e) => {
      selectedRegion = e.target.dataset.region;
      filterText.textContent = selectedRegion ? selectedRegion : 'Filter by Region';
      filterOptions.classList.remove('show');
      filterBtn.setAttribute('aria-expanded', 'false');
      filterAndRenderCards();
    });
  });

  // Hide dropdown menu on outer-clicks
  document.addEventListener('click', () => {
    filterOptions.classList.remove('show');
    filterBtn.setAttribute('aria-expanded', 'false');
  });

  // Initial Card Render
  filterAndRenderCards();
}

/**
 * Combined Filtering Layer: Searches and Filters the global dataset,
 * then renders output cards into the active DOM viewport.
 */
function filterAndRenderCards() {
  const grid = document.getElementById('countries-grid');
  if (!grid) return;

  // Filter global countries state array
  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === '' || country.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (filteredCountries.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0; font-size: 18px; opacity: 0.7;">
        No countries matches your search criteria.
      </div>
    `;
    return;
  }

  // Map state items to HTML Card items
  grid.innerHTML = filteredCountries.map(c => `
    <div class="card" data-code="${c.code}" role="link" tabindex="0">
      <div class="card__flag-wrapper">
        <img class="card__flag" src="${c.flag}" alt="${c.name} Flag" loading="lazy">
      </div>
      <div class="card__info">
        <h2 class="card__name">${c.name}</h2>
        <ul class="card__details">
          <li><strong>Population:</strong> ${c.population.toLocaleString()}</li>
          <li><strong>Region:</strong> ${c.region}</li>
          <li><strong>Capital:</strong> ${c.capital}</li>
        </ul>
      </div>
    </div>
  `).join('');

  // 4. Card Click Navigation Hooks
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      renderDetailPage(card.dataset.code);
    });

    // Make cards keyboard-accessible (pressing Enter clicks the card)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        renderDetailPage(card.dataset.code);
      }
    });
  });
}

function renderDetailPage(countryCode) {
  const country = countries.find(c => c.code.toUpperCase() === countryCode.toUpperCase());

  if (!country) {
    contentContainer.innerHTML = `
      <button class="back-btn" id="back-btn">
        <i class="fa-solid fa-arrow-left"></i> Back
      </button>
      <div style="text-align: center; padding: 48px 0; font-size: 18px; opacity: 0.8;">
        <h2>Country not found (${countryCode})</h2>
      </div>
    `;
    document.getElementById('back-btn').addEventListener('click', renderHomepage);
    return;
  }

  // Helper resolver for border common names
  const getCountryNameByCode = (borderCode) => {
    const found = countries.find(c => c.code.toUpperCase() === borderCode.toUpperCase());
    return found ? found.name : borderCode;
  };

  // Render detail columns structure
  contentContainer.innerHTML = `
    <button class="back-btn" id="back-btn">
      <i class="fa-solid fa-arrow-left"></i> Back
    </button>

    <div class="detail-container">
      <!-- Flag Column -->
      <div class="detail__flag-wrapper">
        <img class="detail__flag" src="${country.flag}" alt="Flag of ${country.name}" />
      </div>

      <!-- Stats Columns Content -->
      <div class="detail__content">
        <h2 class="detail__title">${country.name}</h2>

        <div class="detail__stats-row">
          <!-- Column 1 -->
          <ul class="detail__stats-col">
            <li><strong>Native Name:</strong> ${country.nativeName}</li>
            <li><strong>Population:</strong> ${country.population.toLocaleString()}</li>
            <li><strong>Region:</strong> ${country.region}</li>
            <li><strong>Sub Region:</strong> ${country.subregion}</li>
            <li><strong>Capital:</strong> ${country.capital}</li>
          </ul>

          <!-- Column 2 -->
          <ul class="detail__stats-col">
            <li><strong>Top Level Domain:</strong> ${country.tld}</li>
            <li><strong>Currencies:</strong> ${country.currencies}</li>
            <li><strong>Languages:</strong> ${country.languages}</li>
          </ul>
        </div>

        <!-- Border Countries Row -->
        <div class="detail__borders-section">
          <h3 class="detail__borders-title">Border Countries:</h3>
          ${country.borders && country.borders.length > 0 ? `
            <ul class="detail__borders-list">
              ${country.borders.map(borderCode => `
                <li>
                  <button class="border-badge border-link-btn" data-code="${borderCode}">
                    ${getCountryNameByCode(borderCode)}
                  </button>
                </li>
              `).join('')}
            </ul>
          ` : `
            <span style="font-size: 16px; opacity: 0.6; margin-top: 6px;">None</span>
          `}
        </div>
      </div>
    </div>
  `;

  // Attach back button navigation
  document.getElementById('back-btn').addEventListener('click', renderHomepage);

  // Attach border link buttons listeners (dynamic details swapping!)
  document.querySelectorAll('.border-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderDetailPage(btn.dataset.code);
    });
  });
}


// Initial Navigation State
logoBtn.addEventListener('click', () => {
  // Reset filter state on logo click (standard UX expected pattern)
  searchQuery = '';
  selectedRegion = '';
  renderHomepage();
});

// App Init
initTheme();
fetchCountries();
