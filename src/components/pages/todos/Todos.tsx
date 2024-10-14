import { useNavigate, useSearchParams } from "react-router-dom";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

import styles from "./todos.module.scss";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addTodoFetch,
  deleteTodoFetch,
  getTodosFetch,
  queryClient,
} from "../../../utils/http";
import { appAuth } from "../../../firebase/config";
import { useTodoStore } from "../../../store/useTodoStore";
import { TodoData, TodoItem } from "../../../types";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Modal from "../../modal/Modal";
import Header from "../../header/Header";
import Loader from "../../loader/Loader";

const Todos = () => {
  const [params] = useSearchParams();
  const [isShowCancelModal, setIsShowCancelModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const { todos, selectedDate, setTodos, setSelectedDate } = useTodoStore();
  const navigate = useNavigate();

  const { data: todoData, isLoading } = useQuery({
    queryKey: [
      "todos",
      appAuth.currentUser?.uid,
      selectedDate.toISOString().split("T")[0],
    ],
    queryFn: () =>
      getTodosFetch({ date: selectedDate, uid: appAuth.currentUser!.uid }),
  });

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
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: [
          "todos",
          appAuth.currentUser?.uid,
          selectedDate.toISOString().split("T")[0],
        ],
      });
      toast.success(message);
      navigate("../");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoFetch,
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: [
          "todos",
          appAuth.currentUser?.uid,
          selectedDate.toISOString().split("T")[0],
        ],
      });
      toast.success(message);
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

  const handleShowDeleteModal = () => {
    setIsDeleteModal(true);
  };

  const handleDeleteTodo = async () => {
    console.log("delete");
    if(todoData && todoData[0].id) {
      await deleteMutation.mutateAsync({
        collectionName: "todos",
        id: todoData[0].id,
      });
    }
  };

  const handleShowModal = () => {
    if (todos.length !== 0) {
      setIsShowCancelModal(true);
    } else {
      navigate("../");
    }
  };

  const handleHideCancelModal = () => {
    setIsShowCancelModal(false);
  };

  const handleHideDeleteModal = () => {
    setIsDeleteModal(false);
  };

  const handleCancel = () => {
    setTodos([]);
    navigate("../");
  };

  if(isLoading) {
    return <Loader />
  }
  return (
    <main className={styles.todosWrap}>
      <Header title="TODO" onDelete={handleShowDeleteModal} />
      <TodoForm date={selectedDate} />
      <TodoList todosData={todoData ? (todoData[0].todos as TodoItem[]) : []} />
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
        <Modal isOpen={isShowCancelModal} onClose={handleHideCancelModal}>
          <strong className={styles.todoModalTitle}>
            저장되지 않은 할일은 삭제됩니다.
            <br />
            취소하시겠습니까?
          </strong>
          <section className={styles.todoBtnWrap}>
            <Button
              buttonClassName={styles.todoModalBtn}
              buttonStyle={ButtonStyleEnum.Cancel}
              onClick={handleHideCancelModal}
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
      {isDeleteModal && (
        <Modal isOpen={isDeleteModal} onClose={handleHideDeleteModal}>
          <strong className={styles.todoModalTitle}>
            저장되지 않은 할일은 삭제됩니다.
            <br />
            취소하시겠습니까?
          </strong>
          <section className={styles.todoBtnWrap}>
            <Button
              buttonClassName={styles.todoModalBtn}
              buttonStyle={ButtonStyleEnum.Cancel}
              onClick={handleHideDeleteModal}
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteTodo}
              buttonClassName={styles.todoModalBtn}
              buttonStyle={ButtonStyleEnum.Normal}
            >
              삭제
            </Button>
          </section>
        </Modal>
      )}
    </main>
  );
};

export default Todos;
