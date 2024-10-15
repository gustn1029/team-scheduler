import { FirebaseError } from "firebase/app";
import { toast, ToastOptions } from "react-toastify";

export const handleError = (error: unknown) => {
  const message =
    error instanceof FirebaseError
      ? `error code: ${error.code},\nmessage: ${error.message}`
      : `${error as Error}`;

  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  toast.error(message, toastOptions);
  console.error("error: ", message);
};
