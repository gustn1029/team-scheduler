import { useQueryClient } from "@tanstack/react-query";
import { appAuth } from "../firebase/config";
import { useEffect } from "react";
import { UserInfo, useUserStore } from "../store/userStore";
import { onAuthStateChanged } from "firebase/auth";


export const useUserData = () => {
  const { setUserData } = useUserStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          const userData: UserInfo = {
            token: token,
            uid: user.uid,
          };

          setUserData(userData);
        });
        queryClient.invalidateQueries({ queryKey: [] });
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [queryClient, setUserData]);
};
