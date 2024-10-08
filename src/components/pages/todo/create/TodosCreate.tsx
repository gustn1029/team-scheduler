import React from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "../../../modal/Modal";
import { useForm } from "react-hook-form";
import { TodoData } from "../../../../types";

const TodosCreate = () => {
  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = new Date(Number(dateParam) * 1000);

  const {
    register,
    watch,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<TodoData>();
  return <Modal>
    <h2>TODO 추가</h2>
  </Modal>;
};

export default TodosCreate;
