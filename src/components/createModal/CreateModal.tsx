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

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
        onClick={handleLinkClick}
      >
        일정
      </Link>
      <Link
        className={`${styles.link} ${styles.todoLink}`}
        to={`/todo${params !== "" ? `?${params}` : ""}`}
        onClick={handleLinkClick}
      >
        Todo
      </Link>
    </aside>
  );
};

export default CreateModal;
