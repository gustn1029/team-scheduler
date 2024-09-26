import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { appAuth } from "../firebase/config";

interface AuthCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const emailSignUpMutation = useMutation({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      const userCredential = await createUserWithEmailAndPassword(
        appAuth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      const userCredential = await signInWithEmailAndPassword(
        appAuth,
        email,
        password
      );
      return userCredential.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => signOut(appAuth),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  return {
    signUp: emailSignUpMutation.mutate,
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    isLoading:
      emailSignUpMutation.isPending ||
      signInMutation.isPending ||
      signOutMutation.isPending,
    error:
      emailSignUpMutation.error ||
      signInMutation.error ||
      signOutMutation.error,
  };
};
