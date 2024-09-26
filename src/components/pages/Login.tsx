// import { useMutation } from "@tanstack/react-query";
// import {
//   googleAuthFetch,
//   logoutFetch,
//   queryClient,
// } from "../../utils/http";

const Login = () => {

  // const googleLoginMutation = useMutation({
  //   mutationFn: googleAuthFetch,
  //   onSuccess: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ["users"] });
  //   },
  //   onError: (error) => {
  //     throw new Error(error.message);
  //   },
  // });

  // const logoutMutation = useMutation({
  //   mutationFn: logoutFetch,
  //   onSuccess: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ["users"] });
  //   },
  //   onError: (err) => {
  //     console.error(err.message);
  //   },
  // });

  // const handleGoogleSignIn = async () => {
  //   await googleLoginMutation.mutateAsync();
  // };

  // const handleLogout = () => {
  //   logoutMutation.mutateAsync();
  // };

  return (
    <div>
      <h2>Login</h2>
    </div>
  );
};

export default Login;
