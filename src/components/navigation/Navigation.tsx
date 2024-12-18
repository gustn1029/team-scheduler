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
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FaCog } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { useDateStore } from "../../store/useDateStore";
import { useEffect } from "react";

const Navigation = () => {
  const { setIsView, isView } = useViewNavStore();
  const { setDate } = useDateStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFetch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      setIsView(false);
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

  useEffect(() => {
    setIsView(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogin = () => {
    setIsView(false);
    navigate("/login");
  };

  const handleRouteUrl = () => {
    setIsView(false);
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
            onClick={()=> setIsView(false)}
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
        <li className={styles.categoryWrap}>
          <dl>
            <dt>
              <span>카테고리</span>
              <IconButton icon={<FaPlus />} />
            </dt>
            <dd>
              <Link to={"/"} className={styles.user}>
                개인
              </Link>
            </dd>
            {authData?.teams.map((el) => (
              <dd>
                <Link to={`/${el.teamId}/calendar`} className={styles.team}>
                  {el.title}
                </Link>
              </dd>
            ))}
          </dl>
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
