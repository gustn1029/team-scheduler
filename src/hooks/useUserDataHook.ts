import { useQueryClient } from "@tanstack/react-query";
import { appAuth } from "../firebase/config";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export const useUserData = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (user) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["auth", appAuth.currentUser?.uid] });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [queryClient, navigate]);
};
