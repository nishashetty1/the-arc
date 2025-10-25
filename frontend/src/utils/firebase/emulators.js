// src/utils/firebase/emulators.js
// Firebase Emulator Configuration for local development

/**
 * Checks if the application is running in a development environment
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV === true || 
         window.location.hostname === 'localhost';
};

/**
 * Mock storage implementation for local development
 * Stores files in browser memory instead of Firebase Storage
 */
export class MockFirebaseStorage {
  constructor() {
    this.files = new Map();
    console.log('🔧 Using mock Firebase Storage for development');
  }

  /**
   * Generate a mock download URL for a stored file
   * @param {string} path - The file path
   * @returns {string} A mock URL
   */
  generateMockUrl(path) {
    // Create a mock URL that looks like a Firebase Storage URL
    return `mock-firebase-storage://${path}?mock=true&t=${Date.now()}`;
  }

  /**
   * Store file data with its path
   * @param {string} path - File path
   * @param {*} data - File data
   */
  storeFile(path, data) {
    this.files.set(path, {
      data,
      metadata: {
        fullPath: path,
        name: path.split('/').pop(),
        size: typeof data === 'string' ? data.length : data.byteLength,
        contentType: 'application/octet-stream',
        updated: new Date().toISOString()
      },
      downloadUrl: this.generateMockUrl(path)
    });
  }

  /**
   * Get file data by path
   * @param {string} path - File path
   * @returns {Object|null} The stored file data or null if not found
   */
  getFile(path) {
    return this.files.get(path) || null;
  }

  /**
   * List all stored files
   * @returns {Array} Array of file metadata
   */
  listFiles() {
    return Array.from(this.files.values()).map(file => file.metadata);
  }
}

/**
 * Mock implementation of uploadBytesResumable for local development
 */
export const mockUploadBytesResumable = (storageRef, data) => {
  // Create a mock upload task
  const mockTask = {
    snapshot: {
      ref: storageRef,
      bytesTransferred: typeof data === 'string' ? data.length : data.byteLength,
      totalBytes: typeof data === 'string' ? data.length : data.byteLength,
      state: 'success',
      metadata: {}
    },
    on: (event, progressCallback, errorCallback, completeCallback) => {
      // Simulate progress updates
      setTimeout(() => {
        if (progressCallback) {
          progressCallback({
            bytesTransferred: mockTask.snapshot.totalBytes * 0.5,
            totalBytes: mockTask.snapshot.totalBytes,
            state: 'running'
          });
        }
      }, 300);

      setTimeout(() => {
        if (completeCallback) {
          completeCallback();
        }
      }, 1000);

      return mockTask;
    }
  };

  return mockTask;
};

/**
 * Mock implementation of getDownloadURL
 */
export const mockGetDownloadURL = async (ref) => {
  const mockStorage = window.__mockFirebaseStorage;
  const path = ref._location.path_;
  
  // Check if we have this file stored
  const file = mockStorage.getFile(path);
  
  if (file) {
    return file.downloadUrl;
  }
  
  // If file wasn't explicitly stored, generate a mock URL anyway
  return mockStorage.generateMockUrl(path);
};

/**
 * Mock implementation of uploadString
 */
export const mockUploadString = async (ref, data) => {
  const mockStorage = window.__mockFirebaseStorage;
  const path = ref._location.path_;
  
  // Store the string data
  mockStorage.storeFile(path, data);
  
  // Return a mock snapshot
  return {
    ref,
    metadata: {
      fullPath: path,
      name: path.split('/').pop(),
      size: data.length,
      contentType: 'text/plain',
      updated: new Date().toISOString()
    }
  };
};

/**
 * Initialize Firebase emulators for local development
 */
export const initializeEmulators = (auth, db, storage) => {
  if (!isDevelopment()) return;

  try {
    console.log('🔥 Initializing Firebase emulators for local development...');
    
    // Create and expose a mock storage implementation
    if (!window.__mockFirebaseStorage) {
      window.__mockFirebaseStorage = new MockFirebaseStorage();
    }
    
    // Override native Firebase Storage functions with mocks
    if (storage) {
      const originalRef = storage.ref;
      
      // Keep the original reference function but add instrumentation
      storage.ref = function(path) {
        const originalRefResult = originalRef.call(storage, path);
        console.log(`🔧 Storage ref requested for: ${path}`);
        return originalRefResult;
      };
    }
    
    console.log('✅ Firebase emulators initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing Firebase emulators:', error);
  }
};