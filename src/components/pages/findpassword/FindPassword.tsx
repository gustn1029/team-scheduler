import styles from "./findpassword.module.scss";
import LinkButton from "../../button/LinkButton";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";

function FindPassword() {
  return (
    <main>
      <h1 className={styles.h1}>
        <img src="/src/assets/images/preparing.png" alt="준비중 이미지" />
        준비중...
      </h1>
      <LinkButton href="/login" buttonStyle={ButtonStyleEnum.Normal}>
        로그인
      </LinkButton>
    </main>
  );
}

export default FindPassword;
