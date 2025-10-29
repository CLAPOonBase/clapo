import { useWalletContext } from "@/context/WalletContext";
import { useOpinioContext } from "@/app/Context/OpinioContext";
import React, { useState, useEffect } from "react";
import { Wallet, WalletCards, RefreshCw } from "lucide-react";

const UserDetails = () => {
  const {
    connect,
    disconnect,
    address,
    isConnecting,
    getTokenBalance,
    getETHBalance,
  } = useWalletContext();
  
  const { usdcStatus, refreshData } = useOpinioContext();
  
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ symbol: string; name: string }>({
    symbol: "",
    name: "",
  });

  // Your Mock USDC token address
  const MOCK_USDC_TOKEN_ADDRESS = "0xCADCa295a223E3DA821a243520df8e2a302C9840";

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const fetchBalances = async () => {
    if (!address) return;

    try {
      setIsLoadingBalance(true);

      // Fetch Mock USDC token balance
      const tokenData = await getTokenBalance(MOCK_USDC_TOKEN_ADDRESS);
      setTokenBalance(parseFloat(tokenData.formatted).toFixed(4));
      setTokenInfo({ symbol: tokenData.symbol, name: tokenData.name });
      
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setTokenBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Update USDC balance when usdcStatus changes
  useEffect(() => {
    if (usdcStatus) {
      try {
        const balance = parseFloat(usdcStatus.balance.toString()) / Math.pow(10, Number(usdcStatus.decimals));
        setUsdcBalance(balance.toFixed(4));
      } catch (error) {
        console.error("Failed to format USDC balance:", error);
        setUsdcBalance("Error");
      }
    } else {
      setUsdcBalance("0");
    }
  }, [usdcStatus]);

  // Fetch balances when wallet connects
  useEffect(() => {
    if (address) {
      fetchBalances();
    } else {
      // Reset balances when disconnected
      setTokenBalance("0");
      setUsdcBalance("0");
      setTokenInfo({ symbol: "", name: "" });
    }
  }, [address]);

  const handleWalletAction = () => {
    if (address) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleRefreshBalance = async () => {
    if (address) {
      fetchBalances();
      // Also refresh USDC data from Opinio contract
      if (refreshData) {
        await refreshData();
      }
    }
  };

  return (
    <div>
      <div className="w-full rounded-md md:flex md:space-x-4 space-y-4 md:space-y-0 justify-between">
        <div className="bg-[#1A1A1A] p-4 rounded-md w-full flex flex-col text-left border border-[#2A2A2A] shadow-custom">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl text-secondary">
              Hey, {address ? formatAddress(address) : "Guest"}
            </span>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  address ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs ${
                  address ? "text-green-400" : "text-red-400"
                }`}
              >
                {address ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <span className="text-gray-400">
            Welcome back! Here&apos;s what&apos;s trending in the markets.
          </span>
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={handleWalletAction}
              disabled={isConnecting}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                address
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#6E54FF] hover:bg-[#836EF9] text-white"
              } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Wallet size={16} />
              <span>
                {isConnecting
                  ? "Connecting..."
                  : address
                  ? "Disconnect Wallet"
                  : "Connect Wallet"}
              </span>
            </button>

            {address && (
              <button
                onClick={handleRefreshBalance}
                disabled={isLoadingBalance}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm bg-gray-600 hover:bg-black text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isLoadingBalance ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-4 rounded-md w-full flex justify-between items-center border border-[#2A2A2A] shadow-custom">
          <div className="flex flex-col items-start text-gray-400 w-full">
            <span>Balances</span>

            {address ? (
              <div className="w-full space-y-2 mt-2">
                {/* Mock USDC Balance */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {tokenInfo.symbol || "Mock USDC"}:
                  </span>
                  <span className="text-lg text-white">
                    {isLoadingBalance
                      ? "Loading..."
                      : `${tokenBalance} ${tokenInfo.symbol || "USDC"}`}
                  </span>
                </div>

                <span className="text-xs text-green-400 mt-1">
                  Wallet Connected ✓
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Token: {MOCK_USDC_TOKEN_ADDRESS.slice(0, 6)}...{MOCK_USDC_TOKEN_ADDRESS.slice(-4)}
                </span>
              </div>
            ) : (
              <div className="text-center w-full">
                <span className="text-2xl text-white">Connect Wallet</span>
                <div className="text-xs text-gray-400 mt-1">
                  Connect your wallet to view balances
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
