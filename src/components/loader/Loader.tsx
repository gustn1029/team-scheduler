import { RotatingLines } from "react-loader-spinner";
import styles from "./loader.module.scss";
import { useIsFetching } from "@tanstack/react-query";

const Loader = () => {
  const isFetching = useIsFetching();
  return (
    <div
      className={`${styles.loader} ${isFetching ? styles.view : styles.hidden}`}
    >
      <RotatingLines
        visible={true}
        width="30"
        strokeColor="#263140"
      />
    </div>
  );
};

export default Loader;
