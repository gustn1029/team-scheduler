import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import styles from "./button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonStyle?: ButtonStyleEnum;
  type?: "button" | "submit" | "reset" | undefined;
  buttonClassName?: string;
}

/**
 * 기능 설정 버튼
 *
 * @param type 버튼 타입 설정
 * @param children 버튼 문구
 * @param buttonStyle 버튼의 스타일을 설정(ButtonStyleEnum)
 * @param props 버튼 태그에서 사용하는 기능 props로 전달하여 사용 가능
 * @returns
 */
const Button = ({
  children,
  buttonStyle = ButtonStyleEnum.Primary,
  type = "button",
  buttonClassName,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[buttonStyle]} ${
        buttonClassName ? buttonClassName : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
