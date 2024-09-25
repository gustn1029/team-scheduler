import React from "react";
import styles from "./labelSelect.module.scss";
import LabelLayout from "../LabelLayout";
import { LabelSelectOptionsProps } from "../../../types";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

const LabelSelect = (props: LabelSelectOptionsProps) => {
  return (
    <LabelLayout {...props}>
      <select
        id={props.label}
        value={`${props.watch(props.label)}`}
        {...props.register}
        className={`${
          props.inputClassName ? styles[props.inputClassName] : ""
        }`}
      >
        {props.optionList.map((el) => {
          return (
            <option
              key={`${props.label}__${el.text}__${el.value}`}
              value={el.value}
            >
              {el.text}
            </option>
          );
        })}
      </select>
      {props.errorView && (
        <ErrorMessage
          errors={props.error}
          name={props.register.name}
          render={({ message }) => <ErrorTooltip message={message} />}
        />
      )}
    </LabelLayout>
  );
};

export default LabelSelect;
