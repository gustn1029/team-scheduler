import { useEffect } from "react";
import { useNavigate, Outlet, useParams } from "react-router-dom";
import { useAuthState } from "../../hooks/useAuthState";
import Loader from "../loader/Loader";
import { AnimatePresence } from "framer-motion";
import { useTeamStore } from "../../store/useTeamStore";

const RouteLayout = () => {
  const isAuthenticated = sessionStorage.getItem("user");
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { teamId } = useParams();
  const { setTeamName } = useTeamStore();

  useEffect(() => {
    if (teamId) {
      setTeamName(teamId);
    } else {
      setTeamName(null);
    }
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, user, teamId]);

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated && user ? (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  ) : null;
};

export default RouteLayout;
