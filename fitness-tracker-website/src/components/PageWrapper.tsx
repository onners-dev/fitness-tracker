import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageWrapperProps = {
  children: ReactNode;
};

const variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2, ease: "easeIn" as const } },
};

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
