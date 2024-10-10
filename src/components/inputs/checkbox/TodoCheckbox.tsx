import { ChangeEvent } from "react";
import { useTodoStore } from "../../../store/useTodoStore";

import styles from "./todoCheckbox.module.scss";
import { TodoItem } from "../../../types";

const TodoCheckbox = ({ id, isComplete, todo }: TodoItem) => {
  const { updateTodoState } = useTodoStore();

  return (
    <label htmlFor={`${id}_isComplete`} className={styles.customCheckbox}>
      <input
        type="checkbox"
        name={`${id}_isComplete`}
        id={`${id}_isComplete`}
        checked={isComplete}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          updateTodoState(id as string, e.target.checked);
        }}
      />
      <span>{todo}</span>
    </label>
  );
};

export default TodoCheckbox;
