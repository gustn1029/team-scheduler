import React from "react";
import LabelLayout from "../LabelLayout";
import { LabelInputProps } from "../../../types";
import { ErrorMessage } from "@hookform/error-message";
import ErrorTooltip from "../../tootip/ErrorTooltip";

const LabelTextarea = (props: LabelInputProps) => {
  return (
    <LabelLayout {...props}>
      <textarea
        id={props.label}
        placeholder={props.placeholder}
        {...props.register}
        className={``}
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
