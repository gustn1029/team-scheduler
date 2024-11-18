import { FirebaseError } from "firebase/app";
import toast from 'react-hot-toast';

export const handleError = (error: unknown) => {
 const message =
   error instanceof FirebaseError
     ? `error code: ${error.code},\nmessage: ${error.message}`
     : `${error as Error}`;

 // react-hot-toast는 더 간단한 옵션 구조를 가짐
 toast.error(message, {
   duration: 3000,
   position: 'top-center',
   style: {
     backgroundColor: '#fff',
     color: '#363636'
   },
 });

 console.error("error: ", message);
};