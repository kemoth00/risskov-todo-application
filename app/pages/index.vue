<template>
  <div class="index-page">
    <AppError v-if="error" :message="error" @dismiss="clearError" />

    <TodoAddTodoForm @submit="addTodo" />

    <AppLoader v-if="loading && todos.length === 0" />

    <template v-else>
      <TodoList
        :todos="todos"
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
    </template>
  </div>
</template>

<script setup lang="ts">
const { todos, total, currentPage, totalPages, loading, error, fetchTodos, addTodo, toggleTodo, deleteTodo, clearError, setPage } =
  useTodos()

onMounted(fetchTodos)
</script>

