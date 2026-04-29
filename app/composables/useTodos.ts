import type { Todo } from '~/types/interfaces/TodoInterface'

const LIMIT = 10
const FIXED_USER_ID = 1

export function useTodos() {
  const { fetchPage, createTodo, updateTodo, removeTodo } = useTodosApi()

  const todos = useState<Todo[]>('todos', () => [])
  const total = useState<number>('todos.total', () => 0)
  const currentPage = useState<number>('todos.currentPage', () => 1)
  const loading = useState<boolean>('todos.loading', () => false)
  const error = useState<string | null>('todos.error', () => null)

  const totalPages = computed(() => Math.ceil(total.value / LIMIT))
  const skip = computed(() => (currentPage.value - 1) * LIMIT)

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchPage(LIMIT, skip.value)
      todos.value = data.todos
      total.value = data.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos.'
    } finally {
      loading.value = false
    }
  }

  async function addTodo(text: string) {
    const payload = { todo: text, completed: false, userId: FIXED_USER_ID }
    const tempId = Date.now()

    todos.value.unshift({ id: tempId, ...payload })
    total.value += 1

    try {
      const created = await createTodo(payload)
      const idx = todos.value.findIndex((t) => t.id === tempId)
      if (idx !== -1) todos.value[idx] = created
    } catch (err) {
      todos.value = todos.value.filter((t) => t.id !== tempId)
      total.value -= 1
      error.value = err instanceof Error ? err.message : 'Failed to add todo.'
    }
  }

  async function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return

    todo.completed = !todo.completed
    try {
      await updateTodo(id, todo.completed)
    } catch (err) {
      todo.completed = !todo.completed
      error.value = err instanceof Error ? err.message : 'Failed to update todo.'
    }
  }

  async function deleteTodo(id: number) {
    const idx = todos.value.findIndex((t) => t.id === id)
    if (idx === -1) return

    const removed = todos.value[idx]!
    todos.value.splice(idx, 1)
    total.value -= 1

    try {
      await removeTodo(id)
    } catch (err) {
      todos.value.splice(idx, 0, removed)
      total.value += 1
      error.value = err instanceof Error ? err.message : 'Failed to delete todo.'
    }
  }

  function setPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    fetchTodos()
  }

  function clearError() {
    error.value = null
  }

  return {
    todos,
    total,
    currentPage,
    loading,
    error,
    totalPages,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    setPage,
    clearError,
  }
}

