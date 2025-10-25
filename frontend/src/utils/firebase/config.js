// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { initializeEmulators, isDevelopment, mockUploadString, mockGetDownloadURL } from './emulators';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing required Firebase configuration:', missingKeys);
  console.error('Please check your .env file and ensure all VITE_FIREBASE_* variables are set.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize emulators in development environment
if (isDevelopment()) {
  initializeEmulators(auth, db, storage);
  
  // Patch the global storage functions with our mock implementations
  const originalUploadString = uploadString;
  const originalGetDownloadURL = getDownloadURL;
  
  // Override the global functions
  window.uploadString = (ref, data, format) => 
    mockUploadString(originalUploadString, ref, data, format);
  
  window.getDownloadURL = (ref) => 
    mockGetDownloadURL(originalGetDownloadURL, ref);
}

// Helper function to test if storage is properly configured
export const testFirebaseStorage = async () => {
  try {
    console.log('Testing Firebase Storage connectivity...');
    const testRef = ref(storage, 'test/storage-test.txt');
    const testString = `Storage test at ${new Date().toISOString()}`;
    
    await uploadString(testRef, testString);
    const downloadUrl = await getDownloadURL(testRef);
    
    console.log('Firebase Storage test successful!');
    console.log('Test file URL:', downloadUrl);
    return {
      success: true,
      message: 'Firebase Storage is properly configured',
      url: downloadUrl
    };
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    return {
      success: false,
      message: `Firebase Storage error: ${error.message}`,
      errorCode: error.code,
      errorDetails: error
    };
  }
};

export { auth, db, storage };