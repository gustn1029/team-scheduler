import LabelLayout from "../LabelLayout";
import { LabelInputProps } from "../../../types";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

import styles from "./labelTextarea.module.scss";

const LabelTextarea = (props: LabelInputProps) => {
  return (
    <LabelLayout {...props}>
      <textarea
        id={props.label}
        placeholder={props.placeholder}
        {...props.register}
        className={`${styles.labelTextarea}`}
      ></textarea>
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

export default LabelTextarea;
