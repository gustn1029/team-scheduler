
import LabelLayout from "../LabelLayout";
import { LabelInputProps } from "../../../types";
import styles from "./labelInput.module.scss";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

const LabelInput = (props: LabelInputProps) => {
  return (
    <LabelLayout {...props}>
      <input
        type={props.type ? props.type : "text"}
        {...props.register}
        id={props.label}
        placeholder={props.placeholder}
        className={`${
          props.inputClassName ? styles[props.inputClassName] : ""
        }`}
        defaultValue={props.watch(props.label)}
      />
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

export default LabelInput;
