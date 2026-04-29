<template>
  <div class="index-page">
    <AppError v-if="error" :message="error" @dismiss="clearError" />

    <TodoAddTodoForm @submit="addTodo" />

    <AppLoader v-if="loading && todos.length === 0" />

    <div
      v-else
      class="index-page__content"
      :class="{ 'index-page__content--loading': loading }"
    >
      <TodoList
        :todos="todos"
        :paginating="isPaginating"
        @toggle="toggleTodo"
        @delete="deleteTodo"
      />

      <AppPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        class="index-page__pagination"
        @page-change="setPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  todos,
  total,
  currentPage,
  totalPages,
  loading,
  isPaginating,
  error,
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearError,
  setPage,
} = useTodos();

useHead({ title: 'Todos' });

onMounted(fetchTodos);
</script>

