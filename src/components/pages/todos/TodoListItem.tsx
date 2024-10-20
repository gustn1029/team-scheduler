import { TodoItem } from "../../../types";
import TodoCheckbox from "../../inputs/checkbox/TodoCheckbox";
import IconButton from "../../button/iconButton/IconButton";
import { MdCancel } from "react-icons/md";
import { useTodoStore } from "../../../store/useTodoStore";
import { motion } from "framer-motion";

import styles from "./todos.module.scss";

const TodoListItem = ({ id, isComplete, todo }: TodoItem) => {
  const { deleteTodo, setIsComplete } = useTodoStore();
  const handleDelete = (id: string) => {
    setIsComplete(true);
    deleteTodo(id);
  };

  return (
    <motion.li
      layout
      variants={{
        hidden: {
          y: isComplete ? 30 : -30,
          opacity: 0,
        },
        visible: {
          y: 0,
          opacity: 1,
        },
      }}
      exit={{
        y: isComplete ? 30 : -30,
        opacity: 0,
      }}
      id={id}
      className={`${styles.listItem} ${
        isComplete ? styles.completeListItem : styles.notCompleteListItem
      }`}
    >
      <TodoCheckbox id={id} isComplete={isComplete} todo={todo} />
      <IconButton
        icon={<MdCancel />}
        onClick={() => handleDelete(id ? id : "")}
      />
    </motion.li>
  );
};

export default TodoListItem;
