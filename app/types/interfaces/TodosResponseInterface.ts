import type { Todo } from './TodoInterface'


export interface TodosResponseInterface {
  todos: Todo[]
  total: number
  skip: number | string
  limit: number
}
