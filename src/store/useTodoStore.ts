import { create } from "zustand";
import { TodoItem } from "../types";
import { nanoid } from "nanoid";

interface TodoStore {
  todos: TodoItem[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setTodos: (todos: TodoItem[]) => void;
  addTodo: (todo: TodoItem) => void;
  deleteTodo: (id: string) => void;
  updateTodoState: (id: string, isComplete: boolean) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setTodos: (todos) => set({ todos: todos }),
  addTodo: (todo) =>
    set((state) => {
      const newId = nanoid();

      return {
        todos: [
          ...state.todos,
          {
            ...todo,
            id: newId,
            createDate: new Date(),
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
