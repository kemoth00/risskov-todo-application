import type { Todo } from '~/types/interfaces/TodoInterface'
import type { TodosResponseInterface } from '~/types/interfaces/TodosResponseInterface'
import type { CreateTodoPayloadInterface } from '~/types/interfaces/CreateTodoPayloadInterface'

export function useTodosApi() {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onResponseError({ response }) {
      throw new Error(`API error ${response.status}: ${response.statusText}`)
    },
  })

  function fetchPage(limit: number, skip: number) {
    return api<TodosResponseInterface>('/todos', {
      query: { limit, skip },
    })
  }

  function createTodo(payload: CreateTodoPayloadInterface) {
    return api<Todo>('/todos/add', {
      method: 'POST',
      body: payload,
    })
  }

  function updateTodo(id: number, completed: boolean) {
    return api<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: { completed },
    })
  }

  function removeTodo(id: number) {
    return api(`/todos/${id}`, { method: 'DELETE' })
  }

  return { fetchPage, createTodo, updateTodo, removeTodo }
}
