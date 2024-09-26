
import styles from "./labelRadio.module.scss";
import { LabelSelectOptionsProps } from "../../../types";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

const LabelRadio = (props: LabelSelectOptionsProps) => {
  return (
    <div className={`${styles.wrap}`}>
      {props.optionList.map((el) => {
        return (
          <label
            key={`${props.label}__${el.text}__${el.value}`}
            htmlFor={el.text}
            className={``}
          >
            <input
              type="radio"
              className={``}
              id={`${el.text}`}
              value={el.value}
              {...props.register}
              checked={props.watch(props.label) === el.value}
            />
            <span>{el.text}</span>
          </label>
        );
      })}
      {props.errorView && (
        <ErrorMessage
          errors={props.error}
          name={props.register.name}
          render={({ message }) => <ErrorTooltip message={message} />}
        />
      )}
    </div>
  );
};

export default LabelRadio;
