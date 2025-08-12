// Smart Contract Configuration
export const CONTRACT_CONFIG = {
  // Contract addresses
  CONTRACT_ADDRESS: "0xb2B2f164Fb38a861eA80C6B2df4F645a7d4cF85a",
  USDC_CONTRACT_ADDRESS: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  
  // Network configuration
  DEFAULT_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
  
  // Default values
  DEFAULT_USDC_AMOUNT: 10, // Default USDC amount for buying shares
  MAX_USDC_APPROVAL: 1000, // Maximum USDC approval amount
  
  // Gas settings
  GAS_LIMIT: 500000,
  GAS_PRICE: "auto",
} as const;

// Environment variables that need to be set
export const REQUIRED_ENV_VARS = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  PRIVATE_KEY: process.env.PRIVATE_KEY, // This should be server-side only
} as const;

// Check if required environment variables are set
export const validateEnvironment = (): boolean => {
  const missingVars = Object.entries(REQUIRED_ENV_VARS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

// Get configuration for client-side usage
export const getClientConfig = () => ({
  rpcUrl: CONTRACT_CONFIG.DEFAULT_RPC_URL,
  contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
  usdcContractAddress: CONTRACT_CONFIG.USDC_CONTRACT_ADDRESS,
  defaultUsdcAmount: CONTRACT_CONFIG.DEFAULT_USDC_AMOUNT,
  maxUsdcApproval: CONTRACT_CONFIG.MAX_USDC_APPROVAL,
});

// Get configuration for server-side usage
export const getServerConfig = () => ({
  ...getClientConfig(),
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL || CONTRACT_CONFIG.DEFAULT_RPC_URL,
});
