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
            } else {
                // User exists nhưng không có data - có thể permission denied
                // Tạo user profile từ auth user
                console.log('⚠️ Tạo user profile mới');
                
                try {
                    const userRef = window.firebaseRef(window.firebaseDB, `users/${user.uid}`);
                    const newUserData = {
                        id: user.uid,
                        email: user.email,
                        phone: null,
                        name: user.displayName || user.email.split('@')[0],
                        userType: 'student',
                        isAnonymous: user.isAnonymous || false,
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
                    };
                    
                    await window.firebaseSet(userRef, newUserData);
                    
                    state.currentUser = newUserData;
                    localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
                    callback(state.currentUser);
                } catch (error) {
                    console.error('❌ Lỗi tạo user profile:', error);
                    callback(null);
                }
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
/**
 * Gửi email verification (magic link) để đăng nhập
 * @param {string} email - Email người dùng
 * @param {Object} actionCodeSettings - Cấu hình email action
 * @returns {Promise}
 */
async function sendEmailVerification(email) {
    try {
        const actionCodeSettings = {
            url: `${window.location.origin}?email=${encodeURIComponent(email)}`,
            handleCodeInApp: true
        };
        
        await window.firebaseSendSignInLinkToEmail(window.firebaseAuth, email, actionCodeSettings);
        
        // Lưu email vào localStorage để xác minh sau
        window.localStorage.setItem('emailForSignIn', email);
        
        console.log('✅ Email xác minh đã được gửi.');
        showToast('✓ Email xác minh đã được gửi! Kiểm tra hộp thư của bạn.');
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi gửi email xác minh:', error.message);
        
        let errorMsg = 'Không thể gửi email xác minh.';
        
        if (error.code === 'auth/invalid-email') {
            errorMsg = 'Email không hợp lệ.';
        } else if (error.code === 'auth/missing-email') {
            errorMsg = 'Vui lòng nhập email.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}

/**
 * Đăng nhập bằng email verification link
 * @param {string} email - Email người dùng
 * @param {string} name - Tên người dùng
 * @param {string} userType - Loại người dùng (student/teacher)
 * @returns {Promise}
 */
async function signInWithEmailLink(email, name, userType = 'student') {
    try {
        // Kiểm tra xem đây có phải là email verification link không
        if (window.firebaseAuth.isSignInWithEmailLink(window.location.href)) {
            // Đăng nhập người dùng
            const userCredential = await window.firebaseAuth.signInWithEmailLink(email, window.location.href);
            const user = userCredential.user;
            const userId = user.uid;
            
            // Xóa email khỏi localStorage
            window.localStorage.removeItem('emailForSignIn');
            
            // Kiểm tra xem người dùng có tồn tại không
            const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
            const snapshot = await window.firebaseGet(userRef);
            
            // Nếu người dùng mới, tạo profile
            if (!snapshot.exists()) {
                await window.firebaseSet(userRef, {
                    id: userId,
                    email: email,
                    name: name || email.split('@')[0],
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
            } else {
                // Cập nhật thời gian đăng nhập cuối cùng
                await window.firebaseUpdate(userRef, {
                    lastLogin: new Date().toISOString()
                });
            }
            
            console.log('✅ Đăng nhập bằng email link thành công:', userId);
            showToast('✓ Đăng nhập thành công!');
            
            return { success: true, userId };
        } else {
            return { success: false, error: 'Đây không phải là email verification link hợp lệ.' };
        }
    } catch (error) {
        console.error('❌ Lỗi đăng nhập email link:', error.message);
        showToast('❌ Lỗi đăng nhập. Vui lòng kiểm tra email của bạn.');
        return { success: false, error: error.message };
    }
}

/**
 * Đăng nhập ẩn danh (Guest)
 * @param {string} guestName - Tên khách (tùy chọn)
 * @returns {Promise}
 */
async function firebaseGuestLogin(guestName = 'Guest') {
    try {
        const userCredential = await window.firebaseSignInAnonymously(window.firebaseAuth);
        const user = userCredential.user;
        const userId = user.uid;
        
        // Lưu thông tin guest vào Realtime Database
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        
        await window.firebaseSet(userRef, {
            id: userId,
            email: null,
            name: guestName,
            userType: 'guest',
            isAnonymous: true,
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
        
        console.log('✅ Đăng nhập ẩn danh thành công:', userId);
        showToast(`✓ Chào mừng ${guestName}!`);
        
        return { success: true, userId };
    } catch (error) {
        console.error('❌ Lỗi đăng nhập ẩn danh:', error.message);
        showToast('❌ Không thể đăng nhập ẩn danh. Vui lòng thử lại.');
        return { success: false, error: error.message };
    }
}

/**
 * Khởi tạo reCAPTCHA cho đăng nhập bằng SMS
 * @param {string} containerId - ID của container chứa reCAPTCHA
 * @returns {RecaptchaVerifier}
 */
function initializeRecaptcha(containerId = 'recaptcha-container') {
    try {
        // Kiểm tra container tồn tại
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container không tồn tại:', containerId);
            return null;
        }

        const recaptchaVerifier = new window.firebaseRecaptchaVerifier(window.firebaseAuth, containerId, {
            size: 'normal',
            callback: (response) => {
                console.log('✅ reCAPTCHA verified:', response);
            },
            'expired-callback': () => {
                console.log('⚠️ reCAPTCHA expired');
            },
            'error-callback': (error) => {
                console.error('❌ reCAPTCHA error:', error);
            }
        });
        
        return recaptchaVerifier;
    } catch (error) {
        console.error('❌ Lỗi khởi tạo reCAPTCHA:', error.message);
        showToast('❌ Lỗi khởi tạo reCAPTCHA. Hãy tải lại trang.');
        return null;
    }
}

/**
 * Gửi mã OTP đến số điện thoại
 * @param {string} phoneNumber - Số điện thoại (định dạng: +84xxxxxxxxx)
 * @param {string} containerId - ID của container chứa reCAPTCHA
 * @returns {Promise}
 */
async function sendPhoneOTP(phoneNumber, containerId = 'recaptcha-container') {
    try {
        const recaptchaVerifier = initializeRecaptcha(containerId);
        
        if (!recaptchaVerifier) {
            return { success: false, error: 'Lỗi khởi tạo reCAPTCHA' };
        }
        
        const appVerifier = recaptchaVerifier;
        const confirmationResult = await window.firebaseSignInWithPhoneNumber(
            window.firebaseAuth,
            phoneNumber,
            appVerifier
        );
        
        // Lưu confirmationResult để xác minh OTP sau
        window.phoneAuthConfirmationResult = confirmationResult;
        
        console.log('✅ OTP đã được gửi đến số điện thoại.');
        showToast('✓ Mã OTP đã được gửi! Kiểm tra tin nhắn của bạn.');
        
        return { success: true, confirmationResult };
    } catch (error) {
        console.error('❌ Lỗi gửi OTP:', error.message);
        
        let errorMsg = 'Không thể gửi OTP.';
        
        if (error.code === 'auth/invalid-phone-number') {
            errorMsg = 'Số điện thoại không hợp lệ. Sử dụng định dạng: +84xxxxxxxxx';
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
        } else if (error.code === 'auth/captcha-check-failed') {
            errorMsg = 'reCAPTCHA verification thất bại.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}

/**
 * Xác minh mã OTP và đăng nhập
 * @param {string} otp - Mã OTP từ tin nhắn
 * @param {string} phoneNumber - Số điện thoại
 * @param {string} name - Tên người dùng
 * @param {string} userType - Loại người dùng (student/teacher)
 * @returns {Promise}
 */
async function verifyPhoneOTP(otp, phoneNumber, name, userType = 'student') {
    try {
        if (!window.phoneAuthConfirmationResult) {
            return { success: false, error: 'Vui lòng gửi OTP trước.' };
        }
        
        const userCredential = await window.phoneAuthConfirmationResult.confirm(otp);
        const user = userCredential.user;
        const userId = user.uid;
        
        // Kiểm tra xem người dùng có tồn tại không
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        const snapshot = await window.firebaseGet(userRef);
        
        // Nếu người dùng mới, tạo profile
        if (!snapshot.exists()) {
            await window.firebaseSet(userRef, {
                id: userId,
                email: null,
                phone: phoneNumber,
                name: name || phoneNumber,
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
        } else {
            // Cập nhật thời gian đăng nhập cuối cùng
            await window.firebaseUpdate(userRef, {
                lastLogin: new Date().toISOString()
            });
        }
        
        console.log('✅ Xác minh OTP thành công:', userId);
        showToast('✓ Đăng nhập thành công!');
        
        // Xóa confirmationResult
        window.phoneAuthConfirmationResult = null;
        
        return { success: true, userId };
    } catch (error) {
        console.error('❌ Lỗi xác minh OTP:', error.message);
        
        let errorMsg = 'Mã OTP không chính xác.';
        
        if (error.code === 'auth/invalid-verification-code') {
            errorMsg = 'Mã OTP không hợp lệ hoặc đã hết hạn.';
        } else if (error.code === 'auth/code-expired') {
            errorMsg = 'Mã OTP đã hết hạn. Vui lòng gửi lại.';
        }
        
        showToast(`❌ ${errorMsg}`);
        return { success: false, error: error.message };
    }
}
console.log('✅ auth.js loaded successfully');
