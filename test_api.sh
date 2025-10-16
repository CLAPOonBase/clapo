#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001/api/snaps"

echo "======================================"
echo "Testing Clapo Privy API Integration"
echo "======================================"
echo ""

# Test 1: Check username availability (available)
echo -e "${YELLOW}Test 1: Check username availability (available)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/users/check-username/newuser$(date +%s)")
echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.available == true' > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 2: Check username availability (too short)
echo -e "${YELLOW}Test 2: Check username availability (too short)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/users/check-username/ab")
echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.available == false' > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 3: Check non-existent user by Privy ID
echo -e "${YELLOW}Test 3: Check non-existent user by Privy ID${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/users/privy/non_existent_$(date +%s)")
echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.exists == false' > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 4: Create individual user
echo -e "${YELLOW}Test 4: Create individual user${NC}"
TIMESTAMP=$(date +%s)
PRIVY_ID="privy_test_$TIMESTAMP"
USERNAME="testuser$TIMESTAMP"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup/privy" \
  -H "Content-Type: application/json" \
  -d "{
    \"privyId\": \"$PRIVY_ID\",
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"wallet\": \"0x$(openssl rand -hex 20)\",
    \"accountType\": \"individual\",
    \"username\": \"$USERNAME\",
    \"displayName\": \"Test User\",
    \"topics\": [\"Technology\", \"Web3\"]
  }")
echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"

  # Test 5: Verify user exists
  echo ""
  echo -e "${YELLOW}Test 5: Verify user exists by Privy ID${NC}"
  RESPONSE=$(curl -s -X GET "$BASE_URL/users/privy/$PRIVY_ID")
  echo "$RESPONSE" | jq '.'
  if echo "$RESPONSE" | jq -e '.exists == true' > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi

  # Test 6: Check username is now taken
  echo ""
  echo -e "${YELLOW}Test 6: Check username is now taken${NC}"
  RESPONSE=$(curl -s -X GET "$BASE_URL/users/check-username/$USERNAME")
  echo "$RESPONSE" | jq '.'
  if echo "$RESPONSE" | jq -e '.available == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi

  # Test 7: Try duplicate signup (should fail)
  echo ""
  echo -e "${YELLOW}Test 7: Try duplicate signup (should fail)${NC}"
  RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup/privy" \
    -H "Content-Type: application/json" \
    -d "{
      \"privyId\": \"$PRIVY_ID\",
      \"email\": \"duplicate@example.com\",
      \"accountType\": \"individual\",
      \"username\": \"duplicate123\"
    }")
  echo "$RESPONSE" | jq '.'
  if echo "$RESPONSE" | jq -e '.statusCode == 400' > /dev/null; then
    echo -e "${GREEN}✅ PASS (correctly rejected duplicate)${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
else
  echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 8: Create community account
echo -e "${YELLOW}Test 8: Create community account${NC}"
TIMESTAMP=$(date +%s)
PRIVY_ID_COMM="privy_community_$TIMESTAMP"
COMMUNITY_ID="test-community-$TIMESTAMP"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup/privy" \
  -H "Content-Type: application/json" \
  -d "{
    \"privyId\": \"$PRIVY_ID_COMM\",
    \"email\": \"community${TIMESTAMP}@example.com\",
    \"wallet\": \"0x$(openssl rand -hex 20)\",
    \"accountType\": \"community\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"communityName\": \"Test Community\",
    \"communityType\": \"open\"
  }")
echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

echo "======================================"
echo "All tests complete!"
echo "======================================"
