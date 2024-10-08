import { ReactNode } from "react";
import { useUserData } from "../../hooks/useUserDataHook";

interface RootLayoutProps {
  children: ReactNode;
}
const RootLayout = ({ children }: RootLayoutProps) => {
  useUserData();
  
  return <>{children}</>;
};

export default RootLayout;
