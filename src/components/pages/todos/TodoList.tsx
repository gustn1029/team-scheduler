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

  // todoData 있는지 체크하고 완료 미완료된 데이터로 필터링 되도록 설정
  useEffect(() => {
    
    const notComplete = todos.filter((el) => el?.isComplete === false);
    const complete = todos.filter((el) => el.isComplete === true);

    setNotCompleteTodos(notComplete);
    setCompleteTodos(complete);
  }, [todosData, todos, setTodos]);

  // 마운트 된 후 화면 출력 되도록 설정
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
