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

  const localAdded = useState<Todo[]>('todos.localAdded', () => [])
  const localDeleted = useState<number[]>('todos.localDeleted', () => [])
  const localToggled = useState<Record<number, boolean>>('todos.localToggled', () => ({}))

  const totalPages = computed(() => Math.ceil(total.value / LIMIT))
  const skip = computed(() => (currentPage.value - 1) * LIMIT)

  function applyLocalOverrides(fetched: Todo[]): Todo[] {
    return fetched
      .filter((t) => !localDeleted.value.includes(t.id))
      .map((t) =>
        localToggled.value[t.id] !== undefined
          ? { ...t, completed: localToggled.value[t.id]! }
          : t,
      )
  }

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchPage(LIMIT, skip.value)
      const filtered = applyLocalOverrides(data.todos)

      todos.value = currentPage.value === 1 ? [...localAdded.value, ...filtered] : filtered

      total.value = data.total + localAdded.value.length - localDeleted.value.length
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos.'
    } finally {
      loading.value = false
    }
  }

  async function addTodo(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const tempId = Date.now()
    const newTodo: Todo = { id: tempId, todo: trimmed, completed: false, userId: FIXED_USER_ID }

    localAdded.value = [newTodo, ...localAdded.value]
    if (currentPage.value === 1) {
      todos.value = [newTodo, ...todos.value]
    }
    total.value += 1

    try {
      await createTodo({ todo: trimmed, completed: false, userId: FIXED_USER_ID })
    } catch (err) {
      localAdded.value = localAdded.value.filter((t) => t.id !== tempId)
      todos.value = todos.value.filter((t) => t.id !== tempId)
      total.value -= 1
      error.value = err instanceof Error ? err.message : 'Failed to add todo.'
    }
  }

  async function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return

    const newCompleted = !todo.completed
    todo.completed = newCompleted

    const isLocallyAdded = localAdded.value.some((t) => t.id === id)
    if (isLocallyAdded) {
      const localTodo = localAdded.value.find((t) => t.id === id)
      if (localTodo) localTodo.completed = newCompleted
      return
    }

    localToggled.value = { ...localToggled.value, [id]: newCompleted }

    try {
      await updateTodo(id, newCompleted)
    } catch (err) {
      todo.completed = !newCompleted
      localToggled.value = { ...localToggled.value, [id]: !newCompleted }
      error.value = err instanceof Error ? err.message : 'Failed to update todo.'
    }
  }

  async function deleteTodo(id: number) {
    const idx = todos.value.findIndex((t) => t.id === id)
    if (idx === -1) return

    const removed = todos.value[idx]!
    todos.value.splice(idx, 1)
    total.value -= 1

    const isLocallyAdded = localAdded.value.some((t) => t.id === id)
    if (isLocallyAdded) {
      localAdded.value = localAdded.value.filter((t) => t.id !== id)
      return
    }

    if (!localDeleted.value.includes(id)) {
      localDeleted.value = [...localDeleted.value, id]
    }

    const newToggled = { ...localToggled.value }
    delete newToggled[id]
    localToggled.value = newToggled

    try {
      await removeTodo(id)
    } catch (err) {
      todos.value.splice(idx, 0, removed)
      total.value += 1
      localDeleted.value = localDeleted.value.filter((i) => i !== id)
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

