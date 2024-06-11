import { motion } from "framer-motion";

export const ReactExample = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-min"
    >
      <h1>Hi there!</h1>
    </motion.div>
  );
};
