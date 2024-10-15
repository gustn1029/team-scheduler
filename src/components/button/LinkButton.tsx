import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";

import styles from "./button.module.scss";

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  buttonStyle?: ButtonStyleEnum;
  buttonClassName?: string;
}

/**
 * 링크 이동 버튼
 *
 * @param href 링크 url
 * @param children 버튼 문구
 * @param buttonStyle 버튼의 스타일을 설정(ButtonStyleEnum)
 * @param buttonClassName 버튼의 클래스 추가
 * @returns
 */
const LinkButton = ({
  href,
  children,
  buttonStyle = ButtonStyleEnum.Primary,
  buttonClassName,
}: LinkButtonProps) => {
  return (
    <Link
      to={href}
      className={`${styles.button} ${styles[buttonStyle]} ${
        buttonClassName ? buttonClassName : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
