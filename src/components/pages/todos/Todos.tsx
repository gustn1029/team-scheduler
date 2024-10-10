import { useNavigate, useSearchParams } from "react-router-dom";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

import styles from "./todos.module.scss"

const Todos = () => {
  const [params] = useSearchParams();
  const dateParam = params.get("date")?.replace(/[-]/g, ",").split(",");

  if(!dateParam) return null;

  const date = new Date(Number(dateParam[0]),Number(dateParam[1]) - 1, Number(dateParam[2]));
  console.log(date)
  return (
    <>
      <TodoForm date={date} />
      <TodoList />
    </>
  );
};

export default Todos;
