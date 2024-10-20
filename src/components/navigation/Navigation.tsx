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
import { useDateStore } from "../../store/useDateStore";

const Navigation = () => {
  const { toggleIsView } = useViewNavStore();
  const { setDate } = useDateStore();
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
      if (sessionStorage.getItem("currentDate") !== null) {
        sessionStorage.removeItem("currentDate");
      }
      setDate(new Date());
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
            className={styles.closeBtn}
            icon={<FaXmark />}
            onClick={toggleIsView}
          />
        </li>
        <li className={styles.profileWrap}>
          <img
            src={authData ? `${authData?.profileImg}` : thumbnailImage}
            alt={authData ? authData.nickname : "profile thumbnail"}
            className={styles.authProfile}
          />
          <p>{authData ? authData?.nickname : "로그인이 필요합니다."}</p>
        </li>
        <li>
          <Button
            buttonStyle={ButtonStyleEnum.NONE}
            buttonClassName={styles.settingBtn}
            onClick={handleRouteUrl}
          >
            <span>프로필 수정</span>
            <FaCog />
          </Button>
        </li>
        <li>
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
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
