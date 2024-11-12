import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./components/pages/login/Login";
import CalendarComponent from "./components/pages/calendar/CalendarComponent";
import Profile from "./components/pages/Profile";
import Create from "./components/pages/create/Create";
import { SignUp } from "./components/pages/signup/SignUp";
import FindPassword from "./components/pages/findpassword/FindPassword";
import NotFound from "./components/pages/notFound/NotFound";
import Loader from "./components/loader/Loader";
import CalendarList from "./components/pages/calendarlist/CalendarList";
import Todos from "./components/pages/todos/Todos";
import RouteLayout from "./components/layouts/RouteLayout";
import Edit from "./components/pages/edit/Edit";
import Detail from "./components/pages/detail/Detail";
import ToastProvider from "./components/toast/ToastProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Loader />
        <RouteLayout />
      </>
    ),
    children: [
      { index: true, element: <Navigate to="/calendar" replace /> },
      {
        path: "calendar",
        element: <CalendarComponent />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "create",
        element: <Create />,
      },
      {
        path: "calendarlist/:id/edit",
        element: <Edit />,
      },
      {
        path: "calendarlist",
        element: <CalendarList />,
      },
      {
        path: "calendarlist/:id",
        element: <Detail />,
      },
      {
        path: "todo",
        element: <Todos />,
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/findpassword",
    element: <FindPassword />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
    </>
  );
}

export default App;
