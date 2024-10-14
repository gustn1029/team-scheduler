import { useEffect, useState } from "react";

import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoItem } from "../../../types";
import TodoListItem from "./TodoListItem";
import { useQuery } from "@tanstack/react-query";
import { getTodosFetch } from "../../../utils/http";
import { appAuth } from "../../../firebase/config";

const TodoList = () => {
  const { selectedDate, todos, setTodos } = useTodoStore();
  const [notCompleteTodos, setNotCompleteTodos] = useState<TodoItem[]>([]);
  const [completeTodos, setCompleteTodos] = useState<TodoItem[]>([]);

  const {
    data: todoData,
  } = useQuery({
    queryKey: [
      "todos",
      appAuth.currentUser?.uid,
      selectedDate.toISOString().split("T")[0],
    ],
    queryFn: () =>
      getTodosFetch({ date: selectedDate, uid: appAuth.currentUser!.uid }),
  });

  console.log(todoData);

  useEffect(() => {
    if (todoData && todoData.length > 0) {
      setTodos(todoData[0]?.todos);
    } else {
      setTodos([]);
    }
  }, [todoData, setTodos]);

  useEffect(() => {
    const notComplete = todos.filter((el) => el?.isComplete === false);
    const complete = todos.filter((el) => el.isComplete === true);

    setNotCompleteTodos(notComplete);
    setCompleteTodos(complete);
  }, [todos]);

  return (
    <div className={styles.todoListWrap}>
      <section className={`${styles.sectionWrap}`}>
        <h3 className={`${styles.notComplete} ${styles.title}`}>미완료</h3>
        {notCompleteTodos.length !== 0 && (
          <ul className={styles.todoList}>
            {notCompleteTodos.map((el) => {
              return (
                <TodoListItem
                  key={el.id}
                  id={el.id}
                  isComplete={el.isComplete}
                  todo={el.todo}
                />
              );
            })}
          </ul>
        )}
      </section>
      <section className={`${styles.sectionWrap}`}>
        <h3 className={`${styles.complete} ${styles.title}`}>완료</h3>
        {completeTodos.length !== 0 && (
          <ul className={styles.todoList}>
            {completeTodos.map((el) => {
              return (
                <TodoListItem
                  key={el.id}
                  id={el.id}
                  isComplete={el.isComplete}
                  todo={el.todo}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TodoList;
