<template>
  <div class="app-empty">
    <span class="app-empty__icon" aria-hidden="true">📋</span>
    <p class="app-empty__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: 'No todos yet. Add one above!',
});
</script>

