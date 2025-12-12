// ==========================================
// FIREBASE AUTHENTICATION & USER MANAGEMENT
// ==========================================

/**
 * Đăng ký tài khoản mới với email và password
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @param {string} name - Tên người dùng
 * @param {string} userType - Loại người dùng (student/teacher)
 * @returns {Promise}
 */
async function firebaseSignUp(email, password, name, userType = 'student') {
    try {
        // Đăng ký tài khoản Firebase Auth
        const userCredential = await window.firebaseCreateUserWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
        );
        
        const user = userCredential.user;
        const userId = user.uid;
        
        // Lưu thông tin người dùng vào Realtime Database
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        
        await window.firebaseSet(userRef, {
            id: userId,
            email: email,
            name: name,
            userType: userType,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            favorites: [],
            friends: [],
            customPrompts: [],
            sharedPrompts: [],
            settings: {
                theme: 'dark',
                language: 'vi'
            }
        });
        
        console.log('✅ Đăng ký thành công:', userId);
        showToast(`✓ Chào mừng ${name}! Đăng ký thành công.`);
        
        return { success: true, userId };
    } catch (error) {
        console.error('❌ Lỗi đăng ký:', error.message);
        
        let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'Email này đã được sử dụng.';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Email không hợp lệ.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}

/**
 * Đăng nhập với email và password
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise}
 */
