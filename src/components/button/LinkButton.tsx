import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";

import styles from "./button.module.scss";

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  buttonStyle?: ButtonStyleEnum;
}

/**
 * 링크 이동 버튼
 * 
 * @param href 링크 url
 * @param children 버튼 문구
 * @param buttonStyle 버튼의 스타일을 설정(ButtonStyleEnum)
 * @returns 
 */
const LinkButton = ({
  href,
  children,
  buttonStyle = ButtonStyleEnum.Primary,
}: LinkButtonProps) => {
  return (
    <Link to={href} className={`${styles.button} ${styles[buttonStyle]}`}>
      {children}
    </Link>
  );
};

export default LinkButton;
