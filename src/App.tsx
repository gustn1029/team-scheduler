import Home from "./components/pages/home/Home";
// import Login from "./components/pages/Login";
// import { SignUp } from "./components/pages/SignUp/SignUp";
import { useUserData } from "./hooks/useUserDataHook";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  useUserData();
  return (
    <>
      {/* <Login />*/}
      {/* <SignUp />  */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
