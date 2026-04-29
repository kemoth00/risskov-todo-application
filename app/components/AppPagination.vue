<template>
  <nav class="app-pagination" aria-label="Pagination">
    <button
      class="app-pagination__btn"
      type="button"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      Previous
    </button>

    <span class="app-pagination__info">
      Page {{ currentPage }} of {{ totalPages }}
    </span>

    <button
      class="app-pagination__btn"
      type="button"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Next
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  total: number
}>()

defineEmits<{ 'page-change': [page: number] }>()
</script>

