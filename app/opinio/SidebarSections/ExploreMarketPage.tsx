import MainVoting from "../Sections/MainVoting";
import { motion } from "framer-motion";

const ExploreMarketPage = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className=""
      >
        <MainVoting />
      </motion.div>
    </div>
  );
};

export default ExploreMarketPage;
