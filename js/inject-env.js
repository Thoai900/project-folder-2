// Inject Firebase API Key vào window object
// This script runs BEFORE Firebase initialization
(function() {
    // Get API key từ environment variables hoặc hardcode fallback
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                   localStorage.getItem('firebase_api_key') ||
                   'AIzaSyB2Nh4TfIOAuPpO18DdTmTKmJCVgasoWFI'; // Fallback key
    
    // Inject vào window global object
    window.__FIREBASE_API_KEY__ = apiKey;
    
    console.log('✅ Firebase API Key injected');
})();
