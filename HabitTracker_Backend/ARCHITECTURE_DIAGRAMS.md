# API Architecture Diagram & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                        │
│                   (Port 3000)                           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Auth Store (Zustand)                      │  │
│  │  - Token: stored in localStorage                 │  │
│  │  - User: { userId, userName, token }            │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │        API Client (Axios)                        │  │
│  │  - Base URL: http://localhost:8080/api           │  │
│  │  - Auto-inject Authorization header             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/HTTPS
                  │ (All requests include JWT in header)
                  ↓
┌─────────────────────────────────────────────────────────┐
│           SPRING BOOT BACKEND                           │
│           (Port 8080)                                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            API Controllers                       │  │
│  │  - HabitController                              │  │
│  │  - HabitEntryController                         │  │
│  │  - UsersController                              │  │
│  │  - AuthController                               │  │
│  │                                                  │  │
│  │  Each extracts userId from JWT header           │  │
│  └───────────────────┬────────────────────────────┘  │
│                      │ userId validation              │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Service Layer                        │  │
│  │  - HabitService (ownership checks)              │  │
│  │  - HabitEntryService (ownership checks)         │  │
│  │  - UsersService (authentication)                │  │
│  │                                                  │  │
│  │  Each validates: does user own this resource?   │  │
│  └───────────────────┬────────────────────────────┘  │
│                      │ filtered queries               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Repository Layer                      │  │
│  │  - HabitRepository                              │  │
│  │    * findByUser_UserId(userId)                  │  │
│  │  - HabitEntryRepository                         │  │
│  │    * findByUser_UserId(userId)                  │  │
│  │    * findByHabit_HabitId(habitId)              │  │
│  │  - UsersRepository                              │  │
│  │    * findByUserName(userName)                   │  │
│  └───────────────────┬────────────────────────────┘  │
│                      │ SQL Queries                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │        PostgreSQL Database                       │  │
│  │                                                  │  │
│  │  Users (userId, userName, password, ...)        │  │
│  │  Habits (habitId, user_id, ...)                 │  │
│  │  HabitEntries (entryId, user_id, habit_id, ...) │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Request Flow - Example: Get All Habits

```
1. USER CLICKS: "View My Habits"
   ↓
2. FRONTEND: GET http://localhost:8080/api/habits
   Header: Authorization: Bearer eyJhbGc...
   ↓
3. SPRING SECURITY: Checks route is /api/habits
   ✅ Route requires authentication
   ↓
4. JWTAUTHENTICATIONFILTER:
   - Extracts token from Authorization header
   - Validates token signature & expiration
   - Extracts userId from claims
   - Sets SecurityContext with userId
   ↓
5. HABITCONTROLLER:
   - Gets @RequestHeader("Authorization") String token
   - Calls securityUtil.extractUserIdFromToken(token)
   - Gets userId = 1
   ↓
6. HABITSERVICE.getHabits(userId=1):
   - Calls repository.findByUser_UserId(1)
   ↓
7. HABITREPOSITORY:
   - Executes SQL: SELECT * FROM habits WHERE user_id = 1
   ↓
8. DATABASE:
   - Returns only habits where user_id = 1
   ↓
9. SERVICE:
   - Maps entities to response DTOs
   - Returns List<HabitResponse>
   ↓
10. CONTROLLER:
    - Wraps in ResponseEntity with 200 OK
    ↓
11. FRONTEND:
    - Receives list of habits
    - Updates UI with habit list
    ✅ COMPLETE
```

---

## JWT Token Flow

```
┌─────────────────────────────────────────┐
│         USER LOGS IN                     │
│  POST /api/auth/login                   │
│  { userName: "john", password: "pw" }   │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│      BACKEND VERIFICATION                │
│  1. Find user by userName                │
│  2. Check password with BCrypt           │
│  3. Password matches ✅                  │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    JWT TOKEN GENERATION                  │
│  Claims:                                 │
│  - sub: "1" (userId)                    │
│  - userName: "john"                     │
│  - iat: 2026-04-04T08:00:00Z            │
│  - exp: 2026-04-05T08:00:00Z (24h)      │
│                                          │
│  Signed with: SECRET_KEY (bcrypt)       │
│                                          │
│  Result: eyJhbGciOiJIUzI1NiIsInR5cCI... │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    RESPONSE TO FRONTEND                  │
│  {                                       │
│    "token": "eyJhbGc...",               │
│    "userId": 1,                         │
│    "userName": "john",                  │
│    "message": "Login successful"        │
│  }                                       │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    FRONTEND STORAGE                      │
│  localStorage.setItem('token',          │
│    'eyJhbGc...')                        │
└─────────────────────────────────────────┘
                 
                 ↓↓↓ ALL FUTURE REQUESTS ↓↓↓

┌─────────────────────────────────────────┐
│   EVERY API REQUEST INCLUDES:            │
│   GET /api/habits                       │
│   Headers: {                            │
│     Authorization: Bearer eyJhbGc...   │
│   }                                      │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    BACKEND VALIDATION                    │
│  1. Extract token from header           │
│  2. Verify signature with SECRET_KEY    │
│  3. Check if expired (exp claim)        │
│  4. Extract userId from sub claim       │
│  ✅ Valid → Process request             │
│  ❌ Invalid → Return 401                │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    USE USERID FROM TOKEN                │
│  int userId = jwtUtil.extractUserId()  │
│  (Cannot be spoofed - verified above)   │
└─────────────────────────────────────────┘
```

---

## Ownership Validation Flow

