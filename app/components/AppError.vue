<template>
  <div class="app-error" role="alert">
    <p class="app-error__message">{{ message }}</p>
    <button class="app-error__dismiss" type="button" @click="$emit('dismiss')">Dismiss</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();
defineEmits<{ dismiss: [] }>();
</script>
