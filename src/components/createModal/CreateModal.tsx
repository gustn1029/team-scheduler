import { Link } from "react-router-dom";
import styles from "./createModal.module.scss";
import { AnimatePresence, motion } from "framer-motion";

interface CreateModalProps {
  isOpen?: boolean;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  params?: string;
}

const CreateModal = ({
  isOpen = false,
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
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.5,
          }}
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CreateModal;
