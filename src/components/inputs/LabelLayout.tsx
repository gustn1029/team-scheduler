
import { LabelInputProps } from "../../types";
import styles from "./labelLayout.module.scss";

const LabelLayout = ({
  children,
  label,
  labelClassName = "",
  isLabelTextHidden = false,
}: LabelInputProps) => {
  return (
    <label
      htmlFor={label}
      className={`${styles.labelLayout} ${labelClassName !== "" ? labelClassName : ""}`}
    >
      <span className={`${isLabelTextHidden ? "sOnly" : ""}`}>{label}</span>
      {children}
    </label>
  );
};

export default LabelLayout;
