<template>
  <div class="todo-list">
    <AppEmpty v-if="todos.length === 0" />
    <TransitionGroup v-else :name="paginating ? '' : 'todo-list'" tag="ul" class="todo-list__items">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="$emit('toggle', $event)"
        @delete="$emit('delete', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/interfaces/TodoInterface';

defineProps<{ todos: Todo[]; paginating?: boolean }>();
defineEmits<{ toggle: [id: number]; delete: [id: number] }>();
</script>
