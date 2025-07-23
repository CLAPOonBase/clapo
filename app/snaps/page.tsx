"use client"
import { motion } from "framer-motion";

export default function SnapsPage() {
  return (
     <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        ><div className="text-center text-white mt-20">Snaps page coming soon.</div></motion.div>
    
  );
}
