"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface WelcomeScreenProps {
  onNavigateToOpinio: () => void;
  onNavigateToSnaps: () => void;
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

const WelcomeScreen = memo(({
  onNavigateToOpinio,
  onNavigateToSnaps,
  currentPage,
  setCurrentPage
}: WelcomeScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex-col md:flex-row lg:ml-52 text-white flex">
        <div className=" lg:block">
          {/* Sidebar component would be imported here */}
        </div>
        <div className="flex-1 ml-0 md:ml-4 mr-2 md:mr-6 rounded-md px-2 mt-20 md:mt-0">
          <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[400px] sm:min-h-[550px]">
              <div
                className="lg:w-full relative px-4 py-2 text-white
              shadow-[inset_0px_1px_0.5px_rgba(255,255,255,0.5),0px_1px_2px_rgba(26,19,161,0.5),0px_0px_0px_1px_#4F47EB]
              bg-gradient-to-r from-[#4F47EB] to-[#3B32C7] rounded-lg m-2"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 rounded-lg" />

                <div className="absolute inset-0 opacity-20 rounded-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                </div>

                <div className="relative z-20 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 text-center h-full">
                  <div className="mb-4 sm:mb-6">
                    <Image
                      src="/connect_log.png"
                      alt="Clapo Illustration"
                      width={300}
                      height={300}
                      className="w-auto h-32 sm:h-48 lg:h-64 object-contain"
                    />
                  </div>
                  <div className="text-center lg:text-left mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                      Get Started
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed px-2">
                      Sign in to start posting, engaging with others, and
                      exploring the Web3 social experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

WelcomeScreen.displayName = "WelcomeScreen";

export default WelcomeScreen;