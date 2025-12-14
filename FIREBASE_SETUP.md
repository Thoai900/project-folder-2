/**
 * ===================================================
 * FIREBASE SETUP & INITIALIZATION GUIDE
 * ===================================================
 * Hướng dẫn thiết lập Firebase từ đầu đến cuối
 */

// ==================================================
// 1. ENVIRONMENT VARIABLES (.env.local)
// ==================================================
/*
Tạo file .env.local ở thư mục gốc của project:

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB2Nh4TfIOAuPpO18DdTmTKmJCVgasoWFI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-573fc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://prompt-573fc-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-573fc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-573fc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=362695103484
NEXT_PUBLIC_FIREBASE_APP_ID=1:362695103484:web:036d2d722e6754aeaed879
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9X3DY739S9

Nếu sử dụng Vercel, thêm vào Environment Variables trong Vercel Dashboard
*/

// ==================================================
// 2. FIREBASE AUTHENTICATION SETUP
// ==================================================
/*
Bước 1: Vào Firebase Console (https://console.firebase.google.com)
Bước 2: Chọn project "prompt-573fc"
Bước 3: Authentication
   - Chọn "Get started"
   - Enable "Email/Password"
   - Enable "Anonymous" (nếu cần)
   - Enable "Google" (tùy chọn)
   - Cấu hình Authorized domains:
     * localhost:3000
     * localhost:5173
     * vercel.app
     * Tên miền của bạn

Bước 4: Settings -> Users and permissions
   - Để ý rằng Realtime Database sử dụng UID từ Auth
   - Mỗi user được tạo trong Auth sẽ có UID duy nhất
*/

// ==================================================
// 3. REALTIME DATABASE SETUP
// ==================================================
/*
Bước 1: Firebase Console -> Realtime Database
Bước 2: Tạo database (nếu chưa có)
   - Chọn location: asia-southeast1 (hoặc gần nhất)
   - Start in Test Mode (dev) hoặc Production (prod)

Bước 3: Import các rules từ firebase-rules.json
   - Vào Rules tab
   - Copy nội dung từ firebase-rules.json
   - Publish

Bước 4: Cấu trúc Database sẽ như sau:
  users/
    {userId}/
      email, name, userType, avatar...
      lastLogin, createdAt...
  prompts/
    {promptId}/
      title, content, tags, isPublic...
  messages/
    {messageId}/
      userId, content, createdAt...
  conversations/
    {conversationId}/
      participants: [...], messages: [...]
*/

// ==================================================
// 4. FIRESTORE SETUP
// ==================================================
/*
Bước 1: Firebase Console -> Firestore Database
Bước 2: Tạo database (nếu chưa có)
   - Chọn location: asia-southeast1
   - Start in Production Mode (vì rules sẽ kiểm soát)

Bước 3: Import các rules từ firestore.rules
   - Vào Rules tab
   - Copy nội dung từ firestore.rules
   - Publish

Bước 4: Tạo collections cần thiết:
  - prompts (documents: promptId)
  - messages (documents: messageId)
  - conversations (documents: conversationId)
  - users (documents: userId)
  - activityLogs (documents: logId)
  - sharedPrompts (documents: sharedId)

Bước 5: Index creation
  - Firestore sẽ tự động tạo composite indexes
  - Nếu query phức tạp, vào Cloud Firestore Indexes
*/

// ==================================================
// 5. CLOUD STORAGE SETUP
// ==================================================
/*
Bước 1: Firebase Console -> Cloud Storage
Bước 2: Tạo bucket (nếu chưa có)
   - Chọn location: asia-southeast1
   - Start in Test Mode

Bước 3: Import các rules từ storage.rules
   - Vào Rules tab
   - Copy nội dung từ storage.rules
   - Publish

Bước 4: Cấu trúc thư mục Storage:
  avatars/
    {userId}/
      avatar.jpg, avatar.png...
  documents/
    {userId}/
      file1.pdf, file2.docx...
  prompts/
    {promptId}/
      {userId}/
        resource1.pdf...
  public/
    images/
      image1.jpg, image2.png...
  shared/
    {sharedId}/
      {userId}/
        file1.pdf...
  temp/
    {tempId}/
      uploadedFile.pdf...
*/

// ==================================================
// 6. SỬ DỤNG FIREBASE MANAGER
// ==================================================

// Ví dụ 1: Đăng ký người dùng
async function registerNewUser() {
    const result = await firebaseManager.register(
        'user@example.com',
        'password123',
        'Tên Người Dùng',
        'student'
    );
    
    if (result.success) {
        console.log('✅ User registered:', result.userId);
    } else {
        console.log('❌ Error:', result.error);
    }
}

// Ví dụ 2: Đăng nhập
async function loginUser() {
    const result = await firebaseManager.login(
        'user@example.com',
        'password123'
    );
    
    if (result.success) {
        console.log('✅ User logged in:', result.userId);
    }
}

