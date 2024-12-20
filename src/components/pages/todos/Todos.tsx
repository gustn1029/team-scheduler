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
import { TodoData } from "../../../types";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Modal from "../../modal/Modal";
import Header from "../../header/Header";
import Loader from "../../loader/Loader";
import { AnimatePresence } from "framer-motion";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import { layoutYVarients } from "../../../utils/Animations";

const Todos = () => {
  const [params] = useSearchParams();
  const [isShowCancelModal, setIsShowCancelModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const {
    todos,
    isComplete,
    setIsComplete,
    selectedDate,
    setTodos,
    setSelectedDate,
  } = useTodoStore();
  const navigate = useNavigate();

  // todo 데이터 불러오기
  const { data: todoData, isLoading } = useQuery({
    queryKey: [
      "todos",
      appAuth.currentUser?.uid,
      selectedDate.toISOString().split("T")[0],
    ],
    queryFn: () =>
      getTodosFetch({ date: selectedDate, uid: appAuth.currentUser!.uid }),
    enabled: !!appAuth.currentUser?.uid,
  });

  useEffect(() => {
    if (todoData && todoData.length > 0) {
      setTodos(todoData[0].todos);
    } else {
      setTodos([]);
    }
  }, [todoData, setTodos]);

  useEffect(() => {
    if (todoData?.length === 0 && todos.length === 0) {
      setIsComplete(false);
    }
  }, [setIsComplete, todos, todoData]);

  // 선택된 날짜 저장
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

  // 입력된 todo 데이터 저장할 때 사용하는 mutation 설정
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
      navigate(-1);

      if (isComplete) {
        setIsComplete(false);
      }
    },
  });

  // 해당 날짜의 todo 데이터를 삭제할 때 사용하는 mutation 설정
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
      navigate(-1);

      if (isComplete) {
        setIsComplete(false);
      }
    },
  });

  // 투두 데이터 등록 함수
  const handleAddTodos = async () => {
    if (todoData && todoData[0]?.todos && todos.length === 0) {
      setIsDeleteModal(true);
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

  // 삭제 모달 보여주는 함수
  const handleShowDeleteModal = () => {
    if (todos.length !== 0) {
      setIsDeleteModal(true);
      console.log(todos);
    } else {
      toast.error("삭제할 데이터가 없습니다.");
    }
  };

  // todo 데이터 삭제 함수
  const handleDeleteTodo = async () => {
    if (!todoData || todoData.length === 0) {
      toast.error("삭제할 할일이 없습니다.");
      setIsDeleteModal(false);
      return;
    }

    if (todoData[0]?.id) {
      await deleteMutation.mutateAsync({
        collectionName: "todos",
        id: todoData[0].id,
      });
    } else {
      toast.error("삭제할 데이터의 ID를 찾을 수 없습니다.");
      setIsDeleteModal(false);
    }
  };

  // 취소 모달 보여주는 함수
  const handleShowModal = () => {
    if (todoData && todoData[0]?.todos) {
      if (todoData[0]?.todos.length !== todos.length) {
        setIsShowCancelModal(true);
      } else {
        navigate(-1);
        if (isComplete) {
          setIsComplete(false);
        }
      }
      return;
    }

    if (todos.length === 0) {
      navigate(-1);
    } else {
      setIsShowCancelModal(true);
    }

    if (isComplete) {
      setIsComplete(false);
    }
  };

  // 취소 모달 닫는 함수
  const handleHideCancelModal = () => {
    setIsShowCancelModal(false);
  };

  // 삭제 모달 닫는 함수
  const handleHideDeleteModal = () => {
    setIsDeleteModal(false);
  };

  // 뒤로가기 때 실행되는 함수
  const handleCancel = () => {
    setTodos([]);
    navigate(-1);

    if (isComplete) {
      setIsComplete(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const buttonDisabledCheck = !isComplete;

  const emptyTodosCheck = todoData && todoData[0]?.todos && todos.length === 0;

  console.log(emptyTodosCheck);
  return (
    <MainAnimationLayout
      variants={layoutYVarients}
      className={styles.todosWrap}
    >
      <Header
        title="TODO"
        onDelete={
          todoData && todoData[0]?.todos && !emptyTodosCheck
            ? handleShowDeleteModal
            : undefined
        }
        onCancel={handleShowModal}
      />
      <TodoForm />
      <TodoList
        todosData={todoData && todoData.length !== 0 ? todoData[0].todos : []}
      />
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
          onClick={emptyTodosCheck ? handleDeleteTodo : handleAddTodos}
          buttonStyle={
            buttonDisabledCheck
              ? ButtonStyleEnum.Primary
              : ButtonStyleEnum.Normal
          }
          disabled={buttonDisabledCheck ? true : undefined}
        >
          저장
        </Button>
      </section>
      <AnimatePresence>
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
              할일을 전체 삭제하시겠습니까?
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
      </AnimatePresence>
    </MainAnimationLayout>
  );
};

export default Todos;
