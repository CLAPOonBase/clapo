/**
 * Contract configuration for deployed contracts on Base Sepolia
 * This file contains the verified contract addresses to avoid RPC calls for validation
 */

export interface ContractConfig {
  address: string;
  isDeployed: boolean;
  network: string;
  lastVerified: string;
}

export const CONTRACT_CONFIG: { [key: string]: ContractConfig } = {
  // MockUSDC (deployed on Base Sepolia)
  MOCK_USDC: {
    address: "0xCADCa295a223E3DA821a243520df8e2a302C9840",
    isDeployed: true,
    network: "base_sepolia",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // RewardPool (deployed on Base Sepolia)
  REWARD_POOL: {
    address: "0x07056D9a61A7894BD2c8494EDB0a78451F1fA7c8",
    isDeployed: true,
    network: "base_sepolia",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // CreatorToken (deployed on Base Sepolia)
  CREATOR_TOKEN: {
    address: "0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb",
    isDeployed: true,
    network: "base_sepolia",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // PostToken (deployed on Base Sepolia)
  POST_TOKEN: {
    address: "0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61",
    isDeployed: true,
    network: "base_sepolia",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // OpinioMarket (deployed on Base Sepolia)
  OPINIO_MARKET: {
    address: "0xF9A911bD8f2e2beCC18781ed467653bb2F515de5",
    isDeployed: true,
    network: "base_sepolia",
    lastVerified: "2024-01-15T10:00:00Z"
  }
};

/**
 * Get contract configuration by key
 * @param key - Contract key (e.g., 'MOCK_USDC', 'REWARD_POOL')
 * @returns Contract configuration or undefined if not found
 */
export function getContractConfig(key: string): ContractConfig | undefined {
  return CONTRACT_CONFIG[key];
}

/**
 * Get contract address by key
 * @param key - Contract key (e.g., 'MOCK_USDC', 'REWARD_POOL')
 * @returns Contract address or undefined if not found
 */
export function getContractAddress(key: string): string | undefined {
  return CONTRACT_CONFIG[key]?.address;
}

/**
 * Check if contract is deployed (without RPC call)
 * @param key - Contract key (e.g., 'MOCK_USDC', 'REWARD_POOL')
 * @returns true if contract is marked as deployed, false otherwise
 */
export function isContractDeployed(key: string): boolean {
  return CONTRACT_CONFIG[key]?.isDeployed ?? false;
}

/**
 * Get all deployed contract addresses
 * @returns Array of deployed contract addresses
 */
export function getDeployedContractAddresses(): string[] {
  return Object.values(CONTRACT_CONFIG)
    .filter(config => config.isDeployed)
    .map(config => config.address);
}

/**
 * Validate contract configuration
 * @param key - Contract key to validate
 * @returns true if configuration is valid, false otherwise
 */
export function validateContractConfig(key: string): boolean {
  const config = CONTRACT_CONFIG[key];
  if (!config) return false;
  
  // Check if address is valid (starts with 0x and has correct length)
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(config.address);
  
  return isValidAddress && config.isDeployed && config.network === "base_sepolia";
}

/**
 * Get contract info for display purposes
 * @param key - Contract key
 * @returns Formatted contract information
 */
export function getContractInfo(key: string): string {
  const config = CONTRACT_CONFIG[key];
  if (!config) return `Contract ${key} not found`;
  
  return `${key}: ${config.address} (${config.network}) - ${config.isDeployed ? 'Deployed' : 'Not Deployed'}`;
}


