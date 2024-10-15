import { useForm } from "react-hook-form";
import { TodoItem } from "../../../types";
import LabelInput from "../../inputs/input/LabelInput";
import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";

const TodoForm = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<TodoItem>();
  const { addTodo } = useTodoStore();

  const onSubmit = (data: TodoItem) => {
    const newTodo: TodoItem = {
      todo: data.todo,
      isComplete: data.isComplete || false,
      createDate: new Date(),
    };
    addTodo(newTodo);
    setValue("todo", "");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${styles.sectionWrap}`}
      >
        <LabelInput
          label="todo"
          register={register("todo", {
            required: { value: true, message: "할일을 입력해 주세요." },
          })}
          watch={watch}
          error={errors}
          errorView={errors.todo}
          placeholder="+ 항목 추가"
          isLabelTextHidden
          inputClassName={styles.todoInput}
          ariaInvalid={isSubmitted ? (errors.todo ? true : undefined) : undefined}
        />
      </form>
    </>
  );
};

export default TodoForm;
