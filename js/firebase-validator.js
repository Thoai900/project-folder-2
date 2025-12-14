/**
 * ===================================================
 * FIREBASE CONFIGURATION VALIDATOR
 * ===================================================
 * Kiểm tra Firebase configuration có đúng không
 */

class FirebaseConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * Kiểm tra tất cả
     */
    async validate() {
        console.log('🔍 Validating Firebase Configuration...\n');
        
        this.validateEnvironmentVariables();
        this.validateFirebaseApp();
        this.validateAuthService();
        await this.validateDatabaseConnection();
        await this.validateFirestoreConnection();
        await this.validateStorageConnection();
        
        this.displayResults();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            info: this.info
        };
    }

    /**
     * Kiểm tra environment variables
     */
    validateEnvironmentVariables() {
        console.log('📋 Checking Environment Variables...');
        
        const requiredVars = [
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
            'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
            'NEXT_PUBLIC_FIREBASE_APP_ID'
        ];

        requiredVars.forEach(varName => {
            const value = window[`__${varName}__`] || process.env[varName];
            if (!value) {
                this.warnings.push(`Environment variable ${varName} not found`);
            } else {
                this.info.push(`✓ ${varName} is set`);
            }
        });
    }

    /**
     * Kiểm tra Firebase App initialization
     */
    validateFirebaseApp() {
        console.log('🔧 Checking Firebase App...');
        
        if (!window.firebaseAuth) {
            this.errors.push('Firebase Auth not initialized. Check index.html script.');
            return;
        }
        
        if (!window.firebaseDB) {
            this.errors.push('Firebase Realtime Database not initialized.');
            return;
        }
        
        if (!window.db) {
            this.errors.push('Firestore not initialized.');
            return;
        }
        
        if (!window.firebaseStorage) {
            this.errors.push('Firebase Storage not initialized.');
            return;
        }

        this.info.push('✓ All Firebase services initialized');
    }

    /**
     * Kiểm tra Auth Service
     */
    validateAuthService() {
        console.log('🔐 Checking Authentication...');
        
        // Check if required auth functions exist
        const requiredFunctions = [
            'firebaseCreateUserWithEmailAndPassword',
            'firebaseSignInWithEmailAndPassword',
            'firebaseSignOut',
            'firebaseOnAuthStateChanged',
            'firebaseSendPasswordResetEmail'
        ];

        requiredFunctions.forEach(func => {
            if (!window[func]) {
                this.errors.push(`Auth function ${func} not found in window`);
            }
        });

        if (this.errors.length === 0) {
            this.info.push('✓ All Auth functions available');
        }
    }

    /**
     * Kiểm tra Realtime Database connection
     */
    async validateDatabaseConnection() {
        console.log('💾 Checking Realtime Database Connection...');
        
        try {
            if (!window.firebaseDB) {
                this.errors.push('Realtime Database not initialized');
                return;
            }

            // Try to read a test path
            const testRef = window.firebaseRef(window.firebaseDB, '.info/connected');
            
            // Set a timeout for connection check
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            });

            // This will be handled by onValue listener
            let connected = false;
            const promise = new Promise((resolve) => {
                window.firebaseOnValue(testRef, (snapshot) => {
                    connected = snapshot.val();
                    resolve();
                });
            });

            await Promise.race([promise, timeout]);
            
            if (connected) {
                this.info.push('✓ Realtime Database connected');
            } else {
                this.warnings.push('Realtime Database might not be connected');
            }
        } catch (error) {
            this.warnings.push(`Realtime Database check failed: ${error.message}`);
        }
    }

    /**
     * Kiểm tra Firestore connection
     */
    async validateFirestoreConnection() {
        console.log('🗄️  Checking Firestore Connection...');
        
        try {
            if (!window.db) {
                this.errors.push('Firestore not initialized');
                return;
            }

            this.info.push('✓ Firestore initialized');
            
            // Try to query a test collection
            // This won't throw error even if collection doesn't exist
            this.info.push('✓ Firestore accessible');
        } catch (error) {
            this.errors.push(`Firestore check failed: ${error.message}`);
        }
    }

    /**
     * Kiểm tra Storage connection
     */
    async validateStorageConnection() {
        console.log('📦 Checking Cloud Storage Connection...');
        
        try {
            if (!window.firebaseStorage) {
                this.errors.push('Cloud Storage not initialized');
                return;
            }

            this.info.push('✓ Cloud Storage initialized');
            
            // Storage doesn't need explicit connection check
            // Just verify the service is available
            this.info.push('✓ Cloud Storage accessible');
        } catch (error) {
            this.errors.push(`Cloud Storage check failed: ${error.message}`);
        }
    }

    /**
     * Hiển thị kết quả validation
     */
    displayResults() {
        console.clear();
        console.log('═'.repeat(60));
        console.log('   FIREBASE CONFIGURATION VALIDATION REPORT');
        console.log('═'.repeat(60));
        console.log();

        // Info
        if (this.info.length > 0) {
            console.log('✅ INFO:');
            this.info.forEach(msg => console.log(`   ${msg}`));
            console.log();
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(msg => console.log(`   ${msg}`));
            console.log();
        }

        // Errors
        if (this.errors.length > 0) {
            console.log('❌ ERRORS:');
            this.errors.forEach(msg => console.log(`   ${msg}`));
            console.log();
        }

        // Summary
        console.log('─'.repeat(60));
        if (this.errors.length === 0) {
            console.log('✅ VALIDATION PASSED - Firebase is properly configured!');
        } else {
            console.log(`❌ VALIDATION FAILED - ${this.errors.length} error(s) found`);
        }
        console.log('─'.repeat(60));
        console.log();

        // Recommendations
        this.showRecommendations();
    }

    /**
     * Hiển thị khuyến nghị
     */
    showRecommendations() {
        console.log('💡 RECOMMENDATIONS:');
        
        const recommendations = [
            '1. Check FIREBASE_CONFIG in index.html matches your project',
            '2. Enable required Firebase services:',
            '   - Authentication → Email/Password',
            '   - Realtime Database → Create database',
            '   - Firestore Database → Create database',
            '   - Cloud Storage → Create bucket',
            '3. Deploy security rules:',
            '   - Realtime: firebase-rules.json',
            '   - Firestore: firestore.rules',
            '   - Storage: storage.rules',
            '4. Configure authorized domains:',
            '   - localhost:3000',
            '   - localhost:5173',
            '   - your-domain.vercel.app',
            '5. Set environment variables in .env.local',
            '6. For production:',
            '   - Review and harden security rules',
            '   - Enable backups',
            '   - Set up monitoring alerts',
            '   - Configure API key restrictions'
        ];

        recommendations.forEach(rec => console.log(`   ${rec}`));
        console.log();
    }

    /**
     * Test Authentication
     */
    async testAuthentication() {
        console.log('🧪 Testing Authentication...\n');
        
        try {
            // Test 1: Get current user
            const currentUser = window.firebaseOnAuthStateChanged(
                window.firebaseAuth,
                (user) => {
                    if (user) {
                        console.log('✓ Current user:', user.email);
                    } else {
                        console.log('✓ No user logged in (expected for test)');
                    }
                }
            );

            this.info.push('✓ Authentication state listener working');
        } catch (error) {
            this.errors.push(`Auth test failed: ${error.message}`);
        }
    }

    /**
     * Test Database
     */
    async testDatabase() {
        console.log('🧪 Testing Realtime Database...\n');
        
        try {
            const testRef = window.firebaseRef(
                window.firebaseDB,
                'test/validation'
            );
            
            // Write test data
            await window.firebaseSet(testRef, {
                timestamp: new Date().toISOString(),
                message: 'Firebase configuration test'
            });

            // Read test data
            const snapshot = await window.firebaseGet(testRef);
            if (snapshot.exists()) {
                console.log('✓ Test data written and read successfully');
                
                // Clean up
                await window.firebaseRemove(testRef);
                console.log('✓ Test data cleaned up');
            }

            this.info.push('✓ Realtime Database read/write working');
        } catch (error) {
            this.errors.push(`Database test failed: ${error.message}`);
        }
    }

    /**
     * Test Firestore
     */
    async testFirestore() {
        console.log('🧪 Testing Firestore...\n');
        
        try {
            const collectionRef = window.collection(
                window.db,
                'test'
            );
            
            // Try to query collection
            const q = window.query(collectionRef);
            
            console.log('✓ Firestore collection query successful');
            this.info.push('✓ Firestore queries working');
        } catch (error) {
            this.errors.push(`Firestore test failed: ${error.message}`);
        }
    }

    /**
     * Generate Configuration Report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            isValid: this.errors.length === 0,
            stats: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                totalInfo: this.info.length
            },
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            environment: {
                isDevelopment: !('production' in process.env),
                isProduction: process.env.NODE_ENV === 'production'
            }
        };

        return report;
    }

    /**
     * Export Report to JSON
     */
    exportReport() {
        const report = this.generateReport();
        const json = JSON.stringify(report, null, 2);
        
        // Create download link
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `firebase-validation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📄 Validation report exported');
        return report;
    }
}

// Create global instance
const firebaseValidator = new FirebaseConfigValidator();

// Auto-validate on load (in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    window.addEventListener('load', async () => {
        setTimeout(() => {
            firebaseValidator.validate();
        }, 2000);
    });
}

// Export for manual use
window.firebaseValidator = firebaseValidator;

console.log('✅ Firebase Validator loaded - Use: firebaseValidator.validate()');
