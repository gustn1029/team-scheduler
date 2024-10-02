import { useViewNavStore } from "../../store/useViewNavStore";
import { FaXmark } from "react-icons/fa6";
import IconButton from "../button/iconButton/IconButton";
import styles from './navigation.module.scss'

const Navigation = () => {

  const {isView, toggleIsView } = useViewNavStore();
  return (
    <nav className={`${styles.navigation} ${isView ? styles.view: styles.hidden}`}>
      <ul>
        <li>
          <IconButton icon={<FaXmark />} onClick={toggleIsView} />
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
