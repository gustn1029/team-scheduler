import { useEffect, useState } from "react";

import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoItem } from "../../../types";
import TodoListItem from "./TodoListItem";
import Loader from "../../loader/Loader";

interface TodoListProps {
  todosData: TodoItem[];
}
const TodoList = ({ todosData }: TodoListProps) => {
  const { todos, setTodos } = useTodoStore();
  const [notCompleteTodos, setNotCompleteTodos] = useState<TodoItem[]>([]);
  const [completeTodos, setCompleteTodos] = useState<TodoItem[]>([]);
  const [isMount, setIsMount] = useState<boolean>(false);

  useEffect(() => {
    console.log(todosData);
    
    if (todosData !== undefined && todosData.length !== 0) {
      setTodos(todosData);
    }

    const notComplete = todos.filter((el) => el?.isComplete === false);
    const complete = todos.filter((el) => el.isComplete === true);

    setNotCompleteTodos(notComplete);
    setCompleteTodos(complete);
  }, [todosData, todos, setTodos]);

  useEffect(() => {
    setIsMount(true);
  }, []);

  if (!isMount) {
    return <Loader />;
  }

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
