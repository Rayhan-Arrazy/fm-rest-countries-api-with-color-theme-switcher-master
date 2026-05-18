<template>
  <div>
    <!-- Search and Filter Controls -->
    <div class="controls-row">
      <!-- Search Input Container -->
      <div class="search-container">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search for a country..." 
          v-model="searchQuery"
          autocomplete="off"
        />
      </div>

      <!-- Custom styled Region Dropdown Container -->
      <div class="filter-container" @focusout="handleBlur">
        <button 
          type="button"
          class="filter-btn" 
          @click="toggleDropdown"
          aria-haspopup="listbox" 
          :aria-expanded="dropdownOpen"
        >
          <span>{{ selectedRegion ? selectedRegion : 'Filter by Region' }}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        
        <ul class="filter-options" :class="{ show: dropdownOpen }" role="listbox">
          <li class="filter-option" @click="selectRegion('')" role="option">All Regions</li>
          <li class="filter-option" @click="selectRegion('Africa')" role="option">Africa</li>
          <li class="filter-option" @click="selectRegion('Americas')" role="option">Americas</li>
          <li class="filter-option" @click="selectRegion('Asia')" role="option">Asia</li>
          <li class="filter-option" @click="selectRegion('Europe')" role="option">Europe</li>
          <li class="filter-option" @click="selectRegion('Oceania')" role="option">Oceania</li>
        </ul>
      </div>
    </div>

    <!-- Countries Cards Grid -->
    <div class="countries-grid">
      <div 
        v-if="filteredCountries.length === 0" 
        class="grid-empty-state"
      >
        No countries match your search criteria.
      </div>
      
      <div 
        v-else 
        v-for="country in filteredCountries" 
        :key="country.code" 
        class="card" 
        role="link" 
        tabindex="0"
        @click="goToDetail(country.code)"
        @keydown.enter="goToDetail(country.code)"
      >
        <div class="card__flag-wrapper">
          <img class="card__flag" :src="country.flag" :alt="country.name + ' Flag'" loading="lazy" />
        </div>
        <div class="card__info">
          <h2 class="card__name">{{ country.name }}</h2>
          <ul class="card__details">
            <li><strong>Population:</strong> {{ country.population.toLocaleString() }}</li>
            <li><strong>Region:</strong> {{ country.region }}</li>
            <li><strong>Capital:</strong> {{ country.capital }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Inject the global reactive countries state provided by App.vue
const countries = inject('countries', ref([]));

// Stateful filtering parameters
const searchQuery = ref('');
const selectedRegion = ref('');
const dropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectRegion = (region) => {
  selectedRegion.value = region;
  dropdownOpen.value = false;
};

// Close dropdown on click outside
const handleBlur = (e) => {
  // Timeout allows the option click event to fire before dropdown closes
  setTimeout(() => {
    dropdownOpen.value = false;
  }, 200);
};

// Combined Searching & Filtering Computed Property
const filteredCountries = computed(() => {
  if (!countries.value) return [];
  return countries.value.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRegion = selectedRegion.value === '' || country.region === selectedRegion.value;
    return matchesSearch && matchesRegion;
  });
});

const goToDetail = (code) => {
  router.push(`/country/${code}`);
};
</script>
