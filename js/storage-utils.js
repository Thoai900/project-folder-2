// ==========================================
// Firebase Storage Utils
// Upload files và lấy download URL
// ==========================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Giả sử bạn đã initialize storage từ firebase-config.js
// import { storage } from './firebase-config';

/**
 * Upload ảnh lên Firebase Storage
 * @param {File} file - File từ input
 * @param {string} folderPath - Path folder (ví dụ: 'avatars/userId')
 * @returns {Promise<string>} - Download URL của file
 */
export const uploadImage = async (file, folderPath = 'images/public') => {
    try {
        if (!file) {
            throw new Error('Không có file được chọn');
        }

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            throw new Error('File phải là ảnh (jpg, png, gif...)');
        }

        // Kiểm tra dung lượng (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Ảnh phải nhỏ hơn 10MB');
        }

        // Tạo unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const storageRef = ref(window.firebaseStorage, `${folderPath}/${fileName}`);

        // Upload file
        console.log(`📤 Uploading ${file.name}...`);
        const snapshot = await uploadBytes(storageRef, file);
        console.log('✅ Upload thành công:', snapshot.ref.fullPath);

        // Lấy download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('🔗 Download URL:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('❌ Lỗi upload ảnh:', error.message);
        throw error;
    }
};

/**
 * Upload tài liệu (PDF, DOC, etc.)
 * @param {File} file - File từ input
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Download URL
 */
export const uploadDocument = async (file, userId) => {
    try {
        if (!file) {
            throw new Error('Không có file được chọn');
        }

        // Kiểm tra dung lượng (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('File phải nhỏ hơn 50MB');
        }

        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const storageRef = ref(window.firebaseStorage, `documents/${userId}/${fileName}`);

        console.log(`📄 Uploading ${file.name}...`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Upload tài liệu thành công');
        return downloadURL;
    } catch (error) {
        console.error('❌ Lỗi upload tài liệu:', error.message);
        throw error;
    }
};

/**
 * Upload file scan (từ camera/scanner)
 * @param {File} file - File từ camera
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Download URL
 */
export const uploadScan = async (file, userId, scanId) => {
    try {
        if (!file) {
            throw new Error('Không có file được chọn');
        }

        if (file.size > 20 * 1024 * 1024) {
            throw new Error('File scan phải nhỏ hơn 20MB');
        }

        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const storageRef = ref(window.firebaseStorage, `scans/${userId}/${scanId}/${fileName}`);

        console.log(`📸 Uploading scan...`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('❌ Lỗi upload scan:', error.message);
        throw error;
    }
};

/**
 * Xóa file từ Firebase Storage
 * @param {string} filePath - Full path của file (ví dụ: 'avatars/userId/image.jpg')
 */
export const deleteFile = async (filePath) => {
    try {
        const fileRef = ref(window.firebaseStorage, filePath);
        await deleteObject(fileRef);
        console.log('✅ File đã được xóa:', filePath);
    } catch (error) {
        console.error('❌ Lỗi xóa file:', error.message);
        throw error;
    }
};

/**
 * Upload Avatar cho user
 * @param {File} file - File ảnh
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Avatar URL
 */
export const uploadAvatar = async (file, userId) => {
    try {
        if (!file) {
            throw new Error('Chọn ảnh đại diện trước');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('File phải là ảnh');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Ảnh đại diện phải nhỏ hơn 5MB');
        }

        const timestamp = Date.now();
        const fileName = `avatar-${timestamp}`;
        const storageRef = ref(window.firebaseStorage, `avatars/${userId}/${fileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Avatar uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('❌ Lỗi upload avatar:', error.message);
        throw error;
    }
};

/**
 * Lấy danh sách files trong folder (nếu cần)
 * Note: Firestore giới hạn, tốt nhất lưu metadata trong Firestore
 */
export const getFileMetadata = async (userId) => {
    // Để implement đầy đủ, bạn cần lưu metadata files trong Firestore
    // Ví dụ: /users/{userId}/files/{fileId} -> { name, url, uploadedAt, type }
    console.log('📝 Implement: Lưu file metadata trong Firestore');
};
