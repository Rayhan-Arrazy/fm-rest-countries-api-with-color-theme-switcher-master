<template>
  <!-- Sticky Header -->
  <header class="header">
    <div class="container header__content">
      <router-link to="/" class="header__logo-link">
        <h1 class="header__title">Where in the world?</h1>
      </router-link>
      <button 
        class="theme-toggle" 
        @click="toggleTheme" 
        aria-label="Toggle dark mode"
      >
        <i :class="theme === 'dark' ? 'fa-solid fa-moon' : 'fa-regular fa-moon'"></i>
        <span>{{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  </header>

  <!-- Main Content View -->
  <main class="container content-area">
    <div v-if="loading" class="loading-state">
      <p>Loading countries data...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <!-- Vue Router Viewport -->
      <router-view></router-view>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue';

const countries = ref([]);
const loading = ref(true);
const error = ref(null);

// Provide countries data to child components (HomeView, DetailView, etc.)
provide('countries', countries);

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

// Theme State Setup
const theme = ref(
  localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
);

// Toggle Theme Callback
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

// Sync Theme Changes to DOM Document Element attribute
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}, { immediate: true });

// Fetch Countries (API with local fallback)
onMounted(async () => {
  const API_URL = 'https://restcountries.com/v3.1/all';
  const FALLBACK_URL = '/data.json'; // Public folder fallback
  
  try {
    loading.value = true;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API failed');
    const rawData = await response.json();
    countries.value = rawData.map(normalizeCountryData);
    loading.value = false;
  } catch (err) {
    console.warn('REST Countries API failed, attempting fallback to data.json', err);
    try {
      const response = await fetch(FALLBACK_URL);
      if (!response.ok) throw new Error('Fallback failed');
      const rawData = await response.json();
      countries.value = rawData.map(normalizeCountryData);
      loading.value = false;
    } catch (fallbackErr) {
      console.error('All data sources failed:', fallbackErr);
      error.value = 'Failed to fetch country data. Please check your connection.';
      loading.value = false;
    }
  }
});
</script>