// Ví dụ 3: Lưu dữ liệu vào Realtime Database
async function savePrompt() {
    const promptData = {
        title: 'Prompt tiêu đề',
        content: 'Nội dung prompt',
        tags: ['toán', 'lý thuyết'],
        isPublic: true,
        createdAt: new Date().toISOString(),
        createdBy: firebaseManager.getCurrentUserId()
    };
    
    const userId = firebaseManager.getCurrentUserId();
    const result = await firebaseManager.saveData(
        `users/${userId}/prompts`,
        promptData
    );
    
    if (result.success) {
        console.log('✅ Prompt saved');
    }
}

// Ví dụ 4: Lắng nghe dữ liệu real-time
function listenToUserData() {
    const userId = firebaseManager.getCurrentUserId();
    
    firebaseManager.listenToData(
        `users/${userId}`,
        (userData) => {
            console.log('📊 User data updated:', userData);
            // Cập nhật UI với userData
        },
        (error) => {
            console.error('❌ Error:', error);
        }
    );
}

// Ví dụ 5: Thêm tài liệu vào Firestore
async function createPromptInFirestore() {
    const result = await firebaseManager.addFirestoreDocument('prompts', {
        title: 'Prompt tiêu đề',
        content: 'Nội dung',
        tags: ['toán'],
        isPublic: true,
        createdBy: firebaseManager.getCurrentUserId()
    });
    
    if (result.success) {
        console.log('✅ Document created:', result.docId);
    }
}

// Ví dụ 6: Upload file
async function uploadUserAvatar() {
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];
    
    if (file) {
        const userId = firebaseManager.getCurrentUserId();
        const path = `avatars/${userId}/${file.name}`;
        
        const result = await firebaseManager.uploadFile(path, file);
        
        if (result.success) {
            console.log('✅ File uploaded:', result.url);
        }
    }
}

// Ví dụ 7: Lắng nghe Firestore collection
function listenToPrompts() {
    firebaseManager.listenToFirestoreCollection(
        'prompts',
        (prompts) => {
            console.log('📊 Prompts updated:', prompts);
            // Cập nhật UI với list prompts
        },
        (error) => {
            console.error('❌ Error:', error);
        }
    );
}

// ==================================================
// 7. PRODUCTION CHECKLIST
// ==================================================

const productionChecklist = {
    authentication: [
        '✅ Email/Password authentication enabled',
        '✅ Anonymous authentication enabled (nếu cần)',
        '✅ Authorized domains configured',
        '✅ Password requirements set'
    ],
    
    realtimeDatabase: [
        '✅ Database rules deployed (from firebase-rules.json)',
        '✅ Backup enabled',
        '✅ RTDB metrics monitored'
    ],
    
    firestore: [
        '✅ Firestore rules deployed (from firestore.rules)',
        '✅ Collections created',
        '✅ Composite indexes created (if needed)',
        '✅ Backups enabled'
    ],
    
    storage: [
        '✅ Storage rules deployed (from storage.rules)',
        '✅ File size limits enforced',
        '✅ CORS configured (if needed)',
        '✅ Lifecycle rules set (delete old temp files)'
    ],
    
    security: [
        '✅ Environment variables configured',
        '✅ API key restrictions applied',
        '✅ Domain whitelist configured',
        '✅ Rate limiting considered',
        '✅ Data encryption enabled'
    ],
    
    monitoring: [
        '✅ Firebase Console alerts set',
        '✅ Error tracking configured',
        '✅ Performance monitoring enabled',
        '✅ Usage quota alerts set'
    ]
};

// ==================================================
// 8. TROUBLESHOOTING
// ==================================================

const troubleshooting = {
    'Auth/user-not-found': 'Email không tồn tại - Kiểm tra đơn vị dữ liệu',
    'Auth/wrong-password': 'Mật khẩu sai - Hướng dẫn user reset',
    'Permission denied': 'Firestore/RTDB rules - Kiểm tra rules, uid, collection path',
    'Storage/object-not-found': 'File không tồn tại - Kiểm tra storage path',
    'Network error': 'Kiểm tra internet, CORS, domain whitelist',
    'Quota exceeded': 'Vượt quá quota - Nâng cấp plan hoặc optimize queries'
};

// ==================================================
// 9. PERFORMANCE OPTIMIZATION
// ==================================================

const optimizationTips = [
    'Sử dụng pagination cho collections lớn',
    'Cache dữ liệu local khi có thể',
    'Unsubscribe listeners khi không dùng (firebaseManager.stopListening)',
    'Tránh N+1 queries - dùng batch operations',
    'Index các fields được query thường xuyên',
    'Dùng Cloud Functions cho logic phức tạp',
    'Monitor storage usage - set lifecycle rules',
    'Sử dụng offline persistence cho better UX'
];

console.log('✅ Firebase Setup Guide loaded');
