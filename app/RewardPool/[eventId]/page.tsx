"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import { Trophy } from 'lucide-react';

const Dashboard = () => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const barData = {
    labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30'],
    datasets: [{
      label: 'Mindshare',
      data: [3, 5, 2, 7, 6, 8, 4],
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      barThickness: 40,
    }]
  };

  const pieData = {
    labels: ['English', 'Hindi', 'Spanish', 'Marathi'],
    datasets: [{
      data: [40, 35, 25, 40],
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
      borderWidth: 0,
    }]
  };

  useEffect(() => {
    // Register Chart.js components
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.BarElement,
      Chart.BarController,
      Chart.ArcElement,
      Chart.DoughnutController,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );

    // Create bar chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      barChartInstance.current = new Chart.Chart(ctx, {
        type: 'bar',
        data: barData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#9CA3AF',
                font: {
                  size: 12
                }
              },
              border: {
                display: false
              }
            },
            y: {
              display: false
            }
          }
        }
      });
    }

    // Create pie chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      pieChartInstance.current = new Chart.Chart(ctx, {
        type: 'doughnut',
        data: pieData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          cutout: '60%'
        }
      });
    }

    // Cleanup function
    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, []);

  const leaderboardData = [
    {
      rank: 1,
      name: 'DeFi Trading Competition',
      username: '@ethereum_trader',
      totalMindshare: '17.4K',
      clapoMindshare: '10.2K',
      clapoChange: '+2.3%',
      seiMindshare: '6.2K',
      seiChange: '-1.2%',
      avatar: '🚀',
      bg: 'bg-[#1F2937] border-l-4 border-green-500'
    },
    {
      rank: 2,
      name: 'NFT Art Contest',
      username: '@creative_artist',
      totalMindshare: '12.1K',
      clapoMindshare: '7.5K',
      clapoChange: '-0.8%',
      seiMindshare: '4.6K',
      seiChange: '+1.4%',
      avatar: '🎨',
      bg: 'bg-[#10151A]'
    },
    {
      rank: 3,
      name: 'Gaming Tournament',
      username: '@esports_champion',
      totalMindshare: '9.8K',
      clapoMindshare: '5.2K',
      clapoChange: '+1.2%',
      seiMindshare: '4.6K',
      seiChange: '+0.8%',
      avatar: '🎮',
      bg: 'bg-[#111820]'
    },
    {
      rank: 4,
      name: 'Yield Farming Quest',
      username: '@defi_optimizer',
      totalMindshare: '8.5K',
      clapoMindshare: '4.8K',
      clapoChange: '-0.5%',
      seiMindshare: '3.7K',
      seiChange: '+2.1%',
      avatar: '⚡',
      bg: 'bg-[#10151A]'
    },
    {
      rank: 5,
      name: 'Metaverse Explorer',
      username: '@virtual_adventurer',
      totalMindshare: '7.2K',
      clapoMindshare: '4.1K',
      clapoChange: '+0.9%',
      seiMindshare: '3.1K',
      seiChange: '-0.6%',
      avatar: '🌐',
      bg: 'bg-[#111820]'
    },
    {
      rank: 6,
      name: 'DAO Governance Vote',
      username: '@community_voter',
      totalMindshare: '6.8K',
      clapoMindshare: '3.9K',
      clapoChange: '+1.5%',
      seiMindshare: '2.9K',
      seiChange: '+0.3%',
      avatar: '🗳️',
      bg: 'bg-[#10151A]'
    },
    {
      rank: 7,
      name: 'AI Art Generation',
      username: '@ai_creator',
      totalMindshare: '6.1K',
      clapoMindshare: '3.5K',
      clapoChange: '-1.1%',
      seiMindshare: '2.6K',
      seiChange: '+1.8%',
      avatar: '🤖',
      bg: 'bg-[#111820]'
    },
    {
      rank: 8,
      name: 'DeFi Trading Competition',
      username: '@trading_pro',
      totalMindshare: '5.9K',
      clapoMindshare: '3.4K',
      clapoChange: '+0.4%',
      seiMindshare: '2.5K',
      seiChange: '-0.9%',
      avatar: '🚀',
      bg: 'bg-[#10151A]'
    },
    {
      rank: 9,
      name: 'NFT Art Contest',
      username: '@digital_artist',
      totalMindshare: '5.3K',
      clapoMindshare: '3.1K',
      clapoChange: '+2.1%',
      seiMindshare: '2.2K',
      seiChange: '+1.2%',
      avatar: '🎨',
      bg: 'bg-[#111820]'
    },
    {
      rank: 10,
      name: 'Gaming Tournament',
      username: '@pro_gamer',
      totalMindshare: '4.7K',
      clapoMindshare: '2.8K',
      clapoChange: '-0.7%',
      seiMindshare: '1.9K',
      seiChange: '+0.5%',
      avatar: '🎮',
      bg: 'bg-[#10151A]'
    }
  ];

  // Define the Event type to include 'status' and other used properties
  type Event = {
    status: string;
    logo: string;
    title: string;
    description: string;
    date: string;
  };
  
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  
  // Dummy fetchEvents function for demonstration; replace with actual API call as needed
  const fetchEvents = async (): Promise<Event[]> => {
    // Example data; replace with real fetch logic
    return [
      {
        status: "live",
        logo: "🔥",
        title: "Live Event",
        description: "This is a live event.",
        date: "2024-06-01",
      },
      {
        status: "upcoming",
        logo: "🌟",
        title: "Upcoming Event",
        description: "This is an upcoming event.",
        date: "2024-07-01",
      },
    ];
  };

  // Fetch events
  useEffect(() => {
    fetchEvents().then((events) => {
      const liveEvent = events.find((e) => e.status === "live");
      setActiveEvent(liveEvent || events[0]);
    });
  }, []);


  // Init charts
  useEffect(() => {
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.BarElement,
      Chart.BarController,
      Chart.ArcElement,
      Chart.DoughnutController,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );

    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d");
      if (barChartInstance.current) barChartInstance.current.destroy();
      barChartInstance.current = new Chart.Chart(ctx!, {
        type: "bar",
        data: barData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    }

    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      pieChartInstance.current = new Chart.Chart(ctx!, {
        type: "doughnut",
        data: pieData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: "60%",
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, []);
  return (
    <div className="min-h-screen text-white">
      {/* Header */}
 <div className="p-4 sm:p-6">
        {activeEvent ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">{activeEvent.logo}</span>
                </div>
                <span className="text-red-500 bg-dark-800 rounded-md px-2 font-bold text-xs">
                  {activeEvent.status}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{activeEvent.title}</h1>
                <p className="text-sm text-gray-400">{activeEvent.description}</p>
                <p className="text-sm text-gray-400">Date: {activeEvent.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 bg-dark-800 shadow-custom rounded-lg px-3 py-1">
              <span className="flex">
                <Trophy className="mr-2" /> Reward: Coming Soon
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Loading event...</p>
        )}
      </div>


      <div className="p-4 sm:p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 mb-8 p-6 rounded-2xl shadow-custom bg-dark-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Mindshare • 4.20%</h2>
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">₿</span>
              </div>
            </div>
            <div className="h-64">
              <canvas ref={barChartRef} className="w-full h-full"></canvas>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-6">Content Distribution</h2>
            <div className="shadow-custom rounded-lg p-6">
              <div className="flex items-center justify-center h-64">
                <canvas ref={pieChartRef} className="w-full h-full"></canvas>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {pieData.labels.map((item, index) => (
                  <div key={item} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }}
                    ></div>
                    <span className="text-sm text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About Campaign */}
        <div className='font-bold text-xl mb-6'>About Campaign</div>
        <div className="shadow-custom flex justify-between bg-dark-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col items-center space-y-4 mb-4 w-[20%]">
            <div className='mr-4'>
              <div className='flex justify-start space-x-2 items-center'>
                <h2 className="text-lg font-semibold">Set Leaderboard</h2>
                <span className="text-red-500 bg-dark-800 rounded-md px-2 font-bold text-xs">Live</span>
              </div>
              <p className="text-sm text-gray-400">Get Leaderboard Rewards and Build Your Identity</p>
              <p className="text-sm text-gray-400">Share your content across social media platforms to increase your Mindshare.</p>
            </div>
            <img src="/trophy-star.png" alt="User avatar" className="w-32 h-32 rounded-full" />
          </div>
          
          <div className='w-[80%] shadow-custom rounded-2xl p-6 bg-dark-700'>
            <div className="rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 text-yellow-500">Campaign Rule</h3>
              <ul className="space-y-2 list-decimal text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500">•</span>
                  <span>If you shared tweet/telegram/discord post and X Ai percent on clapo.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500">•</span>
                  <span>Total mindshare towards the projects campaign will enhance the listing in Leaderboard.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500">•</span>
                  <span>Sharing across multiple platforms helps amplify your score.</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-yellow-500">🏆 Rewards: Coming Soon</span>
              </div>
              <div className="text-sm text-gray-400">
                1.5K Days • 46.6K Users
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-full bg-[#10151A] rounded-xl shadow-lg border border-[#23272B] max-h-[500px] overflow-hidden relative">
          <div className="sticky top-0 z-20 bg-[#10151A] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 pr-4 sm:pr-6 pl-2 py-3 border-b border-[#23272B]">
            <input
              className="bg-transparent text-[#A0A0A0] text-xs px-2 border border-[#23272b] p-2 rounded-md outline-none flex-1 min-w-0"
              placeholder="SEARCH USERNAME"
            />
            <span className="text-[10px] text-[#A0A0A0] text-center sm:text-right sm:ml-2 whitespace-nowrap">
              LEADERBOARD UPDATED EVERY HOUR
            </span>
          </div>

          <div className="overflow-y-auto max-h-[calc(500px-80px)] scrollbar-hide">
            <div className="overflow-x-auto sm:overflow-x-visible scrollbar-hide">
              <table className="text-xs text-left w-full sm:min-w-full" style={{ minWidth: '800px' }}>
                <thead className="bg-[#10151A]">
                  <tr className="text-[#A0A0A0] border-b border-[#23272B]">
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[60px] sm:min-w-0">RANK</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[140px] sm:min-w-0">USER</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">TOTAL MINDSHARE</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">CLAPO MINDSHARE</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">CLAPO 24H CHANGE</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">SEI MINDSHARE</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">SEI 24H CHANGE</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, i) => (
                    <tr key={i} className={user.bg}>
                      <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">{user.rank}</td>
                      <td className="py-2 px-2 sm:px-4">
                        <div className="flex items-start gap-1 sm:gap-2">
                          <div className="relative w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px]">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center text-xs sm:text-base">
                              {user.avatar}
                            </div>
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{user.name}</span>
                            <span className="text-[8px] sm:text-[10px] text-[#A0A0A0] truncate max-w-[80px] sm:max-w-none">{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{user.totalMindshare}</td>
                      <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{user.clapoMindshare}</td>
                      <td className={`py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${
                        user.clapoChange.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>{user.clapoChange}</td>
                      <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{user.seiMindshare}</td>
                      <td className={`py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${
                        user.seiChange.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>{user.seiChange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">Showing 1-10 of 46,600+ entries</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;