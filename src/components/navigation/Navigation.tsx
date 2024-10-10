import { useViewNavStore } from "../../store/useViewNavStore";
import { FaXmark } from "react-icons/fa6";
import IconButton from "../button/iconButton/IconButton";
import styles from "./navigation.module.scss";
import { useMutation, useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import { logoutFetch, queryClient, userDataFetch } from "../../utils/http";

import thumbnailImage from "../../assets/images/profile/thumbnail.svg";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import { useNavigate } from "react-router-dom";

import { FaCog } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";

const Navigation = () => {
  const { toggleIsView } = useViewNavStore();
  const navigate = useNavigate();

  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFetch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toggleIsView();
      sessionStorage.removeItem("user");
      navigate("/login");
    },
    onError: (error) => {
      console.error(error.message);
      alert(`error: ${error.message}`);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogin = () => {
    toggleIsView();
    navigate("/login");
  };

  const handleRouteUrl = () => {
    toggleIsView();
    if (authData) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className={`${styles.navigation}`}>
      <ul className={styles.navList}>
        <li>
          <IconButton
            icon={<FaXmark className={styles.closeBtn} />}
            onClick={toggleIsView}
          />
        </li>
        <li className={styles.navItem}>
          <div className={styles.profileWrap}>
            <img
              src={authData ? `${authData?.imageUrl}` : thumbnailImage}
              alt={authData ? authData.nickname : "profile thumbnail"}
              className={authData ? styles.authProfile : styles.basicProfile}
            />
            <p>{authData ? authData?.nickname : "로그인이 필요합니다."}</p>
          </div>
          <IconButton
            icon={<FaCog />}
            className={styles.settingBtn}
            onClick={handleRouteUrl}
          />
        </li>
      </ul>
      {authData ? (
        <Button
          buttonStyle={ButtonStyleEnum.NONE}
          buttonClassName={styles.logoutBtn}
          onClick={handleLogout}
        >
          LOGOUT
        </Button>
      ) : (
        <Button
          buttonStyle={ButtonStyleEnum.NONE}
          buttonClassName={styles.loginBtn}
          onClick={handleLogin}
        >
          <RiLogoutBoxFill className={styles.loginIcon} />
          LOGIN
        </Button>
      )}
    </nav>
  );
};

export default Navigation;
