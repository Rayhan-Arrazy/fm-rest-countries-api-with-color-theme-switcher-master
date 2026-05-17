<template>
  <div style="text-align: center; padding: 24px 0;">
    <h2>Vue 3 Version Loaded!</h2>
    <p>Total Countries loaded: {{ countries.length }}</p>
    <p>Build your homepage components (Search, Filter, Country Cards Grid) in this template.</p>
  </div>
</template>

<script setup>
import { inject } from 'vue';

// Inject global countries data array
const countries = inject('countries', []);
</script>
