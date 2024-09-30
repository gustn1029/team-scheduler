import Home from "./components/pages/home/Home";
import Login from "./components/pages/Login";
import { useUserData } from "./hooks/useUserDataHook";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from './components/pages/Profile';
import Create from "./components/pages/create/Create";
import { SignUp } from "./components/pages/signup/SignUp";


function App() {
  useUserData();
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<Create />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
