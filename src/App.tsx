import Home from "./components/pages/home/Home";
import Login from "./components/pages/login/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./components/pages/Profile";
import Create from "./components/pages/create/Create";
import { SignUp } from "./components/pages/signup/SignUp";
import FindPassword from "./components/pages/findpassword/FindPassword";
import NotFound from "./components/pages/notFound/NotFound";
import Loader from "./components/loader/Loader";
import ToastProvider from "./components/toast/ToastProvider";
import CalendarList from "./components/pages/calendarlist/CalendarList";
import RootLayout from "./components/layouts/RootLayout";
import TodosCreate from "./components/pages/todo/create/TodosCreate";
import TodoList from "./components/pages/todo/list/TodoList";
import TodosEdit from "./components/pages/todo/edit/TodosEdit";


function App() {

  return (
    <>
      <BrowserRouter>
        <Loader />
        <RootLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<Create />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/findpassword" element={<FindPassword />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/calendarlist" element={<CalendarList />} />
            <Route path="/todo-create" element={<TodosCreate />} />
            <Route path="/todo-list" element={<TodoList />} />
            <Route path="/todo-edit" element={<TodosEdit />} />
          </Routes>
        </RootLayout>
        <ToastProvider />
      </BrowserRouter>
    </>
  );
}

export default App;
