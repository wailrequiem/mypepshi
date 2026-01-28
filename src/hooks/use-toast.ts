import { useState } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const toast = (props: any) => {
    console.log("Toast:", props);
  };

  return {
    toast,
    toasts,
    dismiss: () => {},
  };
};
