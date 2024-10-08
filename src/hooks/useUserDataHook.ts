import { useQueryClient } from "@tanstack/react-query";
import { appAuth } from "../firebase/config";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

export const useUserData = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        queryClient.invalidateQueries({
          queryKey: ["auth", currentUser.uid],
        });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return { user };
};