"use client"
import { motion } from "framer-motion";
import Hero from "./Sections/Hero";
// import MainVoting from "./Sections/MainVoting";
import Sidebar from "./Sections/Sidebar";
import { useState } from "react";
import ExploreMarketPage from "./SidebarSections/ExploreMarketPage";
import MyPortfolioPage from "./SidebarSections/MyPortfolioPage";
import WalletPage from "./SidebarSections/WalletPage";
import SettingsPage from "./SidebarSections/SettingsPage";
import CreateMarketPage from "./SidebarSections/CreateMarketPage";
export default function OpinioPage() {
  const [currentPage, setCurrentPage] = useState<'exploremarket' | 'myportfolio' | 'wallet' | 'settings' | 'createmarket' >('exploremarket');
    const renderContent = () => {
    switch (currentPage) {
      case 'exploremarket':
        return <ExploreMarketPage />
      case 'myportfolio':
        return <MyPortfolioPage />
      case 'wallet':
        return <WalletPage/>
      case 'settings':
        return <SettingsPage />
        case 'createmarket':
        return <CreateMarketPage />
      case 'exploremarket':
      default:
        return (
          <>
          <Hero />
          </>
        )
    }
  }
  return <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        ><div className="text-center flex  min-h-screen text-white">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="w-full">
            {renderContent()}
          </div>
   
  </div></motion.div>;
} 