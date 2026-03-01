# ConnectHub (Capstone) — Flutter Mobile App

A professional **Connection Request** mobile app built for a capstone project. Users can create profiles, browse/filter other users, send connection requests, accept/decline requests, and manage connections. (Optional) After connecting, users can store simple message history (not real-time).

---

# 📊 Project Progress Tracker (Flutter)

## 🏗 Setup & Foundation
- [ ] Create Flutter project
- [ ] Setup folder structure (core/models/services/providers/pages/widgets)
- [ ] Add dependencies (state mgmt, routing, http client, secure storage)
- [ ] Setup app theme (colors, typography, spacing)
- [ ] Setup routing + protected navigation
- [ ] Create reusable widgets (buttons, textfields, loaders, empty states)

---

## 🔐 Authentication & Session Handling
- [ ] Setup Firebase project (Auth enabled)
- [ ] Add Firebase to Flutter (android/ios configs)
- [ ] Implement Register screen
- [ ] Implement Login screen
- [ ] Implement Logout
- [ ] Persist session (auto-login on app launch)
- [ ] Auth guard (redirect unauthenticated users to login)
- [ ] Input validation + error messages (email, password rules)
- [ ] Loading + success/error feedback (snackbars/toasts)

> If using JWT instead of Firebase:
- [ ] Store JWT token securely (`flutter_secure_storage`)
- [ ] Auto-refresh / re-login handling
- [ ] Attach JWT to every API request

---

## 👤 Profile (CRUD)
- [ ] Create Profile screen (Create profile)
- [ ] Edit Profile screen (Update)
- [ ] View My Profile (Read)
- [ ] Delete Profile (Delete) + confirm dialog
- [ ] Form validation (name required, location format, etc.)
- [ ] UI polish (loading states + empty states)

---

## 🔍 Browse & Filtering
- [ ] Browse users list (exclude self)
- [ ] User details page
- [ ] Filter by location
- [ ] Filter by interest(s)
- [ ] Search by name (optional bonus)
- [ ] Pagination or lazy loading (bonus)
- [ ] Show empty state for “no results”

---

## 📩 Connection Requests
- [ ] Send connection request from user details
- [ ] Prevent duplicate requests (handle API errors cleanly)
- [ ] Incoming requests screen
- [ ] Outgoing requests screen
- [ ] Accept request action
- [ ] Decline request action
- [ ] Cancel outgoing request (optional)
- [ ] Loading + confirm UI feedback

---

## 🤝 Connections
- [ ] Connections list screen
- [ ] Connection profile preview (optional)
- [ ] Remove connection (Delete) + confirm dialog
- [ ] Ensure only user’s connections show

---

## 💬 Messages (Optional — Stored History Only)
- [ ] Chat/messages screen (per connection)
- [ ] Load message history
- [ ] Send message (stored in DB)
- [ ] Sort by timestamp
- [ ] Empty state “No messages yet”

---

## 🛡 UX Quality (High Marks)
- [ ] Consistent spacing/typography across all pages
- [ ] Loading indicator for every request
- [ ] Empty states for every list screen
- [ ] Confirmation before destructive actions
- [ ] Global error handling (network, server errors)
- [ ] Prevent multiple taps on submit buttons
- [ ] Pull-to-refresh for key lists (optional bonus)
- [ ] Dark/Light theme toggle (bonus)

---

## 🧪 Testing & Final Polish
- [ ] Test auth flow end-to-end
- [ ] Test profile CRUD end-to-end
- [ ] Test browse filters
- [ ] Test request → accept → connection flow
- [ ] Test data isolation (no other user’s private data)
- [ ] Handle offline / timeout gracefully
- [ ] Remove debug logs + unused code
- [ ] Add README screenshots section placeholders

---

# ✅ Capstone Deliverables Tracker
- [ ] APK / runnable project exported
- [ ] GitHub repo clean + updated README
- [ ] Technical documentation ready (architecture, endpoints, schema)
- [ ] User manual written (with screenshots)
- [ ] App screenshots exported (all key screens)
- [ ] 5-minute demo video recorded
- [ ] Viva prep: can explain architecture, auth, CRUD, DB design

---

# 🌐 API Base URL Setup

Create a constants file.

**`lib/core/constants/api_constants.dart`**
```dart
class ApiConstants {
  static const String baseUrl = "http://localhost:4000/api";
}
