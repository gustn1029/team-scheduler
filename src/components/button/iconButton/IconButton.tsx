import React, { ReactNode } from "react";
import styles from "./iconButton.module.scss";

interface IconButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "button" | "submit" | "reset" | undefined;
  icon: ReactNode;
  className?: string;
}

const IconButton = ({
  type = "button",
  icon,
  className,
  ...props
}: IconButton) => {
  return (
    <button
      type={type}
      className={`${styles.iconButton} ${className ? className : ""}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;
