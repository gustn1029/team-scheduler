import Login from "./components/pages/Login";
import { useUserData } from "./hooks/useUserDataHook";

function App() {
  useUserData();
  return (
    <>
      <h1>team-scheduler</h1>
      <Login />
    </>
  );
}

export default App;
