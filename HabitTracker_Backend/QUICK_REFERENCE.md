# Quick Reference Card - Habit Tracker API

## 🔑 Key Point: All Protected Endpoints Need This Header
```
Authorization: Bearer {jwt_token}
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register
   Body: { userName, password }
   
2. POST /api/auth/login  
   Body: { userName, password }
   Response: { token, userId, userName, message }
   
3. Copy token → Use in Authorization header for all other requests
```

---

## 🎯 Main Endpoints (All require JWT header)

### Habits
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/habits | Create habit |
| GET | /api/habits | Get all your habits |
| GET | /api/habits/{id} | Get single habit |
| PUT | /api/habits/{id} | Update habit |
| DELETE | /api/habits/{id} | Delete habit |

### Entries
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/habits/{id}/entries | Log completion |
| GET | /api/habits/{id}/entries | Get entries for habit |
| GET | /api/entries | Get all your entries |

### Profile
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/user | Get your profile |
| PUT | /api/user | Update profile |
| DELETE | /api/user | Delete account |

---

## ⚠️ Security Rules

```
✅ CAN:
  - Access your own habits
  - Modify your own habits
  - Log entries for your habits
  - View your own profile

❌ CANNOT:
  - Access other users' habits
  - Modify other users' habits
  - Log entries for others' habits
  - View other users' profiles

Why? UserId comes from JWT token - cannot be spoofed!
```

---

## 🔄 Postman Quick Test

### Step 1: Register
```
POST http://localhost:8080/api/auth/register
{
  "userName": "testuser",
  "password": "password123"
}
```

### Step 2: Login
```
POST http://localhost:8080/api/auth/login
{
  "userName": "testuser",
  "password": "password123"
}
→ Copy the "token" value
```

### Step 3: Create Habit
```
POST http://localhost:8080/api/habits
Header: Authorization: Bearer {paste_token_here}
{
  "habitName": "Exercise",
  "habitDescription": "30 min",
  "habitTags": ["fitness"]
}
```

### Step 4: Get Habits
```
GET http://localhost:8080/api/habits
Header: Authorization: Bearer {paste_token_here}
→ Shows only YOUR habits
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No/invalid token | Add Authorization header |
| 404 Not Found | Wrong habit ID | Use valid ID from list |
| "You can only..." | Not your habit | Only access your data |
| "Invalid credentials" | Wrong username/password | Check login details |

---

## 📝 Request Examples

### Create Habit
```javascript
fetch('http://localhost:8080/api/habits', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    habitName: 'Read',
    habitDescription: '1 hour',
    habitTags: ['learning']
  })
})
```

### Get All Habits
```javascript
fetch('http://localhost:8080/api/habits', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

### Log Entry
```javascript
fetch('http://localhost:8080/api/habits/1/entries', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    habitId: 1,
    entryStatus: 'COMPLETED',
    completedAt: new Date().toISOString()
  })
})
```

---

## 🧪 Security Tests to Try

```
1. Request without token → Should fail ✓
2. Request with fake token → Should fail ✓
3. Try to access other user's habit → Should fail ✓
4. Try to modify other user's habit → Should fail ✓
5. All above should return 401 Unauthorized ✓
```

---

## 💾 Remember

- **Token expires in:** 24 hours
- **If token expired:** Login again to get new one
- **Never put token in URL:** Always use Authorization header
- **Backend validates:** All requests are checked for ownership
- **Frontend responsibility:** Send token in every request

---

## 📞 Database Operations

```
User 1 logs in → Gets token with userId=1
User 1 creates habit → Stored with userId=1
User 1 gets habits → Sees only habits with userId=1
User 2 tries to access → Blocked (userId doesn't match)
```

---

## ✅ Implementation Complete!

- ✅ JWT authentication working
- ✅ Ownership validation everywhere
- ✅ Consistent API design
- ✅ All endpoints secured
- ✅ Ready for React frontend

**Start frontend development now!** 🚀

---

*Last Updated: 2026-04-04*

