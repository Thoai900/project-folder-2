# 📱 FIREBASE SETUP - HƯỚNG DẪN CHI TIẾT

## 🎯 Tổng Quan

Dự án này sử dụng Firebase để quản lý:
- **Authentication**: Đăng nhập/Đăng ký người dùng
- **Realtime Database**: Lưu dữ liệu thời gian thực (Users, Prompts, Messages)
- **Firestore**: Database NoSQL có cấu trúc tốt hơn
- **Cloud Storage**: Lưu files (avatars, documents, images)

---

## 📋 BƯỚC 1: TẠO PROJECT FIREBASE

### 1.1 Trên Firebase Console
```
1. Vào https://console.firebase.google.com
2. Click "Add project" (hoặc sử dụng project "prompt-573fc" nếu đã tồn tại)
3. Tên project: "prompt-573fc"
4. Disable Google Analytics (tùy chọn)
5. Click Create project
```

### 1.2 Lấy Firebase Config
```
1. Vào Project Settings (⚙️ icon)
2. Chọn tab "Your apps"
3. Click biểu tượng Web (</>)
4. Sao chép Firebase config
5. Cập nhật vào firebase-config.js
```

---

## 🔐 BƯỚC 2: CẤU HÌNH AUTHENTICATION

### 2.1 Enable Auth Methods
```
Firebase Console → Authentication → Sign-in method
1. Email/Password: ENABLE
2. Anonymous: ENABLE (nếu cần demo)
3. Google: ENABLE (tùy chọn)
```

### 2.2 Cấu hình Authorized Domains
```
Authentication → Settings → Authorized domains
Thêm:
- localhost:3000
- localhost:5173
- [your-domain].vercel.app
- [your-domain].com
```

### 2.3 Đặt Password Policy
```
Authentication → Password policy
- Minimum length: 6 (hoặc cao hơn)
- Require uppercase: YES (tùy chọn)
```

---

## 💾 BƯỚC 3: CẤU HÌNH REALTIME DATABASE

### 3.1 Tạo Database
```
Firebase Console → Realtime Database
1. Click "Create Database"
2. Location: asia-southeast1 (hoặc gần nhất)
3. Security Rules: Start in test mode (development)
```

### 3.2 Deploy Firebase Rules
```
1. Vào Rules tab
2. Xóa nội dung mặc định
3. Copy nội dung từ firebase-rules.json
4. Click Publish
```

### 3.3 Cấu trúc Database
```
Realtime Database sẽ có cấu trúc:

users/
├── {userId}/
│   ├── email: "user@email.com"
│   ├── name: "Tên người dùng"
│   ├── userType: "student|teacher"
│   ├── avatar: "url_or_null"
│   ├── createdAt: "2024-01-01T00:00:00Z"
│   ├── lastLogin: "2024-01-02T10:30:00Z"
│   └── preferences: { theme, language, notifications }

prompts/
├── {promptId}/
│   ├── title: "Tiêu đề"
│   ├── content: "Nội dung prompt"
│   ├── tags: ["toán", "lý thuyết"]
│   ├── isPublic: true|false
│   ├── createdBy: "{userId}"
│   ├── createdAt: "timestamp"
│   └── views: 0

messages/
├── {messageId}/
│   ├── userId: "{userId}"
│   ├── content: "Nội dung tin nhắn"
│   ├── createdAt: "timestamp"
│   └── conversationId: "{conversationId}"
```

---

## 🗂️ BƯỚC 4: CẤU HÌNH FIRESTORE

### 4.1 Tạo Firestore Database
```
Firebase Console → Firestore Database
1. Click "Create database"
2. Location: asia-southeast1
3. Security Rules: Start in production mode
```

### 4.2 Deploy Firestore Rules
```
1. Vào Rules tab
2. Copy nội dung từ firestore.rules
3. Click Publish
```

### 4.3 Tạo Collections
```
Firestore → Collections (sẽ tự tạo khi có data):
- prompts
- messages
- conversations
- users
- activityLogs
- sharedPrompts
```

### 4.4 Composite Indexes
```
Firestore sẽ tự động tạo khi query phức tạp.
Nếu cần manual:
Firestore → Indexes → Create Composite Index

Ví dụ:
Collection: prompts
Fields: createdBy (Ascending), createdAt (Descending)
```

