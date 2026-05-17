<template>
  <div style="text-align: center; padding: 24px 0;">
    <h2>Country Details Page View</h2>
    <p>Viewing code: <strong>{{ route.params.code }}</strong></p>
    <p>Implement your detail view template based on routing parameters.</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
