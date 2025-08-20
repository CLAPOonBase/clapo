import { useWalletContext } from "@/context/WalletContext";
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
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ symbol: string; name: string }>({
    symbol: "",
    name: "",
  });

  // Your specific token address
  const TOKEN_ADDRESS = "0x4fCF1784B31630811181f670Aea7A7bEF803eaED";

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const fetchBalances = async () => {
    if (!address) return;

    try {
      setIsLoadingBalance(true);

      // Fetch both token and ETH balances
      const [tokenData, ethBal] = await Promise.all([
        getTokenBalance(TOKEN_ADDRESS),
        getETHBalance(),
      ]);

      setTokenBalance(parseFloat(tokenData.formatted).toFixed(4));
      setEthBalance(parseFloat(ethBal).toFixed(4));
      setTokenInfo({ symbol: tokenData.symbol, name: tokenData.name });
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setTokenBalance("Error");
      setEthBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balances when wallet connects
  useEffect(() => {
    if (address) {
      fetchBalances();
    } else {
      // Reset balances when disconnected
      setTokenBalance("0");
      setEthBalance("0");
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

  const handleRefreshBalance = () => {
    if (address) {
      fetchBalances();
    }
  };

  return (
    <div>
      <div className="w-full rounded-md md:flex md:space-x-4 space-y-4 md:space-y-0 justify-between">
        <div className="bg-black p-4 rounded-md w-full flex flex-col text-left">
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
          <span className="text-secondary">
            Welcome back! Here&apos;s what&apos;s trending in the markets.
          </span>
          <div className="flex items-center space-x-2 mt-3">
            <button
            
              onClick={handleWalletAction}
              disabled={isConnecting}
              className={`flex className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] min-w-[105px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] px-3 py-1.5 text-xs rounded-full leading-[24px] font-bold w-full sm:w-auto whitespace-nowrap" ${
                address
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
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
                className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
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

        <div className="bg-black p-4 rounded-md w-full flex justify-between items-center">
          <div className="flex flex-col items-start text-secondary w-full">
            <span>Balances</span>

            {address ? (
              <div className="w-full space-y-2 mt-2">
                {/* ETH Balance */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">ETH:</span>
                  <span className="text-lg text-white">
                    {isLoadingBalance ? "Loading..." : `${ethBalance} ETH`}
                  </span>
                </div>

                {/* Token Balance */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {tokenInfo.symbol || "Token"}:
                  </span>
                  <span className="text-lg text-white">
                    {isLoadingBalance
                      ? "Loading..."
                      : `${tokenBalance} ${tokenInfo.symbol}`}
                  </span>
                </div>

                <span className="text-xs text-green-400 mt-1">
                  Wallet Connected ✓
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
