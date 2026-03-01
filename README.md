
---

## 2) API README (`README.md`)

```md
# ConnectHub API — NodeJS/Express + MySQL

A REST API for **profiles, browsing, connection requests, and connections** to support a Flutter capstone application.

This API is intentionally scoped for a 4–6 week capstone: **no real-time sockets**, no advanced moderation systems. (Optional) Messages are stored as history only.

---

# ✅ Capstone Requirements Covered
- RESTful API design (Express routes/controllers)
- Secure endpoints (JWT or Firebase token verification)
- Proper MySQL schema (normalized tables + foreign keys)
- Error handling + validation
- User-owned records (data isolation)

---

# 🧱 Tech Stack
- Node.js
- Express.js
- MySQL (mysql2)
- Auth:
  - Option A: Firebase Auth (verify ID token in backend)
  - Option B: JWT (email+password backend login)

> Recommended: Firebase Auth for speed, plus backend verifies token for secure endpoints.

---

# 📁 Suggested Project Structure

src/
├── config/
│   ├── db.js
│   └── env.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── profiles.routes.js
│   ├── browse.routes.js
│   ├── requests.routes.js
│   ├── connections.routes.js
│   └── messages.routes.js (optional)
├── controllers/
│   ├── auth.controller.js
│   ├── profiles.controller.js
│   ├── browse.controller.js
│   ├── requests.controller.js
│   ├── connections.controller.js
│   └── messages.controller.js (optional)
├── validators/
│   ├── auth.validators.js
│   ├── profile.validators.js
│   └── request.validators.js
├── utils/
│   └── response.js
└── server.js

---

# ⚙️ Setup (Start to Finish)

## 1) Install dependencies
```bash
npm install
