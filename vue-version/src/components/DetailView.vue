<template>
  <div>
    <!-- Back Button -->
    <button type="button" class="back-btn" @click="goBack">
      <i class="fa-solid fa-arrow-left"></i> Back
    </button>

    <!-- Guard: Loading State -->
    <div v-if="!countries || countries.length === 0" class="loading-state">
      <p>Loading country details...</p>
    </div>

    <!-- Guard: Country Not Found -->
    <div v-else-if="!country" class="not-found-state">
      <h2>Country not found ({{ route.params.code }})</h2>
      <p class="not-found-msg">The country code might be invalid or does not exist in our database.</p>
    </div>

    <!-- Country Details Grid Section -->
    <div v-else class="detail-container">
      <!-- Flag Column -->
      <div class="detail__flag-wrapper">
        <img class="detail__flag" :src="country.flag" :alt="'Flag of ' + country.name" />
      </div>

      <!-- Content Column -->
      <div class="detail__content">
        <h2 class="detail__title">{{ country.name }}</h2>

        <div class="detail__stats-row">
          <!-- Stats Column 1 -->
          <ul class="detail__stats-col">
            <li><strong>Native Name:</strong> {{ country.nativeName }}</li>
            <li><strong>Population:</strong> {{ country.population.toLocaleString() }}</li>
            <li><strong>Region:</strong> {{ country.region }}</li>
            <li><strong>Sub Region:</strong> {{ country.subregion }}</li>
            <li><strong>Capital:</strong> {{ country.capital }}</li>
          </ul>

          <!-- Stats Column 2 -->
          <ul class="detail__stats-col">
            <li><strong>Top Level Domain:</strong> {{ country.tld }}</li>
            <li><strong>Currencies:</strong> {{ country.currencies }}</li>
            <li><strong>Languages:</strong> {{ country.languages }}</li>
          </ul>
        </div>

        <!-- Border Countries section -->
        <div class="detail__borders-section">
          <h3 class="detail__borders-title">Border Countries:</h3>
          <ul v-if="country.borders && country.borders.length > 0" class="detail__borders-list">
            <li v-for="borderCode in country.borders" :key="borderCode">
              <router-link :to="'/country/' + borderCode" class="border-badge">
                {{ getCountryName(borderCode) }}
              </router-link>
            </li>
          </ul>
          <span v-else class="detail__borders-none">None</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Inject the global reactive countries state provided by App.vue
const countries = inject('countries');

// Compute current country (case-insensitive for safety and URL typing friendliness)
const country = computed(() => {
  if (!countries.value) return null;
  return countries.value.find(
    c => c.code.toUpperCase() === route.params.code.toUpperCase()
  );
});

// Resolve border country codes to their human common names
const getCountryName = (borderCode) => {
  if (!countries.value) return borderCode;
  const found = countries.value.find(
    c => c.code.toUpperCase() === borderCode.toUpperCase()
  );
  return found ? found.name : borderCode;
};

// Route back in browser history
const goBack = () => {
  router.go(-1);
};
</script>
