import { useNavigate, useSearchParams } from "react-router-dom";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

import styles from "./todos.module.scss";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import { useMutation } from "@tanstack/react-query";
import { addTodoFetch, queryClient } from "../../../utils/http";
import { appAuth } from "../../../firebase/config";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoData } from "../../../types";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Modal from "../../modal/Modal";

const Todos = () => {
  const [params] = useSearchParams();
  const [isShowCancelModal, setIsShowCancelModal] = useState<boolean>(false);
  const { todos, selectedDate, setTodos, setSelectedDate } = useTodoStore();
  const navigate = useNavigate();

  useEffect(() => {
    const dateParam = params
      .get("date")
      ?.replace(/[-]/g, ",")
      .split(",")
      .map(Number);

    if (dateParam) {
      const date = new Date(dateParam[0], dateParam[1] - 1, dateParam[2]);

      setSelectedDate(date);
    }
  }, [setSelectedDate, params]);

  const addTodoMutation = useMutation({
    mutationFn: addTodoFetch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "todos",
          appAuth.currentUser?.uid,
          selectedDate.toISOString().split("T")[0],
        ],
      });
      toast.success("할일을 정상적으로 저장했습니다.")
      navigate("../");
    },
  });

  const handleAddTodos = async () => {
    if (todos.length === 0) {
      toast.error("할일을 추가해 주세요.");
      return;
    }

    if (appAuth.currentUser?.uid) {
      const newTodoData: TodoData = {
        todos: todos,
        todoDate: selectedDate,
        createDate: new Date(),
        updateDate: null,
        uid: appAuth.currentUser?.uid,
      };

      await addTodoMutation.mutateAsync({
        data: newTodoData,
        uid: appAuth.currentUser?.uid,
        date: selectedDate,
      });

      setTodos([]);
    }
  };

  const handleShowModal = () => {
    if (todos.length !== 0) {
      setIsShowCancelModal(true);
    } else {
      navigate("../");
    }
  };

  const handleHideModal = () => {
    setIsShowCancelModal(false);
  };

  const handleCancel = () => {
    setTodos([]);
    navigate("../");
  };
  return (
    <main className={styles.todosWrap}>
      <TodoForm date={selectedDate} />
      <TodoList />
      <section className={styles.todoBtnWrap}>
        <Button
          buttonClassName={styles.todoBtn}
          buttonStyle={ButtonStyleEnum.Cancel}
          onClick={handleShowModal}
        >
          취소
        </Button>
        <Button
          buttonClassName={styles.todoBtn}
          onClick={handleAddTodos}
          buttonStyle={ButtonStyleEnum.Normal}
        >
          저장
        </Button>
      </section>
      {isShowCancelModal && (
        <Modal isOpen={isShowCancelModal} onClose={handleHideModal}>
          <strong className={styles.todoModalTitle}>
            저장되지 않은 할일은 삭제됩니다.<br />취소하시겠습니까?
          </strong>
          <section className={styles.todoBtnWrap}>
            <Button
              buttonClassName={styles.todoModalBtn}
              buttonStyle={ButtonStyleEnum.Cancel}
              onClick={handleHideModal}
            >
              취소
            </Button>
            <Button
              onClick={handleCancel}
              buttonClassName={styles.todoModalBtn}
              buttonStyle={ButtonStyleEnum.Normal}
            >
              확인
            </Button>
          </section>
        </Modal>
      )}
    </main>
  );
};

export default Todos;
