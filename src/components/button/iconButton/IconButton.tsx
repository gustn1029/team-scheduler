import React, { ReactNode } from "react";
import styles from "./iconButton.module.scss";

interface IconButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "button" | "submit" | "reset" | undefined;
  icon: ReactNode;
}

const IconButton = ({ type = "button", icon, ...props }: IconButton) => {
  return (
    <button type={type} className={styles.iconButton} {...props}>
      {icon}
    </button>
  );
};

export default IconButton;
