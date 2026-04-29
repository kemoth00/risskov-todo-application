<template>
  <div class="app-empty">
    <p class="app-empty__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: 'No todos yet.',
})
</script>

