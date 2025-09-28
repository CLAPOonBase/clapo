/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Sidebar from "./Sections/Sidebar";
import { SnapComposer } from "./Sections/SnapComposer";
import SnapCard from "./Sections/SnapCard";
import Image from "next/image";
import ActivityFeed from './Sections/ActivityFeed'
import { ExplorePage } from "./SidebarSection/ExplorePage";
import NotificationPage from "./SidebarSection/NotificationPage";
import BookmarkPage from "./SidebarSection/BookmarkPage";
import { ProfilePage } from "./SidebarSection/ProfilePage";
import SearchPage from "./SidebarSection/SearchPage";
import MessagePage from "./SidebarSection/MessagePage";
import { mockUsers } from "../lib/mockdata";
import ActivityPage from "./SidebarSection/ActivityPage";
import { useApi } from "../Context/ApiProvider";
import { PostSkeleton, LoadingSpinner } from "../components/SkeletonLoader";
import UserActivityFeed from "./Sections/ActivityFeed";
import { AnimatePresence, motion } from "framer-motion";
import SharePage from "./SidebarSection/SharePage";
import { X } from "lucide-react";
import Stories from "../components/Story";

function SocialFeedPageContent() {
  const [activeTab, setActiveTab] = useState<"FOR YOU" | "FOLLOWING">(
    "FOR YOU"
  );
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "explore"
    | "notifications"
    | "likes"
    | "activity"
    | "profile"
    | "messages"
    | "bookmarks"
    | "share"
    | "search"
    | "shares"
  >("home");
  const [followingPosts, setFollowingPosts] = useState<any[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [retweeted, setRetweeted] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const { data: session, status } = useSession();
  const {
    state,
    fetchPosts,
    fetchNotifications,
    fetchActivities,
    getFollowingFeed,
    refreshPosts,
  } = useApi();
  const searchParams = useSearchParams();

  // Handle URL parameters for page state restoration
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const validPages = [
        "home",
        "explore",
        "notifications",
        "likes",
        "activity",
        "profile",
        "messages",
        "bookmarks",
        "share",
        "search",
        "shares",
      ];
      if (validPages.includes(pageParam as any)) {
        setCurrentPage(pageParam as any);
        // Clear the page parameter from URL after setting the page
        const url = new URL(window.location.href);
        url.searchParams.delete("page");
        window.history.replaceState({}, "", url.toString());

        // Check if we have stored scroll position for this page
        const storedState = sessionStorage.getItem("profileNavigationState");
        if (storedState) {
          try {
            const navigationState = JSON.parse(storedState);
            // Only restore scroll if it's for the same page type
            if (navigationState.searchParams === `page=${pageParam}`) {
              setTimeout(() => {
                if (navigationState.scrollY > 0) {
                  window.scrollTo(0, navigationState.scrollY);
                }
              }, 100);
            }
          } catch (error) {
            console.error(
              "Failed to parse navigation state for scroll restoration:",
              error
            );
          }
        }
      }
    }
  }, [searchParams]);

  // Handle stored target page from profile navigation
  useEffect(() => {
    const targetPage = sessionStorage.getItem("targetPage");
    const targetScrollY = sessionStorage.getItem("targetScrollY");

    if (targetPage) {
      const validPages = [
        "home",
        "explore",
        "notifications",
        "likes",
        "activity",
        "profile",
        "messages",
        "bookmarks",
        "share",
        "search",
        "shares",
      ];
      if (validPages.includes(targetPage as any)) {
        setCurrentPage(targetPage as any);

        // Clear the stored target page
        sessionStorage.removeItem("targetPage");

        // Restore scroll position if available
        if (targetScrollY) {
          const scrollY = parseInt(targetScrollY);
          sessionStorage.removeItem("targetScrollY");
          setTimeout(() => {
            if (scrollY > 0) {
              window.scrollTo(0, scrollY);
            }
          }, 100);
        }
      }
    }
  }, []);

  // Cleanup navigation state when component unmounts
  useEffect(() => {
    return () => {
      // Clear any stored navigation state when leaving the page
      sessionStorage.removeItem("profileNavigationState");
    };
  }, []);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.dbUser?.id &&
      !hasInitializedData
    ) {
      fetchPosts(session.dbUser.id);
      fetchNotifications(session.dbUser.id);
      fetchActivities(session.dbUser.id);
      setHasInitializedData(true);
    }

    if (status === "unauthenticated") {
      setHasInitializedData(false);
    }
  }, [session, status, hasInitializedData]);

  // Removed auto-refresh to prevent NEW posts from disappearing
  // Users can manually refresh when they want to see the latest posts

  const loadFollowingFeed = async () => {
    if (!session?.dbUser?.id || isLoadingFollowing) return;

    setIsLoadingFollowing(true);
    try {
      const response = await getFollowingFeed(session.dbUser.id, 50, 0);
      setFollowingPosts(response.posts || []);
    } catch (error) {
      console.error("Failed to load following feed:", error);
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const handleTabChange = (tab: "FOR YOU" | "FOLLOWING") => {
    setActiveTab(tab);
    if (tab === "FOLLOWING") {
      loadFollowingFeed();
    }
  };

  const handleNavigateToOpinio = () => {
    window.location.href = '/opinio';
  };

  const handleNavigateToSnaps = () => {
    setCurrentPage('home');
  };

  const toggleSet = (set: Set<number>, id: number): Set<number> => {
    const newSet = new Set(set);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return newSet;
  };

  const allPosts = state.posts.posts;

  const renderContent = () => {
    switch (currentPage) {
      case "explore":
        return <div className="w-full max-w-3xl mt-6 lg:ml-80">
          <ExplorePage/>
        </div>
      case "notifications":
        return <div className="w-full max-w-3xl mt-6 lg:ml-80"> <NotificationPage/></div>
      case "likes":
        return allPosts.length > 0 ? (
          <SnapCard
            post={allPosts[0]}
            liked={liked.has(parseInt(allPosts[0].id))}
            bookmarked={bookmarked.has(parseInt(allPosts[0].id))}
            retweeted={retweeted.has(parseInt(allPosts[0].id))}
            onLike={(id) =>
              setLiked(
                toggleSet(liked, typeof id === "string" ? parseInt(id) : id)
              )
            }
            onBookmark={(id) =>
              setBookmarked(
                toggleSet(
                  bookmarked,
                  typeof id === "string" ? parseInt(id) : id
                )
              )
            }
            onRetweet={(id) =>
              setRetweeted(
                toggleSet(retweeted, typeof id === "string" ? parseInt(id) : id)
              )
            }
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts available
          </div>
        );
      case "bookmarks":
        return <div className="w-full max-w-3xl mt-6 lg:ml-80">
          <BookmarkPage />
        </div>;
      case "activity":
        return <div className="w-full max-w-3xl mt-6 lg:ml-80">
          <ActivityPage />{" "}
        </div>;
      case "profile":
        return <div className="w-full max-w-3xl lg:ml-80 mt-6">
          <ProfilePage user={mockUsers[0]} posts={[]} />{" "}
        </div>;
      case "search":
        return <div className="w-full max-w-3xl lg:ml-80 mt-6">
          <SearchPage />
        </div>;
      case "share":
        return <div className="w-full lg:pl-60 mt-6">
          <SharePage />
        </div>;
      case "messages":
        return (
          <div className="w-full lg:pl-20">
            <MessagePage />
          </div>
        );
      case "home":
      default:
        return <div className="max-w-2xl lg:ml-80 px-2 sm:px-0">
             <>
            <Stories />
            {/* <SnapComposer /> */}
   <div className="bg-gray-700/70 rounded-full mt-2 p-1">
      <div>
        <div
          style={{ zIndex: 999 }}
          className="flex justify-around bg-black m-1 p-1 items-center rounded-full relative"
        >
          {["FOR YOU", "FOLLOWING","COMMUNITY"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`p-2 my-1 font-semibold w-full relative z-10 text-xs sm:text-sm ${
                activeTab === tab ? "text-white" : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}

    <motion.div
  className="absolute rounded-full"
  style={{
    height: "40px",
    boxShadow:
      "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
    backgroundColor: "#6E54FF",
    margin: "6px",
  }}
  initial={false}
  animate={{
    left:
      activeTab === "FOR YOU"
        ? "0%"
        : activeTab === "FOLLOWING"
        ? "calc(33% + 0px)"
        : "calc(66% + 0px)",
    width: "calc(33% - 6px)",
  }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>

        </div>
      </div>
    </div>
            <div className="mt-2 pt-2 rounded-2xl">
            

              <div className="">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "FOR YOU" ? 0 : 0 }}
                    animate={{ opacity: 1, x: 0, y: -30 }}
                    exit={{ opacity: 0, x: activeTab === "FOR YOU" ? 40 : -40 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    {activeTab === "FOR YOU" ? (
                      state.posts.loading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <PostSkeleton key={i} />
                          ))}
                        </div>
                      ) : allPosts.length > 0 ? (
                        allPosts.map((post) => (
                          <SnapCard
                            key={post.id}
                            post={post}
                            liked={liked.has(parseInt(post.id))}
                            bookmarked={bookmarked.has(parseInt(post.id))}
                            retweeted={retweeted.has(parseInt(post.id))}
                            onLike={(id) =>
                              setLiked(
                                toggleSet(
                                  liked,
                                  typeof id === "string" ? parseInt(id) : id
                                )
                              )
                            }
                            onBookmark={(id) =>
                              setBookmarked(
                                toggleSet(
                                  bookmarked,
                                  typeof id === "string" ? parseInt(id) : id
                                )
                              )
                            }
                            onRetweet={(id) =>
                              setRetweeted(
                                toggleSet(
                                  retweeted,
                                  typeof id === "string" ? parseInt(id) : id
                                )
                              )
                            }
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {status === "authenticated" ? (
                            <div>
                              {[...Array(3)].map((_, i) => (
                                <PostSkeleton key={i} />
                              ))}
                            </div>
                          ) : (
                            "Sign in to see posts"
                          )}
                        </div>
                      )
                    ) : isLoadingFollowing ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <PostSkeleton key={i} />
                        ))}
                      </div>
                    ) : followingPosts.length > 0 ? (
                      followingPosts.map((post) => (
                        <SnapCard
                          key={post.id}
                          post={post}
                          liked={liked.has(parseInt(post.id))}
                          bookmarked={bookmarked.has(parseInt(post.id))}
                          retweeted={retweeted.has(parseInt(post.id))}
                          onLike={(id) =>
                            setLiked(
                              toggleSet(
                                liked,
                                typeof id === "string" ? parseInt(id) : id
                              )
                            )
                          }
                          onBookmark={(id) =>
                            setBookmarked(
                              toggleSet(
                                bookmarked,
                                typeof id === "string" ? parseInt(id) : id
                              )
                            )
                          }
                          onRetweet={(id) =>
                            setRetweeted(
                              toggleSet(
                                retweeted,
                                typeof id === "string" ? parseInt(id) : id
                              )
                            )
                          }
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {status === "authenticated"
                          ? "No posts from people you follow yet. Try following some users!"
                          : "Sign in to see posts"}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        </div>
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  // Don't render main content if session is not authenticated or dbUser is not loaded
  if (status === "unauthenticated" || !session?.dbUser) {
    console.log("🔍 Session state:", {
      status,
      hasSession: !!session,
      hasDbUser: !!session?.dbUser,
    });
    return (
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex-col md:flex-row lg:ml-52 text-white flex">
         <div className=" lg:block">
           <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onNavigateToOpinio={handleNavigateToOpinio}
            onNavigateToSnaps={handleNavigateToSnaps}
          />
         </div>
          <div className="flex-1 ml-0 md:ml-4 mr-2 md:mr-6 rounded-md px-2 mt-20 md:mt-0">
            <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="flex flex-col lg:flex-row min-h-[400px] sm:min-h-[550px]">
                {/* Left Side - Hero Image */}
                <div
                  className="lg:w-full relative px-4 py-2 text-white 
                shadow-[inset_0px_1px_0.5px_rgba(255,255,255,0.5),0px_1px_2px_rgba(26,19,161,0.5),0px_0px_0px_1px_#4F47EB] 
                bg-gradient-to-r from-[#4F47EB] to-[#3B32C7] rounded-lg m-2"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 rounded-lg" />

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20 rounded-lg">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                  </div>

                  {/* Content on Image */}
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
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex text-white mx-auto">
        {/* Left Sidebar - Fixed width on desktop, hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onNavigateToOpinio={handleNavigateToOpinio}
            onNavigateToSnaps={handleNavigateToSnaps}
          />
        </div>

        {/* Mobile Sidebar - Only visible on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onNavigateToOpinio={handleNavigateToOpinio}
            onNavigateToSnaps={handleNavigateToSnaps}
          />
        </div>

        {/* Main Content - Flexible center with mobile padding */}
        <div className="flex-1 pt-20 md:pt-0 px-2 sm:px-4 pb-20 lg:pb-4">
          <div className="">{renderContent()}</div>
        </div>

        {/* Right Sidebar - Only visible at 2xl breakpoint */}
        {currentPage !== "messages" && currentPage !== "share" && session?.dbUser && (
          <div
            className="hidden md:block lg:block xl:block 2xl:block w-80 h-screen sticky top-0"
            style={{ zIndex: 999 }}
          >
            <div className="p-6">
              {/* Recent Activity */}
              <div className="h-80 overflow-hidden flex flex-col justify-center items-start border-2 border-gray-700/70 rounded-2xl mb-4">
                <span className="bg-dark-700 rounded-full px-2 mt-2 mx-2">
                  Recent Activity
                </span>
                <UserActivityFeed userId={session.dbUser.id} />
              </div>

              {/* Followers Suggestions */}
              <div className="h-80 flex flex-col justify-start items-start border-2 border-gray-700/70 rounded-2xl mb-4">
                <span className="bg-dark-700 rounded-full px-2 mt-2 mx-2">
                  Followers Suggestions
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SocialFeedPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="w-12 h-12" />}>
      <SocialFeedPageContent />
    </Suspense>
  );
}