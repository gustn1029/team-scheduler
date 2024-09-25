import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import styles from "./button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonStyle?: ButtonStyleEnum;
  type?: "button" | "submit" | "reset" | undefined
}

const Button = ({ children, buttonStyle = ButtonStyleEnum.Primary, type = "button", ...props }: ButtonProps) => {
  return (
    <button type={type} className={`${styles.button} ${styles[buttonStyle]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