---

## 📦 BƯỚC 5: CẤU HÌNH CLOUD STORAGE

### 5.1 Tạo Storage Bucket
```
Firebase Console → Storage
1. Click "Get started"
2. Chọn location: asia-southeast1
3. Start in test mode (development)
```

### 5.2 Deploy Storage Rules
```
1. Vào Rules tab
2. Copy nội dung từ storage.rules
3. Click Publish
```

### 5.3 Cấu trúc Storage
```
Bucket structure:

/avatars
  /{userId}/
    └── avatar.jpg, avatar.png

/documents
  /{userId}/
    └── document1.pdf, doc2.docx

/public/images
  └── image1.jpg, image2.png

/prompts
  /{promptId}/
    └── {userId}/
      └── resource.pdf

/shared
  /{sharedId}/
    └── {userId}/
      └── file.pdf

/temp
  /{tempId}/
    └── file.tmp
```

---

## 🔧 BƯỚC 6: ENVIRONMENT VARIABLES

### 6.1 Tạo .env.local
```
Từ root project, tạo file .env.local:

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB2Nh4TfIOAuPpO18DdTmTKmJCVgasoWFI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-573fc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://prompt-573fc-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-573fc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-573fc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=362695103484
NEXT_PUBLIC_FIREBASE_APP_ID=1:362695103484:web:036d2d722e6754aeaed879
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9X3DY739S9
```

### 6.2 Cho Vercel
```
Vercel Dashboard → Settings → Environment Variables
Thêm tất cả NEXT_PUBLIC_* variables
```

### 6.3 .gitignore
```
.env.local
.env.*.local
firebase-admin-sdk.json
```

---

## 💻 BƯỚC 7: SỬ DỤNG FIREBASE MANAGER

### 7.1 Initialization
```javascript
// Firebase Manager tự động khởi tạo khi load
// Kiểm tra console xem có: "✅ Firebase initialized successfully"

// Lấy user hiện tại
const user = firebaseManager.getCurrentUser();
const userId = firebaseManager.getCurrentUserId();
```

### 7.2 Authentication
```javascript
// Đăng ký
const result = await firebaseManager.register(
    'user@email.com',
    'password123',
    'Tên người dùng',
    'student'
);

// Đăng nhập
const result = await firebaseManager.login(
    'user@email.com',
    'password123'
);

// Đăng xuất
await firebaseManager.logout();

// Reset password
await firebaseManager.sendPasswordReset('user@email.com');
```

### 7.3 Realtime Database
```javascript
// Lưu dữ liệu
await firebaseManager.saveData('users/userId/profile', {
    name: 'Tên',
    avatar: 'url'
});

// Cập nhật dữ liệu
await firebaseManager.updateData('users/userId', {
    lastLogin: new Date().toISOString()
});

// Đọc dữ liệu (một lần)
const result = await firebaseManager.getData('users/userId');
if (result.success) {
    console.log(result.data);
}

// Lắng nghe real-time
firebaseManager.listenToData('users/userId', (data) => {
    console.log('Data updated:', data);
});

// Dừng lắng nghe
firebaseManager.stopListening('users/userId');
```

### 7.4 Firestore
```javascript
// Thêm document
const result = await firebaseManager.addFirestoreDocument('prompts', {
    title: 'Tiêu đề',
    content: 'Nội dung',
    isPublic: true,
    createdBy: userId
});

// Cập nhật document
await firebaseManager.updateFirestoreDocument('prompts', docId, {
    title: 'Tiêu đề mới'
});

// Xóa document
await firebaseManager.deleteFirestoreDocument('prompts', docId);

// Lắng nghe collection
firebaseManager.listenToFirestoreCollection('prompts', (documents) => {
    console.log('Prompts:', documents);
});
```

### 7.5 Cloud Storage
```javascript
// Upload file
const file = document.getElementById('file-input').files[0];
const result = await firebaseManager.uploadFile(
    `avatars/${userId}/avatar.jpg`,
    file
);
if (result.success) {
    console.log('URL:', result.url);
}

// Download file
const result = await firebaseManager.downloadFile(
    `documents/${userId}/file.pdf`
);

// Xóa file
await firebaseManager.deleteFile(`avatars/${userId}/avatar.jpg`);
```

---

