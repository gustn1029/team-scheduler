import { useMemo, useState } from "react";

import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoData } from "../../../types";
import TodoListItem from "./TodoListItem";

const TodoList = () => {
  const { todos } = useTodoStore();
  const [notCompleteTodos, setNotCompleteTodos] = useState<TodoData[]>([]);
  const [completeTodos, setCompleteTodos] = useState<TodoData[]>([]);
  console.log(todos);

  useMemo(() => {
    const notCompelte = todos.filter((el) => el.isComplete === false);
    const complete = todos.filter((el) => el.isComplete === true);

    setNotCompleteTodos(notCompelte);
    setCompleteTodos(complete);
  }, [todos]);

  return (
    <div className={styles.todoListWrap}>
      <section className={`${styles.sectionWrap}`}>
        <h3 className={`${styles.notComplete} ${styles.title}`}>미완료</h3>
        {notCompleteTodos.length !== 0 && (
          <ul>
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
          <ul>
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
