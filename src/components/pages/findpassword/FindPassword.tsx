import styles from "./findpassword.module.scss";
import LinkButton from "../../button/LinkButton";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import preparing from "../../../assets/images/preparing.png";

function FindPassword() {
  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>
        <img src={preparing} alt="준비중 이미지" />
        준비중...
      </h1>
      <LinkButton href="/login" buttonStyle={ButtonStyleEnum.Normal}>
        로그인
      </LinkButton>
    </main>
  );
}

export default FindPassword;
