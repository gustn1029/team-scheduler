import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuthState } from "../../hooks/useAuthState";
import Loader from "../loader/Loader";

const RouteLayout = () => {
  const isAuthenticated = sessionStorage.getItem("user");
  const navigate = useNavigate();
  const { user, loading } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, user]);

  if (loading) {
    return <Loader />;
  }

  return (isAuthenticated && user) ? <Outlet /> : null;
};

export default RouteLayout;