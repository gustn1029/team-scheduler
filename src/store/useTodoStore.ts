import { create } from "zustand";
import { TodoData } from "../types";

interface TodoStore {
  todos: TodoData[];
  addTodo: (todo: TodoData) => void;
  deleteTodo: (id: string) => void;
  updateTodoState: (id: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((el) => el.id !== id),
    })),
  updateTodoState: (id) =>
    set((state) => {
      const todoIndex = state.todos.findIndex((el) => el.id === id);
      if (todoIndex === -1) {
        alert("할 일이 없습니다.");
        return { todos: state.todos };
      }

      const updatedTodos = [...state.todos];
      updatedTodos[todoIndex] = {
        ...updatedTodos[todoIndex],
        isComplete: true,
      };

      return { todos: updatedTodos };
    }),
}));
