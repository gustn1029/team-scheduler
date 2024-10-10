import { ReactNode, useEffect } from "react";
import { useUserData } from "../../hooks/useUserDataHook";
import { useLocation, useNavigate } from "react-router-dom";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const user = sessionStorage.getItem("user");

  useEffect(() => {
    const publicPaths = ["/login", "/signup", "/findpassword"];
    if (user) {
      if (location.pathname === "/login") {
        navigate("/home");
      }
    } else {
      if (!publicPaths.includes(location.pathname)) {
        navigate("/login");
      }
    }
  }, [user, navigate, location]);

  return <>{children}</>;
};

export default RootLayout;