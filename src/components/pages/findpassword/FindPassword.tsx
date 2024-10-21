import styles from "./findpassword.module.scss";
import LinkButton from "../../button/LinkButton";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import preparing from "../../../assets/images/preparing.png";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import { layoutXVarients, opacityVarients } from "../../../utils/Animations";

import { motion } from "framer-motion";

function FindPassword() {
  return (
    <MainAnimationLayout variants={layoutXVarients} className={styles.main}>
      <motion.h1
        variants={opacityVarients}
        initial="hidden"
        animate="visible"
        className={styles.h1}
      >
        <img src={preparing} alt="준비중 이미지" />
        준비중...
      </motion.h1>
      <LinkButton href="/login" buttonStyle={ButtonStyleEnum.Normal}>
        로그인
      </LinkButton>
    </MainAnimationLayout>
  );
}

export default FindPassword;
