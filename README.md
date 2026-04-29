# Risskov Todo Application

A todo management app built with Nuxt 4, Vue 3, TypeScript, and SCSS.

It fetches todos from the [DummyJSON](https://dummyjson.com/todos) public API and augments them with local-only mutations (add, toggle, delete) that survive page navigation within the same session.

---

## Features

- **Paginated todo list** — 10 items per page, with prev/next navigation and an item range display
- **Add todos** — validated form; new items appear at the top and paginate correctly
- **Toggle completion** — optimistic UI update with API sync; state persists across page changes
- **Delete todos** — page is refilled from the next page's items; navigates back automatically if the current page becomes empty
- **Local state persistence** — all mutations tracked in named `useState` stores so they survive in-session navigation
- **Error handling** — dismissable inline error banner for API failures; custom error page for route errors
- **Loading states** — full-page spinner on initial load; dimmed content during page transitions (no layout jump)
- **Responsive design** — mobile-first SCSS, Inter font, BEM architecture

---

## Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Framework  | [Nuxt 4](https://nuxt.com) + Vue 3 Composition API |
| Language   | TypeScript (strict mode)                           |
| Styling    | SCSS — BEM, design tokens, mixins                  |
| Linting    | ESLint via `@nuxt/eslint`                          |
| Formatting | Prettier                                           |
| Data       | [DummyJSON](https://dummyjson.com) public REST API |

---

## Project Structure

```
app/
├── assets/styles/        # Global SCSS — variables, mixins, component partials
├── components/
│   ├── AppEmpty.vue      # Empty-state placeholder
│   ├── AppError.vue      # Dismissable error banner
│   ├── AppLoader.vue     # Loading spinner
│   ├── AppPagination.vue # Prev/next navigation with item range
│   └── todo/
│       ├── AddTodoForm.vue  # Validated add form
│       ├── TodoItem.vue     # Single todo row (checkbox + delete)
│       └── TodoList.vue     # Animated list wrapper
├── composables/
│   ├── useTodos.ts       # All state, mutations, and pagination logic
│   └── useTodosApi.ts    # Thin HTTP layer over $fetch
├── layouts/
│   └── default.vue       # Centered container layout
├── pages/
│   └── index.vue         # Main page — wires everything together
└── types/interfaces/     # TypeScript interfaces for API shapes
```

### Key design: local state model

DummyJSON simulates mutations but does not persist them. The app tracks all changes locally:

| Store             | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `addedItems`      | Todos added this session (never shortened, anchors API offset) |
| `addedDeletedIds` | IDs of `addedItems` that were soft-deleted                     |
| `deletedApiItems` | API todos deleted, stored with their raw stream position       |
| `toggledItems`    | Completion-state overrides for toggled API todos               |
| `apiPositionMap`  | Maps `todo.id → stream position`, stamped at each fetch        |

The `computeApiSkip(page)` helper walks the raw API stream page-by-page, consuming non-deleted slots, to compute the exact `skip` value for any page — accounting for both local additions and deletions simultaneously.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

### Other scripts

```bash
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run typecheck    # TypeScript type check
```
