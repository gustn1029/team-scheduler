import { create } from "zustand";
import { TodoData } from "../types";

interface TodoStore {
  todos: TodoData[];
  addTodo: (todo: TodoData) => void;
  deleteTodo: (id: string) => void;
  updateTodoState: (id: string, isComplete: boolean) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (todo) =>
    set((state) => {
      const newId =
        state.todos.length === 0
          ? "1"
          : String(Number(state.todos[state.todos.length - 1]?.id || "0") + 1);

      return {
        todos: [
          ...state.todos,
          {
            ...todo,
            id: newId,
          },
        ],
      };
    }),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((el) => el.id !== id),
    })),
  updateTodoState: (id, isComplete) =>
    set((state) => {
      const todoIndex = state.todos.findIndex((el) => el.id === id);
      if (todoIndex === -1) {
        alert("할 일이 없습니다.");
        return { todos: state.todos };
      }

      const updatedTodos = [...state.todos];
      updatedTodos[todoIndex] = {
        ...updatedTodos[todoIndex],
        isComplete,
      };

      return { todos: updatedTodos };
    }),
}));
