# 🚀 FIREBASE QUICK START GUIDE

## ⚡ 5 Phút Setup

### 1️⃣ Environment Variables
```bash
# Copy .env.example thành .env.local
cp .env.example .env.local

# Hoặc tạo .env.local với:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB2Nh4TfIOAuPpO18DdTmTKmJCVgasoWFI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-573fc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://prompt-573fc-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-573fc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-573fc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=362695103484
NEXT_PUBLIC_FIREBASE_APP_ID=1:362695103484:web:036d2d722e6754aeaed879
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9X3DY739S9
```

### 2️⃣ Firebase Console Setup
Truy cập: https://console.firebase.google.com/project/prompt-573fc

**Authentication:**
- ✅ Enable Email/Password
- ✅ Enable Anonymous
- ✅ Add authorized domains: localhost:3000, localhost:5173

**Realtime Database:**
- ✅ Create database (asia-southeast1)
- ✅ Deploy rules từ `firebase-rules.json`

**Firestore:**
- ✅ Create database
- ✅ Deploy rules từ `firestore.rules`

**Cloud Storage:**
- ✅ Create bucket
- ✅ Deploy rules từ `storage.rules`

### 3️⃣ Validate Configuration
Mở browser console:
```javascript
// Validate firebase configuration
await firebaseValidator.validate();

// Hoặc test manual
await firebaseManager.loginAnonymously();
console.log(firebaseManager.getCurrentUserId());
```

---

## 📖 Common Usage

### Register & Login
```javascript
// Đăng ký
const { success, userId } = await firebaseManager.register(
    'user@email.com',
    'password123',
    'Tên Người Dùng',
    'student'
);

// Đăng nhập
await firebaseManager.login('user@email.com', 'password123');

// Check current user
const user = firebaseManager.getCurrentUser();
console.log(user.email);

// Đăng xuất
await firebaseManager.logout();
```

### Save & Update Data
```javascript
// Lưu dữ liệu
await firebaseManager.saveData('users/userId/profile', {
    name: 'Tên mới',
    avatar: 'https://...',
    preferences: { theme: 'dark' }
});

// Cập nhật dữ liệu
await firebaseManager.updateData('users/userId', {
    lastLogin: new Date().toISOString()
});

// Xóa dữ liệu
await firebaseManager.deleteData('users/userId/temp');
```

### Listen to Real-time Changes
```javascript
// Lắng nghe thay đổi
firebaseManager.listenToData('users/userId', (userData) => {
    console.log('User updated:', userData);
    // Update UI
});

// Dừng lắng nghe
firebaseManager.stopListening('users/userId');
```

### Firestore Operations
```javascript
// Thêm document
const { docId } = await firebaseManager.addFirestoreDocument('prompts', {
    title: 'Tiêu đề Prompt',
    content: 'Nội dung...',
    tags: ['toán', 'lý thuyết'],
    isPublic: true,
    createdBy: userId
});

// Cập nhật document
await firebaseManager.updateFirestoreDocument('prompts', docId, {
    title: 'Tiêu đề mới'
});

// Lắng nghe collection
firebaseManager.listenToFirestoreCollection('prompts', (documents) => {
    console.log('Prompts:', documents);
    // documents = [{ id, title, content, ... }]
});
```

### File Upload
```javascript
// Upload file
const file = document.getElementById('file-input').files[0];
const { success, url } = await firebaseManager.uploadFile(
    `avatars/${userId}/${file.name}`,
    file
);

if (success) {
    // Use URL to save to database
    await firebaseManager.updateData(`users/${userId}`, {
        avatar: url
    });
}
```

---

## 🔍 Debugging

### Check Configuration
```javascript
// Xem Firebase services initialized
console.log(window.firebaseAuth);
console.log(window.firebaseDB);
console.log(window.db);
console.log(window.firebaseStorage);
```

### Monitor Events
```javascript
// Firebase Manager logs tất cả events
// Xem console để debug operations

// Hoặc access event log:
firebaseManager.logEvent('custom_event', { data: 'value' });
```

### Common Errors

| Error | Solution |
|-------|----------|
| "Permission denied" | Check Firestore/RTDB rules, user UID |
| "Auth/user-not-found" | User không tồn tại - register đã |
| "Storage/object-not-found" | File path sai hoặc file bị xóa |
| "Network error" | Check internet, CORS, authorized domains |

---

## 🔒 Security Reminders

1. **NEVER** commit `.env.local` to Git
2. Add `.env.local` to `.gitignore`
3. Use environment variables for all secrets
4. Validate rules before deploying to production
5. Set appropriate API key restrictions in Firebase Console

---

## 🎯 Next Steps

1. ✅ Setup environment variables
2. ✅ Deploy Firebase rules
3. ✅ Validate configuration
4. ✅ Implement auth UI
5. ✅ Add data operations
6. ✅ Test with real users
7. ✅ Deploy to production

---

## 📚 Full Documentation

See:
- [FIREBASE_COMPLETE_SETUP.md](./FIREBASE_COMPLETE_SETUP.md) - Comprehensive guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Code examples & checklist
- [js/firebase-manager.js](./js/firebase-manager.js) - API reference

---

**Ready to go!** 🎉 Start building with Firebase!
