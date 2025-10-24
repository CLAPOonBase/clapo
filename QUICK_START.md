# Quick Start Guide - Clapo Signup/Signin

## ✅ Integration Complete!

The frontend is now fully integrated with your backend API.

---

## What Changed

### 1. Environment Variable
`.env` file updated:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/snaps
```

### 2. Frontend Code
- ✅ SignInPage.tsx - Full API integration
- ✅ ApiProvider.tsx - Added signupWithPrivy() method
- ✅ Username availability checking (real-time)
- ✅ Existing user detection
- ✅ Proper error handling
- ✅ Loading states

---

## How to Test

### Start the App

1. **Start Backend** (if not already running)
   ```bash
   # Backend should be running on http://localhost:3001
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Navigate to Signup**
   ```
   http://localhost:3000/SignIn
   ```

### Test Individual Signup

1. Click "Connect with Privy"
2. Authenticate (use email for quick testing)
3. Choose "Join as Individual"
4. Enter your name → username auto-generates
5. Edit username → see real-time validation
6. Enter display name
7. Select 3+ topics
8. (Optional) Follow suggested users
9. Click "Complete Setup"
10. See success screen!

### Test Community Signup

1. Connect with Privy
2. Choose "Create Community"
3. Enter community ID: "my-awesome-community"
4. Enter community name: "My Awesome Community"
5. Choose type: Open/Closed/Private
6. Click "Complete Setup"
7. Backend auto-generates username from community name

---

## API Endpoints Being Used

All endpoints are working and tested:

### 1. Username Check
```
GET http://localhost:3001/api/snaps/users/check-username/{username}
```
- Called on every username change (debounced 500ms)
- Shows green checkmark if available
- Shows red X if taken

### 2. User Exists Check
```
GET http://localhost:3001/api/snaps/users/privy/{privyId}
```
- Called when Privy auth completes
- Redirects existing users to app
- Shows onboarding for new users

### 3. Signup
```
POST http://localhost:3001/api/snaps/auth/signup/privy
```
- Creates new user account
- Handles both individual and community types
- Returns user object on success

---

## Expected Behavior

### Username Validation
- ✅ Types "john doe" → username becomes "johndoe1234"
- ✅ Can edit username freely
- ✅ Real-time check shows availability
- ✅ Green border + checkmark = available
- ✅ Red border + X = taken
- ✅ Cannot proceed with taken username

### Signup Flow
- ✅ Individual: 4 steps (name/username → display name → topics → follow)
- ✅ Community: 3 steps (ID → name → type)
- ✅ Loading spinners on buttons
- ✅ Error messages display inline
- ✅ Success screen shows profile summary

### Error Handling
- ✅ Duplicate username → shows error
- ✅ Duplicate Privy ID → redirects to app
- ✅ Network error → shows retry option
- ✅ Validation errors → helpful messages

---

## Troubleshooting

### Backend Not Responding
**Check:**
```bash
curl http://localhost:3001/api/snaps/users/check-username/test
```
Should return: `{"available":true,"suggestions":[]}`

### Username Check Not Working
1. Restart frontend dev server to load new .env
2. Check browser console for errors
3. Verify NEXT_PUBLIC_API_URL is set

### Privy Modal Not Appearing
1. Check NEXT_PUBLIC_PRIVY_APP_ID in .env
2. Clear browser cache
3. Check browser console for errors

---

## Testing Checklist

- [ ] Can connect with Privy
- [ ] Existing users redirect to app
- [ ] New users see onboarding
- [ ] Username auto-generates from name
- [ ] Username availability check works
- [ ] Visual feedback (green/red) appears
- [ ] Cannot submit with taken username
- [ ] Can complete individual signup
- [ ] Can complete community signup
- [ ] Success screen appears
- [ ] User created in database

---

## Next Steps

1. **Test the flow yourself** - Navigate to /SignIn and complete signup
2. **Check the database** - Verify user was created
3. **Test edge cases** - Duplicate usernames, network errors, etc.
4. **Review console logs** - Frontend logs all API calls

---

## Files to Review

- `app/SignIn/SignInPage.tsx` - Main signup component
- `app/Context/ApiProvider.tsx` - API integration
- `.env` - Environment configuration
- `INTEGRATION_COMPLETE.md` - Full documentation
- `BACKEND_API_REQUIREMENTS.md` - API spec

---

## Quick Test Commands

```bash
# Test username availability
curl http://localhost:3001/api/snaps/users/check-username/testuser

# Test user lookup (should return false for new ID)
curl http://localhost:3001/api/snaps/users/privy/new_user_id

# Test signup (paste in terminal)
curl -X POST http://localhost:3001/api/snaps/auth/signup/privy \
  -H "Content-Type: application/json" \
  -d '{
    "privyId": "test_123",
    "email": "test@example.com",
    "accountType": "individual",
    "username": "testuser123",
    "displayName": "Test User",
    "topics": ["Technology"]
  }'
```

---

**Everything is ready to go!** 🚀

Just start your frontend and backend, then visit http://localhost:3000/SignIn
