// useAuthState.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { appAuth } from '../firebase/config';
import { useQueryClient } from "@tanstack/react-query";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const userSession = {
          email: currentUser.email,
          displayName: currentUser.displayName,
        };
        sessionStorage.setItem("user", JSON.stringify(userSession));
        
        // 사용자 데이터 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: ["auth", currentUser.uid],
        });
      } else {
        sessionStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return { user, loading };
};