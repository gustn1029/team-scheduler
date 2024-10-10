import { useNavigate, useSearchParams } from "react-router-dom";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

import styles from "./todos.module.scss";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";

const Todos = () => {
  const [params] = useSearchParams();
  const dateParam = params.get("date")?.replace(/[-]/g, ",").split(",");

  if (!dateParam) return null;

  const date = new Date(
    Number(dateParam[0]),
    Number(dateParam[1]) - 1,
    Number(dateParam[2])
  );
  console.log(date);
  return (
    <main className={styles.todosWrap}>
      <TodoForm date={date} />
      <TodoList />
      <section className={styles.todoBtnWrap}>
        <Button buttonClassName={styles.todoBtn} buttonStyle={ButtonStyleEnum.Cancel}>취소</Button>
        <Button buttonClassName={styles.todoBtn} buttonStyle={ButtonStyleEnum.Normal}>확인</Button>
      </section>
    </main>
  );
};

export default Todos;
