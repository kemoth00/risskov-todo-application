<template>
  <form class="add-todo-form" novalidate @submit.prevent="handleSubmit">
    <label for="new-todo" class="add-todo-form__label">Add a new todo</label>
    <div class="add-todo-form__row">
      <input
        id="new-todo"
        v-model="text"
        class="add-todo-form__input"
        :class="{ 'add-todo-form__input--error': validationError }"
        type="text"
        placeholder="What needs to be done?"
        maxlength="500"
        autocomplete="off"
        @input="validationError = ''"
      />
      <button class="add-todo-form__submit" type="submit">Add</button>
    </div>
    <p v-if="validationError" class="add-todo-form__validation" role="alert">
      {{ validationError }}
    </p>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{ submit: [text: string] }>()

const text = ref('')
const validationError = ref('')

function handleSubmit() {
  const trimmed = text.value.trim()

  if (!trimmed) {
    validationError.value = 'Please enter a todo.'
    return
  }

  emit('submit', trimmed)
  text.value = ''
}
</script>
