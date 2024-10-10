import { ReactNode } from "react";
import { Link } from "react-router-dom";

import styles from "./iconButton.module.scss";

interface IconLinkButtonProps {
  href: string;
  icon: ReactNode;
  buttonClassName?: string;
}

/**
 * 링크 이동 버튼
 *
 * @param href 링크 url
 * @param icon 아이콘
 * @param buttonClassName 버튼의 클래스 추가
 * @returns
 */
const IconLinkButton = ({
  href,
  icon,
  buttonClassName,
}: IconLinkButtonProps) => {
  return (
    <Link
      to={href}
      className={`${styles.iconButton} ${
        buttonClassName ? buttonClassName : ""
      }`}
    >
      {icon}
    </Link>
  );
};

export default IconLinkButton;
