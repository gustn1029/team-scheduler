import { useForm } from "react-hook-form";
import { TodoItem } from "../../../types";
import LabelInput from "../../inputs/input/LabelInput";
import styles from "./todos.module.scss";
import { useTodoStore } from "../../../store/useTodoStore";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";

const TodoForm = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<TodoItem>();
  const { addTodo, setIsComplete, isComplete } = useTodoStore();

  // 투두 입력하면 todos 배열에 추가하는 함수
  const onSubmit = (data: TodoItem) => {
    const newTodo: TodoItem = {
      todo: data.todo,
      isComplete: data.isComplete || false,
    };
    addTodo(newTodo);
    setValue("todo", "");

    if(!isComplete) {
      setIsComplete(true);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${styles.sectionWrap} ${styles.inputWrap}`}
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
          labelClassName={styles.todoLabel}
          ariaInvalid={isSubmitted ? (errors.todo ? true : undefined) : undefined}
        />
        <Button type="submit" buttonClassName={styles.inputButton} buttonStyle={watch("todo") !== "" ? ButtonStyleEnum.Normal : ButtonStyleEnum.Primary} >추가</Button>
      </form>
    </>
  );
};

export default TodoForm;
