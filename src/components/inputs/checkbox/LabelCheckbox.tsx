import React from "react";
import styles from "./labelCheckbox.module.scss";
import { LabelSelectOptionsProps } from "../../../types";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

const LabelCheckbox = (props: LabelSelectOptionsProps) => {
  return (
    <div className={`${styles.wrap}`}>
      {props.optionList.map((el) => {
        return (
          <label
            key={`${props.label}__${el.text}__${el.value}`}
            htmlFor={el.text}
          >
            <input
              className={`${
                props.inputClassName ? styles[props.inputClassName] : ""
              }`}
              type="checkbox"
              id={el.text}
              value={el.value}
              {...props.register}
              defaultChecked={props.watch(props.label) === el.value}
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

export default LabelCheckbox;
