import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 1500,
        style: {
          fontSize: "13px",
        },
      }}
    />
  );
};

export default ToastProvider;
