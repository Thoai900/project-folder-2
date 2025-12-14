/**
 * ===================================================
 * FIREBASE MANAGER - Quản lý tất cả Firebase operations
 * ===================================================
 * Tập trung: Realtime Database + Firestore + Storage + Auth
 * Tính năng: Error handling, Logging, Retry logic, Real-time updates
 */

class FirebaseManager {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDB; // Realtime Database
        this.firestore = window.db; // Firestore
        this.storage = window.firebaseStorage;
        
        // State tracking
        this.currentUser = null;
        this.listeners = new Map();
        this.pendingOperations = new Map();
        
        // Initialize
        this.initializeAuth();
    }

    /**
     * ========== INITIALIZATION ==========
     */
    
    async initializeAuth() {
        try {
            window.firebaseOnAuthStateChanged(this.auth, async (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ User authenticated:', user.uid);
                    this.logEvent('user_authenticated', { userId: user.uid });
                } else {
                    console.log('⚠️ User logged out');
                    this.logEvent('user_logged_out');
                }
            });
        } catch (error) {
            this.handleError('initializeAuth', error);
        }
    }

    /**
     * ========== AUTHENTICATION FUNCTIONS ==========
     */

    /**
     * Đăng ký người dùng mới
     */
    async register(email, password, name, userType = 'student') {
        try {
            // Validate input
            if (!email || !password || password.length < 6) {
                throw new Error('Email và mật khẩu không hợp lệ');
            }

            // Create user in Firebase Auth
            const userCredential = await window.firebaseCreateUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );

            const user = userCredential.user;
            const userId = user.uid;

            // Create user profile in Realtime Database
            const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
            const userProfile = {
                id: userId,
                email: email,
                name: name || email.split('@')[0],
                userType: userType,
                avatar: null,
                phone: null,
                isAnonymous: false,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    language: 'vi',
                    notifications: true
                },
                stats: {
                    promptsCreated: 0,
                    promptsUsed: 0,
                    lastActivityAt: new Date().toISOString()
                }
            };

            await window.firebaseSet(userRef, userProfile);

            // Also create in Firestore for structured queries
            await window.addDoc(window.collection(this.firestore, 'users'), {
                uid: userId,
                email: email,
                name: name || email.split('@')[0],
                userType: userType,
                createdAt: window.serverTimestamp(),
                avatar: null
            });

            console.log('✅ User registered successfully:', userId);
            this.logEvent('user_registered', { userId, email, userType });

            return {
                success: true,
                userId: userId,
                user: userProfile
            };

        } catch (error) {
            return this.handleAuthError('register', error);
        }
    }

    /**
     * Đăng nhập người dùng
     */
    async login(email, password) {
        try {
            const userCredential = await window.firebaseSignInWithEmailAndPassword(
                this.auth,
                email,
                password
            );

            const user = userCredential.user;
            const userId = user.uid;

            // Update last login time
            const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
            await window.firebaseUpdate(userRef, {
                lastLogin: new Date().toISOString()
            });

            console.log('✅ User logged in successfully:', userId);
            this.logEvent('user_logged_in', { userId, email });

            return {
                success: true,
                userId: userId,
                user: user
            };

        } catch (error) {
            return this.handleAuthError('login', error);
        }
    }

    /**
     * Đăng nhập ẩn danh
     */
    async loginAnonymously() {
        try {
            const userCredential = await window.firebaseSignInAnonymously(this.auth);
            const user = userCredential.user;

            console.log('✅ Anonymous login successful:', user.uid);
            this.logEvent('anonymous_login');

            return {
                success: true,
                userId: user.uid,
                user: user
            };

        } catch (error) {
            return this.handleAuthError('loginAnonymously', error);
        }
    }

    /**
     * Đăng xuất
     */
    async logout() {
        try {
            await window.firebaseSignOut(this.auth);
            console.log('✅ User logged out');
            this.logEvent('user_logged_out');

            return { success: true };

        } catch (error) {
            return this.handleAuthError('logout', error);
        }
    }

    /**
     * Gửi email reset mật khẩu
     */
    async sendPasswordReset(email) {
        try {
            await window.firebaseSendPasswordResetEmail(this.auth, email);
            console.log('✅ Password reset email sent to:', email);
            this.logEvent('password_reset_sent', { email });

            return {
                success: true,
                message: 'Email reset mật khẩu đã được gửi. Kiểm tra hộp thư của bạn.'
            };

        } catch (error) {
            return this.handleAuthError('sendPasswordReset', error);
        }
    }

    /**
     * ========== REALTIME DATABASE FUNCTIONS ==========
     */

    /**
     * Lưu dữ liệu vào Realtime Database
     */
    async saveData(path, data) {
        try {
            const ref = window.firebaseRef(window.firebaseDB, path);
            await window.firebaseSet(ref, data);
            console.log(`✅ Data saved to ${path}:`, data);
            return { success: true };

        } catch (error) {
            return this.handleError(`saveData(${path})`, error);
        }
    }

    /**
     * Cập nhật dữ liệu trong Realtime Database
     */
    async updateData(path, updates) {
        try {
            const ref = window.firebaseRef(window.firebaseDB, path);
            await window.firebaseUpdate(ref, updates);
            console.log(`✅ Data updated at ${path}:`, updates);
            return { success: true };

        } catch (error) {
            return this.handleError(`updateData(${path})`, error);
        }
    }

    /**
     * Đọc dữ liệu từ Realtime Database (một lần)
     */
    async getData(path) {
        try {
            const ref = window.firebaseRef(window.firebaseDB, path);
            const snapshot = await window.firebaseGet(ref);
            
            if (snapshot.exists()) {
                console.log(`✅ Data retrieved from ${path}`);
                return { success: true, data: snapshot.val() };
            } else {
                console.log(`⚠️ No data at ${path}`);
                return { success: true, data: null };
            }

        } catch (error) {
            return this.handleError(`getData(${path})`, error);
        }
    }

    /**
     * Lắng nghe thay đổi dữ liệu (Real-time)
     */
    listenToData(path, callback, onError = null) {
        try {
            const ref = window.firebaseRef(window.firebaseDB, path);
            
            const unsubscribe = window.firebaseOnValue(
                ref,
                (snapshot) => {
                    const data = snapshot.val();
                    console.log(`🔄 Data updated at ${path}:`, data);
                    callback(data);
                },
                (error) => {
                    console.error(`❌ Listen error at ${path}:`, error);
                    if (onError) onError(error);
                }
            );

            // Store unsubscribe function for cleanup
            this.listeners.set(path, unsubscribe);
            console.log(`✅ Listener attached to ${path}`);

            return unsubscribe;

        } catch (error) {
            this.handleError(`listenToData(${path})`, error);
            return null;
        }
    }

    /**
     * Dừng lắng nghe dữ liệu
     */
    stopListening(path) {
        if (this.listeners.has(path)) {
            this.listeners.get(path)();
            this.listeners.delete(path);
            console.log(`✅ Listener removed from ${path}`);
        }
    }

    /**
     * Xóa dữ liệu
     */
    async deleteData(path) {
        try {
            const ref = window.firebaseRef(window.firebaseDB, path);
            await window.firebaseRemove(ref);
            console.log(`✅ Data deleted from ${path}`);
            return { success: true };

        } catch (error) {
            return this.handleError(`deleteData(${path})`, error);
        }
    }

    /**
     * ========== FIRESTORE FUNCTIONS ==========
     */

    /**
     * Thêm tài liệu vào Firestore
     */
    async addFirestoreDocument(collectionName, data) {
        try {
            const collectionRef = window.collection(this.firestore, collectionName);
            const docRef = await window.addDoc(collectionRef, {
                ...data,
                createdAt: window.serverTimestamp(),
                updatedAt: window.serverTimestamp()
            });

            console.log(`✅ Document added to ${collectionName}:`, docRef.id);
            return { success: true, docId: docRef.id };

        } catch (error) {
            return this.handleError(`addFirestoreDocument(${collectionName})`, error);
        }
    }

    /**
     * Cập nhật tài liệu Firestore
     */
    async updateFirestoreDocument(collectionName, docId, updates) {
        try {
            const docRef = window.firebaseDoc(this.firestore, collectionName, docId);
            await window.firebaseUpdateDoc(docRef, {
                ...updates,
                updatedAt: window.serverTimestamp()
            });

            console.log(`✅ Document updated in ${collectionName}/${docId}`);
            return { success: true };

        } catch (error) {
            return this.handleError(`updateFirestoreDocument(${collectionName}/${docId})`, error);
        }
    }

    /**
     * Xóa tài liệu Firestore
     */
    async deleteFirestoreDocument(collectionName, docId) {
        try {
            const docRef = window.firebaseDoc(this.firestore, collectionName, docId);
            await window.firebaseDeleteDoc(docRef);

            console.log(`✅ Document deleted from ${collectionName}/${docId}`);
            return { success: true };

        } catch (error) {
            return this.handleError(`deleteFirestoreDocument(${collectionName}/${docId})`, error);
        }
    }

    /**
     * Lắng nghe Firestore collection
     */
    listenToFirestoreCollection(collectionName, callback, onError = null) {
        try {
            const collectionRef = window.collection(this.firestore, collectionName);
            const q = window.query(
                collectionRef,
                window.orderBy('createdAt', 'desc')
            );

            const unsubscribe = window.onSnapshot(
                q,
                (snapshot) => {
                    const documents = [];
                    snapshot.forEach((doc) => {
                        documents.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    console.log(`🔄 Collection ${collectionName} updated:`, documents.length, 'documents');
                    callback(documents);
                },
                (error) => {
                    console.error(`❌ Listen error on ${collectionName}:`, error);
                    if (onError) onError(error);
                }
            );

            this.listeners.set(collectionName, unsubscribe);
            return unsubscribe;

        } catch (error) {
            this.handleError(`listenToFirestoreCollection(${collectionName})`, error);
            return null;
        }
    }

    /**
     * ========== STORAGE FUNCTIONS ==========
     */

    /**
     * Upload file lên Storage
     */
    async uploadFile(path, file) {
        try {
            // Validate file
            if (!file || file.size === 0) {
                throw new Error('File is empty or invalid');
            }

            const storageRefPath = window.storageRef(this.storage, path);
            const snapshot = await window.uploadBytes(storageRefPath, file);

            // Get download URL
            const downloadURL = await window.getDownloadURL(snapshot.ref);

            console.log(`✅ File uploaded to ${path}:`, downloadURL);
            this.logEvent('file_uploaded', { path, size: file.size });

            return {
                success: true,
                url: downloadURL,
                path: path
            };

        } catch (error) {
            return this.handleError(`uploadFile(${path})`, error);
        }
    }

    /**
     * Xóa file khỏi Storage
     */
    async deleteFile(path) {
        try {
            const fileRef = window.storageRef(this.storage, path);
            await window.deleteObject(fileRef);

            console.log(`✅ File deleted from ${path}`);
            return { success: true };

        } catch (error) {
            return this.handleError(`deleteFile(${path})`, error);
        }
    }

    /**
     * Tải file từ Storage
     */
    async downloadFile(path) {
        try {
            const fileRef = window.storageRef(this.storage, path);
            const url = await window.getDownloadURL(fileRef);

            console.log(`✅ Download URL retrieved for ${path}`);
            return { success: true, url };

        } catch (error) {
            return this.handleError(`downloadFile(${path})`, error);
        }
    }

    /**
     * ========== ERROR HANDLING & LOGGING ==========
     */

    /**
     * Xử lý lỗi xác thực
     */
    handleAuthError(operation, error) {
        const errorMessages = {
            'auth/user-not-found': 'Email không tồn tại trong hệ thống',
            'auth/wrong-password': 'Mật khẩu không chính xác',
            'auth/email-already-in-use': 'Email đã được đăng ký',
            'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
            'auth/invalid-email': 'Email không hợp lệ',
            'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
            'auth/network-request-failed': 'Lỗi kết nối mạng'
        };

        const message = errorMessages[error.code] || error.message;
        console.error(`❌ Auth Error [${operation}]:`, error.code, message);
        this.logEvent('auth_error', { operation, errorCode: error.code });

        return {
            success: false,
            error: message,
            errorCode: error.code
        };
    }

    /**
     * Xử lý lỗi chung
     */
    handleError(operation, error) {
        console.error(`❌ Error [${operation}]:`, error.message);
        this.logEvent('operation_error', { operation, errorMessage: error.message });

        return {
            success: false,
            error: error.message,
            operation
        };
    }

    /**
     * Ghi log sự kiện
     */
    logEvent(eventName, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.uid || 'anonymous',
            event: eventName,
            ...data
        };

        console.log(`📊 Event: ${eventName}`, logEntry);

        // Optional: Send to server for analytics
        // this.sendAnalytics(logEntry);
    }

    /**
     * ========== UTILITY FUNCTIONS ==========
     */

    /**
     * Lấy người dùng hiện tại
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Kiểm tra người dùng đã đăng nhập chưa
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Lấy User ID hiện tại
     */
    getCurrentUserId() {
        return this.currentUser?.uid || null;
    }

    /**
     * Dọn dẹp (cleanup) tất cả listeners
     */
    cleanup() {
        this.listeners.forEach((unsubscribe, path) => {
            unsubscribe();
        });
        this.listeners.clear();
        console.log('✅ All listeners cleaned up');
    }
}

// Tạo instance toàn cục
const firebaseManager = new FirebaseManager();

// Xuất cho sử dụng
window.firebaseManager = firebaseManager;

console.log('✅ Firebase Manager initialized');
