
import { LabelInputProps } from "../../../types";
import style from "./labelToggle.module.scss";

type ToggleProps = Pick<
  LabelInputProps,
  "errorView" | "error" | "register" | "label" | "watch"
>;

const LabelToggle = (props: ToggleProps) => {
  return (
    <label htmlFor={props.label} className={`${style.toggle}`}>
      <input
        type="checkbox"
        {...props.register}
        id={props.label}
        checked={props.watch(props.label) === true}
      />
      <span></span>
    </label>
  );
};

export default LabelToggle;
