<template>
  <div class="error-page">
    <div class="error-page__card">
      <h1 class="error-page__code">{{ error.statusCode }}</h1>
      <p class="error-page__message">{{ error.message || 'An unexpected error occurred.' }}</p>
      <button class="error-page__btn" type="button" @click="clearError()">Go home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error: { statusCode: number; message?: string } }>();
</script>
