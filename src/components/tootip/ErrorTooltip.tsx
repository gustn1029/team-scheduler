import styles from "./errorTooltip.module.scss";

interface IProps {
  message: string;
  className?: string;
}

/**
 * 입력값에 오류가 있거나, 비즈니스 로직에 사용하는 에러 컴포넌트
 * @returns
 */
const ErrorTooltip = ({ message, className = "" }: IProps) => {
  return (
    <span
      className={`${styles.errorTooltip} ${
        className !== "" ? styles[className] : ""
      }`}
    >
      {message}
    </span>
  );
};

export default ErrorTooltip;
