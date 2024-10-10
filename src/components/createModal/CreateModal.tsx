import { Link } from "react-router-dom";
import styles from "./createModal.module.scss";

interface CreateModalProps {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  params?: string;
}

const CreateModal = ({
  left,
  right,
  top,
  bottom,
  params = "",
}: CreateModalProps) => {

  return (
    <aside
      className={styles.createModal}
      style={{
        top: top && `${top}px`,
        right: right && `${right}px`,
        bottom: bottom && `${bottom}px`,
        left: left && `${left}px`,
      }}
    >
      <Link
        to={`/create${params !== "" ? `?${params}` : ""}`}
        className={`${styles.link} ${styles.createLink}`}
      >
        일정
      </Link>
      <Link
        className={`${styles.link} ${styles.todoLink}`}
        to={`/todo${params !== "" ? `?${params}` : ""}`}
      >
        Todo
      </Link>
    </aside>
  );
};

export default CreateModal;