async function firebaseLogin(email, password) {
    try {
        const userCredential = await window.firebaseSignInWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
        );
        
        const user = userCredential.user;
        const userId = user.uid;
        
        // Cập nhật thời gian đăng nhập cuối cùng
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        await window.firebaseUpdate(userRef, {
            lastLogin: new Date().toISOString()
        });
        
        console.log('✅ Đăng nhập thành công:', userId);
        showToast('✓ Đăng nhập thành công!');
        
        return { success: true, userId };
    } catch (error) {
        console.error('❌ Lỗi đăng nhập:', error.message);
        
        let errorMsg = 'Đăng nhập thất bại.';
        
        if (error.code === 'auth/user-not-found') {
            errorMsg = 'Email không tồn tại.';
        } else if (error.code === 'auth/wrong-password') {
            errorMsg = 'Mật khẩu không chính xác.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Email không hợp lệ.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}

/**
 * Đăng xuất khỏi tài khoản
 * @returns {Promise}
 */
async function firebaseLogout() {
    try {
        await window.firebaseSignOut(window.firebaseAuth);
        console.log('✅ Đã đăng xuất.');
        showToast('✓ Đăng xuất thành công!');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi đăng xuất:', error.message);
        showToast('❌ Lỗi đăng xuất. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Gửi email reset mật khẩu
 * @param {string} email - Email người dùng
 * @returns {Promise}
 */
async function firebaseSendPasswordReset(email) {
    try {
        await window.firebaseSendPasswordResetEmail(window.firebaseAuth, email);
        console.log('✅ Email reset mật khẩu đã được gửi.');
        showToast('✓ Email reset mật khẩu đã được gửi! Kiểm tra hộp thư của bạn.');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi gửi email reset:', error.message);
        
        let errorMsg = 'Không thể gửi email reset.';
        
        if (error.code === 'auth/user-not-found') {
            errorMsg = 'Email không tồn tại trong hệ thống.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Email không hợp lệ.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}

/**
 * Lấy thông tin người dùng hiện tại từ Realtime Database
 * @param {string} userId - ID của người dùng
 * @returns {Promise}
 */
async function getUserData(userId) {
    try {
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        const snapshot = await window.firebaseGet(userRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('Người dùng không có dữ liệu.');
            return null;
        }
    } catch (error) {
        console.error('❌ Lỗi lấy dữ liệu người dùng:', error);
        return null;
    }
}

/**
 * Cập nhật thông tin người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} updates - Các trường cần cập nhật
 * @returns {Promise}
 */
async function updateUserData(userId, updates) {
    try {
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        await window.firebaseUpdate(userRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Cập nhật thông tin người dùng thành công.');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi cập nhật thông tin:', error);
        showToast('❌ Lỗi cập nhật thông tin. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Theo dõi trạng thái đăng nhập (Real-time)
 * @param {Function} callback - Hàm callback khi trạng thái thay đổi
 */
function watchAuthState(callback) {
    return window.firebaseOnAuthStateChanged(window.firebaseAuth, async (user) => {
        if (user) {
            console.log('✅ Người dùng đăng nhập:', user.uid);
            
            // Lấy dữ liệu người dùng từ Database
            const userData = await getUserData(user.uid);
            
            if (userData) {
                // Lưu vào state global
                state.currentUser = {
                    id: user.uid,
                    email: user.email,
                    ...userData
                };
                
                // Lưu vào localStorage để truy cập nhanh
                localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
                
                callback(state.currentUser);
            }
        } else {
            console.log('❌ Người dùng chưa đăng nhập.');
            state.currentUser = null;
            localStorage.removeItem('pm_currentUser');
            callback(null);
        }
    });
}

/**
 * Thêm bạn bè (sync qua Firebase)
 * @param {string} userId - ID của người dùng hiện tại
 * @param {Object} friendData - Dữ liệu bạn bè
 * @returns {Promise}
 */
async function addFriendToFirebase(userId, friendData) {
    try {
        const friendsRef = window.firebaseRef(window.firebaseDB, `users/${userId}/friends`);
        
        // Tạo friend entry
        const newFriendRef = window.firebasePush(friendsRef);
        await window.firebaseSet(newFriendRef, {
            ...friendData,
            addedAt: new Date().toISOString()
        });
        
        console.log('✅ Thêm bạn thành công.');
        showToast('✓ Thêm bạn thành công!');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi thêm bạn:', error);
        showToast('❌ Không thể thêm bạn. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Xóa bạn bè (sync qua Firebase)
 * @param {string} userId - ID của người dùng hiện tại
 * @param {string} friendKey - Key của bạn cần xóa
 * @returns {Promise}
 */
async function removeFriendFromFirebase(userId, friendKey) {
    try {
        const friendRef = window.firebaseRef(window.firebaseDB, `users/${userId}/friends/${friendKey}`);
        await window.firebaseRemove(friendRef);
        
        console.log('✅ Xóa bạn thành công.');
        showToast('✓ Xóa bạn thành công!');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi xóa bạn:', error);
        showToast('❌ Không thể xóa bạn. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Lưu custom prompt vào Firebase
 * @param {string} userId - ID của người dùng
 * @param {Object} promptData - Dữ liệu prompt
 * @returns {Promise}
 */
async function saveCustomPromptToFirebase(userId, promptData) {
    try {
        const promptsRef = window.firebaseRef(window.firebaseDB, `users/${userId}/customPrompts`);
        
        const newPromptRef = window.firebasePush(promptsRef);
        const promptId = newPromptRef.key;
        
        await window.firebaseSet(newPromptRef, {
            id: promptId,
            ...promptData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Lưu prompt thành công.');
        showToast('✓ Prompt đã được lưu!');
        return { success: true, promptId };
    } catch (error) {
        console.error('❌ Lỗi lưu prompt:', error);
        showToast('❌ Không thể lưu prompt. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Xóa custom prompt từ Firebase
 * @param {string} userId - ID của người dùng
 * @param {string} promptKey - Key của prompt cần xóa
 * @returns {Promise}
 */
async function deleteCustomPromptFromFirebase(userId, promptKey) {
    try {
        const promptRef = window.firebaseRef(window.firebaseDB, `users/${userId}/customPrompts/${promptKey}`);
        await window.firebaseRemove(promptRef);
        
        console.log('✅ Xóa prompt thành công.');
        showToast('✓ Prompt đã được xóa!');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi xóa prompt:', error);
        showToast('❌ Không thể xóa prompt. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Theo dõi thay đổi dữ liệu người dùng (Real-time sync)
 * @param {string} userId - ID của người dùng
 * @param {Function} callback - Hàm callback khi dữ liệu thay đổi
 */
function listenToUserChanges(userId, callback) {
    const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
    
    return window.firebaseOnValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            state.currentUser = {
                id: userId,
                ...userData
            };
            localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
            callback(userData);
        }
    }, (error) => {
        console.error('❌ Lỗi theo dõi thay đổi:', error);
    });
}

/**
 * Chia sẻ prompt với bạn bè
 * @param {string} userId - ID của người dùng (người chia sẻ)
 * @param {Array<string>} friendIds - Danh sách ID bạn bè cần chia sẻ
 * @param {Object} promptData - Dữ liệu prompt
 * @returns {Promise}
 */
async function sharePromptWithFriends(userId, friendIds, promptData) {
    try {
        const sharedPromptData = {
            ...promptData,
            sharedBy: userId,
            sharedAt: new Date().toISOString()
        };
        
        // Tạo shared prompt entry
        const sharedRef = window.firebaseRef(window.firebaseDB, `users/${userId}/sharedPrompts`);
        const newSharedRef = window.firebasePush(sharedRef);
        
        await window.firebaseSet(newSharedRef, {
            ...sharedPromptData,
            sharedWith: friendIds
        });
        
        // Thêm vào danh sách prompt chia sẻ của bạn bè
        for (const friendId of friendIds) {
            const friendSharedRef = window.firebaseRef(window.firebaseDB, `users/${friendId}/sharedPrompts`);
            const newFriendSharedRef = window.firebasePush(friendSharedRef);
            
            await window.firebaseSet(newFriendSharedRef, {
                ...sharedPromptData,
                sharedBy: userId
            });
        }
        
        console.log('✅ Chia sẻ prompt thành công.');
        showToast('✓ Prompt đã được chia sẻ!');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi chia sẻ prompt:', error);
        showToast('❌ Không thể chia sẻ prompt. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

console.log('✅ auth.js loaded successfully');
