import { HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MainAnimationLayoutProps extends HTMLMotionProps<"main"> {
  variants: Variants;
  className?: string;
  children: ReactNode;
}

const MainAnimationLayout = ({
  variants,
  children,
  className = "",
}: MainAnimationLayoutProps) => {
  return (
    <motion.main
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.main>
  );
};

export default MainAnimationLayout;
