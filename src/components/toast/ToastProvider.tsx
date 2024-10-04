import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import styles from './toast.module.scss';

const ToastProvider = () => {
  return (
    <ToastContainer
          position="top-right"
          autoClose={3000}
          className={styles.toast}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={true}
          theme="light"
        />
  )
}

export default ToastProvider