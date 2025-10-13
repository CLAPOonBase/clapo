/**
 * Contract configuration for deployed contracts on Monad testnet
 * This file contains the verified contract addresses to avoid RPC calls for validation
 */

export interface ContractConfig {
  address: string;
  isDeployed: boolean;
  network: string;
  lastVerified: string;
}

export const CONTRACT_CONFIG: { [key: string]: ContractConfig } = {
  // MockUSDC (existing contract)
  MOCK_USDC: {
    address: "0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148",
    isDeployed: true,
    network: "monad_testnet",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // RewardPool (newly deployed)
  REWARD_POOL: {
    address: "0xF942be9969AE075594372c8e3f002Fa05b40D186",
    isDeployed: true,
    network: "monad_testnet",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // CreatorToken (newly deployed)
  CREATOR_TOKEN: {
    address: "0xCe2415A6790756CCBd1890466F8f83767193A23C",
    isDeployed: true,
    network: "monad_testnet",
    lastVerified: "2024-01-15T10:00:00Z"
  },

  // PostToken (newly deployed)
  POST_TOKEN: {
    address: "0xdb61267b2b233A47bf56F551528CCB93f9788C6a",
    isDeployed: true,
    network: "monad_testnet",
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
  
  return isValidAddress && config.isDeployed && config.network === "monad_testnet";
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


