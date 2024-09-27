import Home from "./components/pages/home/Home";
// import Login from "./components/pages/Login";
// import { SignUp } from "./components/pages/SignUp/SignUp";
import { useUserData } from "./hooks/useUserDataHook";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from './components/pages/Profile';

function App() {
  useUserData();
  return (
    <>
      {/* <Login />*/}
      {/* <SignUp />  */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