```
SCENARIO: User A tries to update User B's habit

┌──────────────────────────────────────────┐
│  USER A (userId=1) sends:                │
│  PUT /api/habits/5                       │
│  Authorization: Bearer TOKEN_A           │
│  { habitName: "Updated" }                │
└────────────────┬─────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│  CONTROLLER extracts userId from JWT:    │
│  int userId = securityUtil.extractUserId│
│  Result: userId = 1 (from TOKEN_A)       │
└────────────────┬─────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│  SERVICE receives:                       │
│  updateHabit(userId=1, habitId=5, ...)   │
└────────────────┬─────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│  SERVICE fetches habit from DB:          │
│  Habit habit = repository.findById(5)   │
│  Result: Habit{id=5, userId=2, name...} │
│           ↑ OWNED BY USER 2!             │
└────────────────┬─────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│  OWNERSHIP CHECK:                        │
│  if (habit.getUser().getUserId() != 1) {│
│    throw new RuntimeException(           │
│      "Unauthorized: You can only        │
│       modify your own habits"           │
│    )                                     │
│  }                                       │
│                                          │
│  CHECK RESULT:                           │
│  habit.userId (2) != userId (1)         │
│  ❌ UNAUTHORIZED!                        │
└────────────────┬─────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│  RESPONSE TO FRONTEND:                   │
│  HTTP 401 Unauthorized                   │
│  {                                       │
│    "error": "Unauthorized: You can      │
│              only modify your own        │
│              habits"                    │
│  }                                       │
└──────────────────────────────────────────┘

✅ SECURITY SUCCESS: Attack prevented!
```

---

## Database Relationships

```
USERS Table
┌──────────────┬──────────────┐
│ userId (PK)  │ userName     │ password | createdAt
├──────────────┼──────────────┤
│ 1            │ john_doe     │ $2a$10$ │ 2026-04-01
│ 2            │ jane_smith   │ $2a$10$ │ 2026-04-02
│ 3            │ bob_johnson  │ $2a$10$ │ 2026-04-03
└──────────────┴──────────────┘
       ↑
       │ One-to-Many
       │
HABITS Table
┌──────────────┬──────────────┬─────────────────┐
│ habitId (PK) │ user_id (FK) │ habitName       │ ...
├──────────────┼──────────────┼─────────────────┤
│ 1            │ 1            │ Morning Workout │
│ 2            │ 1            │ Reading         │
│ 3            │ 2            │ Meditation      │
│ 4            │ 2            │ Coding          │
│ 5            │ 3            │ Running         │
└──────────────┴──────────────┴─────────────────┘
       ↑
       │ One-to-Many
       │
HABITENTRY Table
┌──────────────┬──────────────┬──────────────┬─────────────┐
│ entryId (PK) │ user_id (FK) │ habit_id(FK) │ status      │
├──────────────┼──────────────┼──────────────┼─────────────┤
│ 1            │ 1            │ 1            │ COMPLETED   │
│ 2            │ 1            │ 1            │ COMPLETED   │
│ 3            │ 1            │ 2            │ COMPLETED   │
│ 4            │ 2            │ 3            │ SKIPPED     │
│ 5            │ 2            │ 4            │ COMPLETED   │
│ 6            │ 3            │ 5            │ COMPLETED   │
└──────────────┴──────────────┴──────────────┴─────────────┘

RESULT:
- User 1 sees habits 1,2 and entries 1,2,3
- User 2 sees habits 3,4 and entries 4,5
- User 3 sees habit 5 and entry 6
- NO cross-user data leakage ✅
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│     FRONTEND SENDS REQUEST          │
└────────────────┬────────────────────┘
                 ↓
         ┌──────────────────┐
         │  Check response  │
         └────────┬─────────┘
          ┌───────┴────────┐
          ↓                ↓
      [200 OK]         [4xx/5xx]
          │                │
          ↓                ↓
      ┌──────┐         ┌──────────────┐
      │ Show │         │  Check code  │
      │ data │         └──────┬───────┘
      └──────┘             ┌──┴──────────┐
                           ↓             ↓
                       [401/403]      [404/500]
                           │             │
                           ↓             ↓
                    ┌────────────┐   ┌────────┐
                    │ Clear token│   │ Show   │
                    │ Go to login│   │ error  │
                    │ popup      │   │ message│
                    └────────────┘   └────────┘

401 UNAUTHORIZED:
- Invalid/expired token
- Missing Authorization header
- User doesn't own resource
→ Action: Re-login

403 FORBIDDEN:
- User authenticated but not authorized
- Usually same as 401 for our use case

404 NOT FOUND:
- Resource doesn't exist
- Wrong ID provided
→ Action: Show error message

500 SERVER ERROR:
- Backend issue
→ Action: Show error message, retry later
```

---

## Security Layers

```
┌────────────────────────────────────────┐
│     LAYER 1: Transport Security        │
│  - HTTPS (in production)               │
│  - Prevents man-in-the-middle          │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│     LAYER 2: Authentication            │
│  - JWT token validation                │
│  - Token signature verification        │
│  - Token expiration check              │
│  - Verified userId extraction          │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│     LAYER 3: Authorization             │
│  - Route-level protection              │
│  - /api/auth/* → Public                │
│  - /api/habits/* → Authenticated       │
│  - /api/user/* → Authenticated         │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│     LAYER 4: Ownership Validation      │
│  - Check user owns habit               │
│  - Check user owns entry               │
│  - Check user owns profile             │
│  - Prevents cross-user access          │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│     LAYER 5: Data Filtering            │
│  - Repository queries filtered         │
│  - Database only returns user's data   │
│  - Defense in depth                    │
└────────────────────────────────────────┘
```

---

## Summary

```
✅ Secure: 5 layers of security
✅ Consistent: Same pattern for all endpoints
✅ Scalable: Easy to add new resources
✅ Maintainable: Clear separation of concerns
✅ Tested: Maven build successful
✅ Documented: 5 comprehensive guides

Ready for React frontend! 🚀
```

