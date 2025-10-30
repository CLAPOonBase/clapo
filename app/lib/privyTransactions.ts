import { ethers } from 'ethers';

/**
 * Prepare transaction parameters for Privy wallet
 * Privy embedded wallets require specific parameter formatting
 */
export async function preparePrivyTransaction(
  contract: ethers.Contract,
  method: string,
  args: any[],
  overrides: any = {}
) {
  try {
    console.log(`🔧 Preparing Privy transaction for ${method}`, {
      contractAddress: await contract.getAddress(),
      method,
      args,
      overrides
    });

    // Estimate gas to ensure transaction will succeed
    let gasEstimate;
    try {
      gasEstimate = await contract[method].estimateGas(...args, overrides);
      console.log(`⛽ Gas estimate for ${method}:`, gasEstimate.toString());
    } catch (gasError: any) {
      console.error(`❌ Gas estimation failed for ${method}:`, gasError);

      // Try to parse the error for better user feedback
      if (gasError.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas fees. Please add ETH to your wallet.');
      } else if (gasError.reason) {
        throw new Error(`Transaction will fail: ${gasError.reason}`);
      } else if (gasError.message) {
        throw new Error(`Transaction will fail: ${gasError.message}`);
      } else {
        throw new Error('Transaction validation failed. Please check your inputs.');
      }
    }

    // Add gas buffer (20% extra to be safe)
    const gasLimit = gasEstimate * 120n / 100n;

    // Prepare transaction with explicit gas settings
    const txOverrides = {
      ...overrides,
      gasLimit: gasLimit,
    };

    console.log(`✅ Transaction prepared for ${method}`, {
      gasLimit: gasLimit.toString(),
      overrides: txOverrides
    });

    return txOverrides;
  } catch (error) {
    console.error(`❌ Failed to prepare transaction for ${method}:`, error);
    throw error;
  }
}

/**
 * Execute a contract transaction through Privy wallet
 */
export async function executePrivyTransaction(
  contract: ethers.Contract,
  method: string,
  args: any[],
  overrides: any = {}
) {
  try {
    const txOverrides = await preparePrivyTransaction(contract, method, args, overrides);

    console.log(`📤 Sending transaction: ${method}`);
    const tx = await contract[method](...args, txOverrides);

    console.log(`✅ Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    const receipt = await tx.wait();

    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    return { tx, receipt };
  } catch (error: any) {
    console.error(`❌ Transaction failed for ${method}:`, error);

    // Enhanced error messaging
    if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user');
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas fees');
    } else if (error.reason) {
      throw new Error(`Transaction failed: ${error.reason}`);
    } else if (error.message) {
      throw new Error(`Transaction failed: ${error.message}`);
    } else {
      throw new Error('Transaction failed. Please try again.');
    }
  }
}

/**
 * Check if wallet is on correct network (Base Sepolia)
 */
export async function ensureCorrectNetwork(provider: ethers.Provider): Promise<void> {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    console.log(`🌐 Current network:`, { chainId, name: network.name });

    if (chainId !== 84532) {
      throw new Error(`Wrong network. Please switch to Base Sepolia (Chain ID: 84532). Current: ${chainId}`);
    }

    console.log(`✅ Connected to Base Sepolia`);
  } catch (error) {
    console.error('❌ Network check failed:', error);
    throw error;
  }
}
