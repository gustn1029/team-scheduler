import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login/Login";
import CalendarComponent from "./components/pages/calendar/CalendarComponent";
import Profile from "./components/pages/Profile";
import Create from "./components/pages/create/Create";
import { SignUp } from "./components/pages/signup/SignUp";
import FindPassword from "./components/pages/findpassword/FindPassword";
import NotFound from "./components/pages/notFound/NotFound";
import Loader from "./components/loader/Loader";
import ToastProvider from "./components/toast/ToastProvider";
import CalendarList from "./components/pages/calendarlist/CalendarList";
import Todos from "./components/pages/todos/Todos";

function App() {
  return (
    <>
      <BrowserRouter>
        <Loader />
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<Create />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/findpassword" element={<FindPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/calendarlist" element={<CalendarList />} />
          <Route path="/todo" element={<Todos />} />
        </Routes>
        <ToastProvider />
      </BrowserRouter>
    </>
  );
}

export default App;
