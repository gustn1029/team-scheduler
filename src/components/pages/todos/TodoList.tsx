import React, { useMemo, useState } from "react";

import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoData } from "../../../types";
import IconButton from "../../button/iconButton/IconButton";
import { MdCancel } from "react-icons/md";

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
    <>
      <section className={`${styles.sectionWrap}`}>
        <h3 className={`${styles.notComplete} ${styles.title}`}>미완료</h3>
        <ul>
          {notCompleteTodos.map((el, idx) => {
            return (
              <li
                key={`${el.id ? el.id : idx}`}
                className={`${styles.listItem} ${styles.notCompelteListItem}`}
              >
                <label htmlFor="">
                  <input type="checkbox" name="" id="" />
                  <span>{el.todo}</span>
                </label>
                <IconButton icon={<MdCancel />} />
              </li>
            );
          })}
        </ul>
      </section>
      <section className={`${styles.sectionWrap}`}>
        <h3 className={`${styles.complete} ${styles.title}`}>완료</h3>
        <ul>
          {completeTodos.map((el, idx) => {
            return (
              <li
                key={`${el.id ? el.id : idx}`}
                className={`${styles.listItem} ${styles.compelteListItem}`}
              >
                {el.todo}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
};

export default TodoList;