## 🔒 BƯỚC 8: SECURITY BEST PRACTICES

### 8.1 API Key Security
```
❌ KHÔNG:
- Hardcode API key trong code
- Commit .env.local lên Git
- Chia sẻ API key công khai

✅ CÓ NÊN:
- Sử dụng environment variables
- Giới hạn API key trong Firebase Console
- Rotate API key định kỳ
```

### 8.2 Firebase Rules Security
```
❌ KHÔNG:
"rules": {
  ".read": true,
  ".write": true
}

✅ CÓ NÊN:
- Kiểm tra authentication: request.auth != null
- Kiểm tra ownership: request.auth.uid == userId
- Validate data type & size
- Set appropriate indexes
```

### 8.3 User Roles & Permissions
```javascript
// Thêm role vào user document
{
    role: "student|teacher|admin",
    permissions: ["read_prompts", "create_prompts", "comment"]
}

// Kiểm tra permission trong Firestore rules
allow read: if request.auth != null && 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
```

---

## 📊 BƯỚC 9: MONITORING & ANALYTICS

### 9.1 Firebase Console Monitoring
```
1. Realtime Database → Realtime (xem data flowing)
2. Storage → Ngắm usage
3. Analytics → Xem user behavior
4. Errors → Error tracking
```

### 9.2 Setup Alerts
```
Firebase Console → Project Settings → Quotas
1. Set storage quota alert
2. Set download/upload quota alert
3. Set authentication quota alert
```

### 9.3 Performance Monitoring
```
Firebase Console → Performance
1. Enable Performance Monitoring
2. Monitor:
   - Network request duration
   - Custom traces
   - Screen rendering
```

---

## 🧪 BƯỚC 10: TESTING

### 10.1 Local Testing (Emulators)
```
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init

# Start emulators
firebase emulators:start

# Kết nối vào emulators (trong firebase-config.js):
connectAuthEmulator(auth, 'http://localhost:9099');
connectDatabaseEmulator(database, 'localhost', 9000);
connectFirestoreEmulator(db, 'localhost', 8080);
```

### 10.2 Test Auth Flow
```javascript
// Test 1: Register
await firebaseManager.register('test@test.com', 'test123', 'Test', 'student');

// Test 2: Login
await firebaseManager.login('test@test.com', 'test123');

// Test 3: Check current user
console.log(firebaseManager.getCurrentUserId());

// Test 4: Logout
await firebaseManager.logout();
```

### 10.3 Test Database
```javascript
// Test 1: Save data
await firebaseManager.saveData('test/data', { name: 'Test' });

// Test 2: Listen to data
firebaseManager.listenToData('test/data', (data) => {
    console.log('Data:', data);
});

// Test 3: Update data
await firebaseManager.updateData('test/data', { name: 'Updated' });

// Test 4: Delete data
await firebaseManager.deleteData('test/data');
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Trước khi deploy lên Production:

- [ ] Tất cả environment variables được set
- [ ] Firebase Rules được review & deploy
- [ ] Authentication methods enabled
- [ ] Database indexes created
- [ ] Storage quota alerts set
- [ ] Error tracking enabled
- [ ] API key restrictions applied
- [ ] CORS configured (nếu cần)
- [ ] Database backups enabled
- [ ] Performance monitoring enabled

### Triển khai lên Vercel:
```
1. Push code lên GitHub
2. Vercel tự động deploy
3. Set environment variables trong Vercel Dashboard
4. Test production build: npm run build
5. Monitor Firebase metrics
```

---

## 🐛 TROUBLESHOOTING

| Lỗi | Giải pháp |
|-----|----------|
| "Auth/user-not-found" | Kiểm tra email có tồn tại trong Authentication |
| "Auth/wrong-password" | Email/password không đúng |
| "Permission denied (Firestore)" | Kiểm tra Firestore rules, uid, collection path |
| "Storage/object-not-found" | File không tồn tại - kiểm tra storage path |
| "Network error" | Kiểm tra internet, CORS, authorized domains |
| "Quota exceeded" | Nâng cấp Firebase plan hoặc optimize queries |

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Storage Rules](https://firebase.google.com/docs/storage/security)

---

**Status**: ✅ Firebase fully configured
**Last Updated**: 2024-12-14
**Environment**: Development & Production ready
