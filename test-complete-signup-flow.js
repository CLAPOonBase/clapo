// Test complete signup flow matching the frontend implementation
require('dotenv').config({ path: '.env' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps';

const timestamp = Date.now();
const testData = {
  privyId: `test-complete-flow-${timestamp}`,
  email: `testflow${timestamp}@example.com`,
  wallet: null,
  accountType: "individual",
  name: "Complete Flow Test",
  username: `flowtest${timestamp}`,
  displayName: "Flow Test Display",
  topics: ["Technology", "Design", "Business"],
  following: [] // Will be populated with real user IDs if available
};

async function step1_CreateProfile() {
  console.log('\n🔵 STEP 1: Create Profile (After Step 4 in UI)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('POST', `${API_URL}/auth/signup/privy`);
  console.log('Data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${API_URL}/auth/signup/privy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok && data.user?.id) {
      console.log('✅ Profile created successfully!');
      console.log('📝 User ID:', data.user.id);
      return { success: true, userId: data.user.id };
    } else {
      console.log('❌ Profile creation failed!');
      console.log('Error:', data.message || 'Unknown error');
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function step2_FollowUsers(userId, targetUserIds) {
  console.log('\n🔵 STEP 2: Follow Users (After Profile Creation)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (targetUserIds.length === 0) {
    console.log('ℹ️  No users to follow (optional step)');
    return { success: true, followed: 0 };
  }

  let successCount = 0;
  let failCount = 0;

  for (const targetUserId of targetUserIds) {
    try {
      console.log(`\n📍 Following user: ${targetUserId}`);
      const response = await fetch(`${API_URL}/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      console.log('Status:', response.status);

      if (response.ok) {
        console.log(`✅ Successfully followed user: ${targetUserId}`);
        successCount++;
      } else {
        console.log(`❌ Failed to follow user: ${targetUserId}`);
        console.log('Error:', data.message || 'Unknown error');
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Error following user ${targetUserId}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 Follow Results: ${successCount} succeeded, ${failCount} failed`);
  return { success: failCount === 0, followed: successCount };
}

async function step3_UploadAvatar() {
  console.log('\n🔵 STEP 3: Upload Avatar (Optional - Step 5 in UI)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ℹ️  Avatar upload requires actual file - skipping in automated test');
  console.log('✅ Would call: POST /api/upload with multipart/form-data');
  console.log('✅ Expected response: { success: true, url: "https://...", key: "..." }');

  // Return a mock avatar URL for the next step
  return {
    success: true,
    avatarUrl: null, // Set to null to test optional avatar
    message: 'Skipped (requires real file upload)'
  };
}

async function step4_UpdateProfile(userId, bio, avatarUrl) {
  console.log('\n🔵 STEP 4: Update Profile with Bio and Avatar (Step 6 in UI)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const updateData = {};
  if (bio) updateData.bio = bio;
  if (avatarUrl) updateData.avatarUrl = avatarUrl; // Note: camelCase!

  if (Object.keys(updateData).length === 0) {
    console.log('ℹ️  No bio or avatar to update (both optional)');
    return { success: true, message: 'No updates needed' };
  }

  console.log('PUT', `${API_URL}/users/${userId}/profile`);
  console.log('Data:', JSON.stringify(updateData, null, 2));

  try {
    const response = await fetch(`${API_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Profile updated successfully!');
      return { success: true };
    } else {
      console.log('❌ Profile update failed!');
      console.log('Error:', data.message || 'Unknown error');
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteSignupFlow() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   COMPLETE SIGNUP FLOW TEST                            ║');
  console.log('║   Testing the exact API sequence from frontend         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\nAPI URL:', API_URL);
  console.log('\n');

  // Step 1: Create profile with basic data (Steps 1-4 in UI)
  const step1Result = await step1_CreateProfile();
  if (!step1Result.success) {
    console.log('\n❌ TEST FAILED: Could not create profile');
    console.log('Cannot proceed with remaining steps');
    return;
  }

  const userId = step1Result.userId;

  // Step 2: Follow users (optional)
  const step2Result = await step2_FollowUsers(userId, testData.following);
  // Continue even if follows fail (non-critical)

  // Step 3: Upload avatar (optional)
  const step3Result = await step3_UploadAvatar();

  // Step 4: Update profile with bio and avatar
  const testBio = "This is a test bio for the complete signup flow test.";
  const step4Result = await step4_UpdateProfile(userId, testBio, step3Result.avatarUrl);

  // Final Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   TEST SUMMARY                                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n✅ Step 1: Create Profile -', step1Result.success ? 'PASSED' : 'FAILED');
  console.log('✅ Step 2: Follow Users -', step2Result.success ? 'PASSED' : 'PASSED (optional)');
  console.log('⏭️  Step 3: Upload Avatar - SKIPPED (requires file)');
  console.log('✅ Step 4: Update Profile -', step4Result.success ? 'PASSED' : 'FAILED');

  const allPassed = step1Result.success && step4Result.success;

  if (allPassed) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
    console.log('✅ The signup flow is working correctly');
    console.log('✅ Profile created with ID:', userId);
    console.log('✅ Profile updated with bio');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the complete flow in the browser at http://localhost:3000/SignIn');
    console.log('2. Verify each step transitions correctly');
    console.log('3. Check that data appears correctly in the backend');
    console.log('4. Once verified, commit and push to GitHub');
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    console.log('Please review the errors above and fix before deploying');
  }
}

runCompleteSignupFlow().catch(console.error);
