// Frontend Connection Verification Script
// Run this in the browser console to verify frontend connection

console.log("🔍 Verifying Frontend Connection to Monad Testnet...");

// Check if MetaMask is connected
if (typeof window.ethereum === 'undefined') {
    console.log("❌ MetaMask not detected");
} else {
    console.log("✅ MetaMask detected");
}

// Check current network
async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log("Current chain ID:", chainId);
        
        if (chainId === '0x2797') { // 10143 in hex
            console.log("✅ Connected to Monad Testnet");
        } else {
            console.log("❌ Not connected to Monad Testnet");
            console.log("Expected chain ID: 0x2797 (10143)");
            console.log("Current chain ID:", chainId);
        }
    } catch (error) {
        console.log("❌ Failed to get chain ID:", error);
    }
}

// Check current account
async function checkAccount() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log("✅ Connected account:", accounts[0]);
        } else {
            console.log("❌ No account connected");
        }
    } catch (error) {
        console.log("❌ Failed to get accounts:", error);
    }
}

// Check contract connection
async function checkContract() {
    try {
        // Import ethers (assuming it's available)
        if (typeof ethers === 'undefined') {
            console.log("❌ Ethers.js not available");
            return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Contract address from frontend
        const CONTRACT_ADDRESS = "0xAb6E048829A7c7Cc9b9C5f31cb445237F2b2dC7e";
        
        // Basic contract ABI for testing
        const contractABI = [
            "function owner() external view returns (address)",
            "function paused() external view returns (bool)",
            "function doesUuidExist(string memory uuid) external view returns (bool)",
            "function getAllPosts() external view returns (tuple(uint256 postId, string uuid, string content, string imageUrl, address creator, uint256 createdAt, bool exists)[] memory)"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        
        // Test contract connection
        const owner = await contract.owner();
        console.log("✅ Contract owner:", owner);
        
        const isPaused = await contract.paused();
        console.log("✅ Contract paused:", isPaused);
        
        // Check for the specific post
        const postId = "426cdfa2-ed23-44f7-a561-c6053a6be6c3";
        const uuid = `post-${postId}`;
        
        const exists = await contract.doesUuidExist(uuid);
        console.log(`✅ Post ${postId} exists:`, exists);
        
        if (exists) {
            console.log("🎉 Frontend can access the token!");
        } else {
            console.log("❌ Frontend cannot access the token");
        }
        
        // Get all posts
        const allPosts = await contract.getAllPosts();
        console.log(`✅ Total posts in contract: ${allPosts.length}`);
        
        if (allPosts.length > 0) {
            console.log("Posts found:");
            allPosts.forEach((post, index) => {
                console.log(`  Post ${index + 1}:`, {
                    postId: post.postId.toString(),
                    uuid: post.uuid,
                    content: post.content.substring(0, 30) + "...",
                    creator: post.creator
                });
            });
        }
        
    } catch (error) {
        console.log("❌ Contract connection failed:", error);
    }
}

// Run all checks
async function runAllChecks() {
    console.log("\n=== Network Check ===");
    await checkNetwork();
    
    console.log("\n=== Account Check ===");
    await checkAccount();
    
    console.log("\n=== Contract Check ===");
    await checkContract();
    
    console.log("\n🎉 Frontend verification completed!");
}

// Run the verification
runAllChecks();
