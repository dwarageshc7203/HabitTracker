# Postman Testing Guide - Secure API

## Quick Start

### Step 1: Register a New User
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "userName": "testuser1",
  "password": "password123"
}
```

### Step 2: Login to Get JWT Token
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "userName": "testuser1",
  "password": "password123"
}

Response will include:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "userName": "testuser1",
  "message": "Login successful"
}
```
**Copy the token value - you'll need it for all protected endpoints**

---

## Protected Endpoints - Complete Test Suite

### Create Habit
```
POST http://localhost:8080/api/habits
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "habitName": "Morning Workout",
  "habitDescription": "30 minutes of exercise",
  "habitTags": ["fitness", "health", "morning"]
}

Expected: 201 Created
Response:
{
  "habitId": 1,
  "userId": 1,
  "habitName": "Morning Workout",
  "habitDescription": "30 minutes of exercise",
  "habitTags": ["fitness", "health", "morning"],
  "createdAt": "2026-04-04T08:00:00Z"
}
```

### Get All User Habits
```
GET http://localhost:8080/api/habits
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
Response: [list of all habits for logged-in user]
```

### Get Single Habit
```
GET http://localhost:8080/api/habits/1
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
Response: Single habit details
```

### Update Habit
```
PUT http://localhost:8080/api/habits/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "habitName": "Updated Habit Name",
  "habitDescription": "Updated description",
  "habitTags": ["updated", "tags"]
}

Expected: 200 OK
Response: Updated habit details
```

### Delete Habit
```
DELETE http://localhost:8080/api/habits/1
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
```

---

## Habit Entry Endpoints

### Log Habit Completion
```
POST http://localhost:8080/api/habits/1/entries
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "habitId": 1,
  "entryStatus": "COMPLETED",
  "completedAt": "2026-04-04T09:00:00Z"
}

Expected: 201 Created
Response:
{
  "entryId": 1,
  "habitId": 1,
  "userId": 1,
  "entryStatus": "COMPLETED",
  "completedAt": "2026-04-04T09:00:00Z"
}
```

### Get Entries for Specific Habit
```
GET http://localhost:8080/api/habits/1/entries
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
Response: [list of all entries for habit 1]
```

### Get All User Entries
```
GET http://localhost:8080/api/entries
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
Response: [list of all entries for logged-in user]
```

---

## User Profile Endpoints

### Get Own Profile
```
GET http://localhost:8080/api/user
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
Response:
{
  "userId": 1,
  "userName": "testuser1",
  "password": "",
  "streaks": 0,
  "createdAt": "2026-04-04T08:00:00Z"
}
```

### Update Profile
```
PUT http://localhost:8080/api/user
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userName": "newusername",
  "password": "newpassword123"
}

Expected: 200 OK
Response: Updated user details
```

### Delete Account
```
DELETE http://localhost:8080/api/user
Authorization: Bearer YOUR_TOKEN_HERE

Expected: 200 OK
```

---

## Security Tests

### Test 1: Missing Authorization Header
```
GET http://localhost:8080/api/habits
[NO Authorization header]

Expected: 401 Unauthorized
```

### Test 2: Invalid Token
```
GET http://localhost:8080/api/habits
Authorization: Bearer invalid_token_here

Expected: 401 Unauthorized
```

### Test 3: Ownership Validation
```
1. Create habit with User A (habitId = 1)
2. Login as User B
3. Try to update/delete User A's habit:
   PUT http://localhost:8080/api/habits/1
   Authorization: Bearer USER_B_TOKEN
   
Expected: 401 Unauthorized
Response: "Unauthorized: You can only modify your own habits"
```

### Test 4: Cross-User Habit Entry
```
1. User A has habitId = 1
2. Login as User B
3. Try to log entry for User A's habit:
   POST http://localhost:8080/api/habits/1/entries
   Authorization: Bearer USER_B_TOKEN
   
Expected: 401 Unauthorized
Response: "Unauthorized: You can only log entries for your own habits"
```

---

## Postman Collection Variables

Create these variables in Postman for easier testing:

**Variables → Set up global/collection variables:**
```
base_url: http://localhost:8080
api_path: /api
token: (paste JWT token after login)

Then use in requests:
{{base_url}}{{api_path}}/habits
Header: Authorization: Bearer {{token}}
```

---

## Common Issues & Solutions

### Issue: "Authorization header missing"
**Cause:** Forgot to add header to request
**Fix:** Add `Authorization: Bearer {token}` header

### Issue: "Invalid token"
**Cause:** Token is expired or malformed
**Fix:** Login again to get a new token

### Issue: "Unauthorized: You can only..."
**Cause:** Trying to access another user's data
**Fix:** This is working correctly! Security feature.

### Issue: "Habit not found"
**Cause:** Trying to access habit with wrong ID
**Fix:** Use valid habitId from list

---

## Success Criteria

✅ All tests passing = Your API is secure and working correctly!

- [ ] Can register new user
- [ ] Can login and receive token
- [ ] Can create habits with token
- [ ] Can view only own habits
- [ ] Cannot access other users' data
- [ ] Cannot modify other users' data
- [ ] Can log habit entries
- [ ] Can view own profile
- [ ] Requests without token are rejected

**Your backend is production-ready! 🚀**

