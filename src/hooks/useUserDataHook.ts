import { useQueryClient } from "@tanstack/react-query";
import { appAuth } from "../firebase/config";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

export const useUserData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    const unsubscribe = onAuthStateChanged(appAuth, (currentUser) => {
      
      if (currentUser) {
        queryClient.invalidateQueries({
          queryKey: ["auth", currentUser.uid],
        });
      }
      
      const userSession = {
        email: currentUser?.email,
        displayName: currentUser?.displayName
      }

      if(userData === null) {
        sessionStorage.setItem("user", JSON.stringify(userSession));
      }
    });

    return () => unsubscribe();
  }, [queryClient]);
};