import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import Button from "../../button/Button";

import styles from "./notFound.module.scss";

import notFoundImage from "../../../assets/images/utils/not_found.png";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    const handlePrevPageBtn = () => {
        navigate(-1);
    }
  return (
    <section className={styles.notFound}>
      <div>
        <img
          src={notFoundImage}
          alt="해당 페이지를 찾을 수 없을 때 표시되는 이미지"
        />
        <p>
          <span>죄송합니다.</span>해당 페이지를 찾을 수 없습니다.
        </p>
      </div>
      <Button
        buttonStyle={ButtonStyleEnum.Normal}
        buttonClassName={styles.notFoundBtn}
        onClick={handlePrevPageBtn}
      >
        이전 페이지로 이동
      </Button>
    </section>
  );
};

export default NotFound;
