"use client"
import { motion } from "framer-motion";
import Hero from "./Sections/Hero";
import MainVoting from "./Sections/MainVoting";

export default function OpinioPage() {
  return <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        ><div className="text-center min-h-screen text-white mt-20">
       
    <Hero/>
    <MainVoting/>
  </div></motion.div>;
} 