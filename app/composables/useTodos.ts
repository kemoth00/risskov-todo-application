import type { Todo } from '~/types/interfaces/TodoInterface';
import type { DeletedApiEntry } from '~/types/interfaces/DeletedApiEntryInterface';

const PAGE_SIZE = 10;
const FIXED_USER_ID = 1;

export function useTodos() {
  const { fetchPage, createTodo, updateTodo, removeTodo } = useTodosApi();

  const todos = useState<Todo[]>('todos', () => []);
  const total = useState<number>('todos.total', () => 0);
  const currentPage = useState<number>('todos.currentPage', () => 1);
  const loading = useState<boolean>('todos.loading', () => true);
  const error = useState<string | null>('todos.error', () => null);
  const isPaginating = useState<boolean>('todos.isPaginating', () => false);

  const addedItems = useState<Todo[]>('todos.addedItems', () => []);
  const addedDeletedIds = useState<number[]>('todos.addedDeletedIds', () => []);
  const deletedApiItems = useState<DeletedApiEntry[]>('todos.deletedApiItems', () => []);
  const toggledItems = useState<Record<number, boolean>>('todos.toggledItems', () => ({}));

  const apiPositionMap = useState<Record<number, number>>('todos.apiPositionMap', () => ({}));

  const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE));
  const deletedApiIds = computed(() => deletedApiItems.value.map((d) => d.id));
  const deletedApiPositions = computed(() => deletedApiItems.value.map((d) => d.pos));

  function isAddedItem(id: number): boolean {
    return addedItems.value.some((t) => t.id === id) && !addedDeletedIds.value.includes(id);
  }

  function computeApiSkip(page: number): number {
    let cursor = 0;

    for (let p = 1; p < page; p++) {
      const pageStart = (p - 1) * PAGE_SIZE;
      const addedOnPage = addedItems.value
        .slice(pageStart, pageStart + PAGE_SIZE)
        .filter((t) => !addedDeletedIds.value.includes(t.id)).length;
      const apiSlotsOnPage = Math.max(0, PAGE_SIZE - addedOnPage);

      let consumed = 0;
      while (consumed < apiSlotsOnPage) {
        if (!deletedApiPositions.value.includes(cursor)) {
          consumed++;
        }
        cursor++;
      }
    }

    while (deletedApiPositions.value.includes(cursor)) {
      cursor++;
    }

    return cursor;
  }

  async function fetchTodos() {
    loading.value = true;
    error.value = null;

    try {
      const pageStart = (currentPage.value - 1) * PAGE_SIZE;

      const addedOnPage = addedItems.value
        .slice(pageStart, pageStart + PAGE_SIZE)
        .filter((t) => !addedDeletedIds.value.includes(t.id));
      const apiSlotsNeeded = PAGE_SIZE - addedOnPage.length;

      const apiSkip = computeApiSkip(currentPage.value);
      const data = await fetchPage(
        Math.max(apiSlotsNeeded + deletedApiItems.value.length, 1),
        apiSkip
      );
      const withPositions = data.todos.map((t, i) => ({ todo: t, pos: apiSkip + i }));

      const visibleWithPositions = withPositions
        .filter(({ todo }) => !deletedApiIds.value.includes(todo.id))
        .slice(0, apiSlotsNeeded);

      const apiItems = visibleWithPositions.map(({ todo }) =>
        toggledItems.value[todo.id] !== undefined
          ? { ...todo, completed: toggledItems.value[todo.id]! }
          : todo
      );

      const updatedPositions = { ...apiPositionMap.value };
      visibleWithPositions.forEach(({ todo, pos }) => {
        updatedPositions[todo.id] = pos;
      });
      apiPositionMap.value = updatedPositions;

      todos.value = [...addedOnPage, ...apiItems];
      const visibleAdded = addedItems.value.length - addedDeletedIds.value.length;
      total.value = data.total + visibleAdded - deletedApiItems.value.length;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos.';
    } finally {
      loading.value = false;
      isPaginating.value = false;
    }
  }

  async function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const tempId = Date.now();
    const newTodo: Todo = { id: tempId, todo: trimmed, completed: false, userId: FIXED_USER_ID };

    addedItems.value = [newTodo, ...addedItems.value];
    await fetchTodos();

    try {
      await createTodo({ todo: trimmed, completed: false, userId: FIXED_USER_ID });
      setPage(1);
    } catch (err) {
      addedDeletedIds.value = [...addedDeletedIds.value, tempId];
      await fetchTodos();
      error.value = err instanceof Error ? err.message : 'Failed to add todo.';
    }
  }

  async function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;
    todo.completed = newCompleted;

    if (isAddedItem(id)) {
      const item = addedItems.value.find((t) => t.id === id);
      if (item) item.completed = newCompleted;
      return;
    }

    toggledItems.value = { ...toggledItems.value, [id]: newCompleted };

    try {
      await updateTodo(id, newCompleted);
    } catch (err) {
      todo.completed = !newCompleted;
      toggledItems.value = { ...toggledItems.value, [id]: !newCompleted };
      error.value = err instanceof Error ? err.message : 'Failed to update todo.';
    }
  }

  async function deleteTodo(id: number) {
    if (!todos.value.some((t) => t.id === id)) return;

    if (isAddedItem(id)) {
      addedDeletedIds.value = [...addedDeletedIds.value, id];
      await fetchTodos();
      goBackIfPageEmpty();
      return;
    }

    const pos = apiPositionMap.value[id];
    if (pos !== undefined) {
      deletedApiItems.value = [...deletedApiItems.value, { id, pos }];
    }

    const { [id]: _removed, ...restToggled } = toggledItems.value;
    toggledItems.value = restToggled;

    await fetchTodos();
    goBackIfPageEmpty();

    try {
      await removeTodo(id);
    } catch (err) {
      deletedApiItems.value = deletedApiItems.value.filter((d) => d.id !== id);
      await fetchTodos();
      error.value = err instanceof Error ? err.message : 'Failed to delete todo.';
    }
  }

  function goBackIfPageEmpty() {
    if (todos.value.length === 0 && currentPage.value > 1) {
      setPage(currentPage.value - 1);
    }
  }

  function setPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    isPaginating.value = true;
    todos.value = [];
    currentPage.value = page;
    fetchTodos();
  }

  function clearError() {
    error.value = null;
  }

  return {
    todos,
    total,
    currentPage,
    loading,
    isPaginating,
    error,
    totalPages,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    setPage,
    clearError,
  };
}
