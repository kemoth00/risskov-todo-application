<template>
  <nav class="app-pagination" aria-label="Pagination">
    <button
      class="app-pagination__btn"
      type="button"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      ← Prev
    </button>

    <div class="app-pagination__info">
      <span class="app-pagination__page">Page {{ currentPage }} of {{ totalPages }}</span>
      <span class="app-pagination__range">Showing {{ from }}–{{ to }} of {{ total }}</span>
    </div>

    <button
      class="app-pagination__btn"
      type="button"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Next →
    </button>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    total: number
    limit?: number
  }>(),
  { limit: 10 },
);

defineEmits<{ 'page-change': [page: number] }>();

const from = computed(() => (props.currentPage - 1) * props.limit + 1);
const to = computed(() => Math.min(props.currentPage * props.limit, props.total));
</script>

