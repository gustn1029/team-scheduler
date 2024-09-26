import Login from "./components/pages/Login";
import { SignUp } from "./components/pages/signup/SignUp";
import { useUserData } from "./hooks/useUserDataHook";

function App() {
  useUserData();
  return (
    <>
      <h1>team-scheduler</h1>
      <Login />
      <SignUp />
    </>
  );
}

export default App;
