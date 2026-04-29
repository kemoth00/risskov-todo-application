<template>
  <li class="todo-item" :class="{ 'todo-item--completed': todo.completed }">
    <input
      :id="`todo-${todo.id}`"
      class="todo-item__checkbox"
      type="checkbox"
      :checked="todo.completed"
      @change="$emit('toggle', todo.id)"
    >
    <label :for="`todo-${todo.id}`" class="todo-item__text">
      {{ todo.todo }}
    </label>
    <button
      class="todo-item__delete"
      type="button"
      :aria-label="`Delete: ${todo.todo}`"
      @click="$emit('delete', todo.id)"
    >
      ✕
    </button>
  </li>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/interfaces/TodoInterface';

defineProps<{ todo: Todo }>();
defineEmits<{ toggle: [id: number]; delete: [id: number] }>();
</script>

