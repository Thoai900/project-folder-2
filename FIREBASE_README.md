# 🔥 Firebase Configuration

## 📋 Overview

Dự án này sử dụng **Firebase** cho:
- 🔐 **Authentication** - Đăng nhập/Đăng ký
- 💾 **Realtime Database** - Lưu dữ liệu thời gian thực
- 🗄️ **Firestore** - Database NoSQL cấu trúc
- 📦 **Cloud Storage** - Lưu files (avatars, documents)

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local với Firebase API keys
```

### 2. Initialize Firebase
```javascript
// Firebase tự động khởi tạo khi load index.html
// Kiểm tra console: "✅ Firebase initialized successfully"
```

### 3. Validate Configuration
```javascript
// Browser console
firebaseValidator.validate();
```

### 4. Test Authentication
```javascript
// Test login anonymously
const result = await firebaseManager.loginAnonymously();
console.log('User ID:', result.userId);
```

## 📁 Firebase Files

### Core Configuration
- `firebase-config.js` - Firebase SDK setup
- `js/firebase-manager.js` - Main Firebase API class
- `js/firebase-validator.js` - Configuration validator

### Security Rules
- `firebase-rules.json` - Realtime Database rules
- `firestore.rules` - Firestore security rules
- `storage.rules` - Cloud Storage rules

### Documentation
- `FIREBASE_QUICKSTART.md` - 5-minute setup guide
- `FIREBASE_COMPLETE_SETUP.md` - Comprehensive documentation
- `FIREBASE_SETUP.md` - Setup guide & examples

## 🔌 Firebase Manager API

### Authentication
```javascript
firebaseManager.register(email, password, name, userType)
firebaseManager.login(email, password)
firebaseManager.logout()
firebaseManager.loginAnonymously()
firebaseManager.sendPasswordReset(email)
```

### Realtime Database
```javascript
firebaseManager.saveData(path, data)
firebaseManager.updateData(path, updates)
firebaseManager.getData(path)
firebaseManager.deleteData(path)
firebaseManager.listenToData(path, callback)
firebaseManager.stopListening(path)
```

### Firestore
```javascript
firebaseManager.addFirestoreDocument(collectionName, data)
firebaseManager.updateFirestoreDocument(collectionName, docId, updates)
firebaseManager.deleteFirestoreDocument(collectionName, docId)
firebaseManager.listenToFirestoreCollection(collectionName, callback)
```

### Cloud Storage
```javascript
firebaseManager.uploadFile(path, file)
firebaseManager.downloadFile(path)
firebaseManager.deleteFile(path)
```

### Utilities
```javascript
firebaseManager.getCurrentUser()
firebaseManager.getCurrentUserId()
firebaseManager.isAuthenticated()
firebaseManager.cleanup()
```

## 🔐 Security Rules

### Realtime Database
- ✅ Users: Private (chỉ chủ sở hữu)
- ✅ Prompts: Public reads, private writes
- ✅ Messages: Authenticated reads, user writes
- ✅ Conversations: Participants only

### Firestore
- ✅ Users: Private (chỉ chủ sở hữu)
- ✅ Prompts: Auth reads, user creates
- ✅ Messages: Auth reads, user creates
- ✅ Conversations: Participants only

### Cloud Storage
- ✅ Avatars: Auth reads, user writes
- ✅ Documents: Private (chỉ chủ sở hữu)
- ✅ Public: Auth reads
- ✅ Shared: Participants

## 📊 Data Structure

### Users Collection
```javascript
{
    id: "userId",
    email: "user@email.com",
    name: "Tên người dùng",
    userType: "student|teacher|admin",
    avatar: "https://...",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-02T10:30:00Z",
    preferences: {
        theme: "dark|light",
        language: "vi|en",
        notifications: true
    },
    stats: {
        promptsCreated: 5,
        promptsUsed: 20,
        lastActivityAt: "timestamp"
    }
}
```

### Prompts Collection
```javascript
{
    title: "Tiêu đề Prompt",
    content: "Nội dung prompt...",
    tags: ["toán", "lý thuyết"],
    category: "Giáo dục",
    isPublic: true,
    createdBy: "userId",
    createdAt: "timestamp",
    views: 100,
    likes: 10,
    description: "Mô tả ngắn"
}
```

### Messages Collection
```javascript
{
    userId: "userId",
    content: "Nội dung tin nhắn",
    createdAt: "timestamp",
    conversationId: "conversationId",
    attachments: ["url1", "url2"]
}
```

## 🛠️ Development

### Enable Emulators (Local Testing)
```javascript
// Uncomment in firebase-config.js để sử dụng emulators

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectDatabaseEmulator(database, 'localhost', 9000);
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
}
```

### Start Firebase Emulator
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize
firebase init

# Start emulators
firebase emulators:start
```

## ✅ Production Checklist

- [ ] All environment variables set
- [ ] Firebase rules deployed & tested
- [ ] Authentication methods enabled
- [ ] Database indexes created
- [ ] Storage quota alerts set
- [ ] Backups enabled
- [ ] Monitoring configured
- [ ] API key restrictions applied
- [ ] Authorized domains configured
- [ ] Error tracking enabled

## 🔧 Troubleshooting

### Configuration Issues
```javascript
// Validate configuration
firebaseValidator.validate();

// Export validation report
firebaseValidator.exportReport();
```

### Common Errors
| Error | Solution |
|-------|----------|
| "Permission denied" | Check rules, user authentication |
| "Auth/user-not-found" | User doesn't exist, register first |
| "Network error" | Check CORS, authorized domains |
| "Storage/object-not-found" | File path incorrect or file deleted |

### Debug Mode
```javascript
// Enable debug logging
firebase.initializeApp(config, { enableOfflineSync: true });

// Monitor database operations
firebaseManager.logEvent('operation_name', { data: 'value' });
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Authentication Guide](https://firebase.google.com/docs/auth)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Storage Rules](https://firebase.google.com/docs/storage/security)

## 📞 Support

For issues or questions:
1. Check [FIREBASE_COMPLETE_SETUP.md](./FIREBASE_COMPLETE_SETUP.md)
2. Review [FIREBASE_QUICKSTART.md](./FIREBASE_QUICKSTART.md)
3. Check Firebase Console logs
4. Validate configuration: `firebaseValidator.validate()`

---

**Status**: ✅ Configured & Ready for Production
**Last Updated**: 2024-12-14
**Version**: 1.0.0
