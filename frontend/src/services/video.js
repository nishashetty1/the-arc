// Video service for managing pitch videos
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  deleteObject
} from 'firebase/storage';
import { db } from '../utils/firebase/config';
import { uploadVideoToCloudinary, validateVideoFile, generateVideoUrl, generateThumbnailUrl } from '../utils/cloudinary/upload';

// Collection name for video metadata
const VIDEOS_COLLECTION = 'pitchVideos';

/**
 * Video types based on user roles
 */
export const VIDEO_TYPES = {
  PITCH: 'pitch', // For individuals and startups
  INVESTMENT_CRITERIA: 'investment_criteria', // For investors
};

/**
 * Video categories for tagging
 */
export const VIDEO_CATEGORIES = [
  { id: 'tech', label: 'Technology' },
  { id: 'health', label: 'Healthcare' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'realestate', label: 'Real Estate' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'social', label: 'Social Impact' },
  { id: 'other', label: 'Other' }
];

/**
 * Get video type label based on user type
 * @param {string} userType - The user type (individual, startup, investor)
 * @returns {Object} - Video type configuration
 */
export const getVideoTypeConfig = (userType) => {
  if (userType === 'investor') {
    return {
      type: VIDEO_TYPES.INVESTMENT_CRITERIA,
      title: 'Investment Criteria Video',
      description: 'Share what kind of startups and ideas you are looking to invest in',
      uploadButtonText: 'New Investment Video',
      pageTitle: 'Investment Criteria Videos',
      pageSubtitle: 'Share your investment preferences and criteria'
    };
  }
  
  // For individual and startup
  return {
    type: VIDEO_TYPES.PITCH,
    title: 'Pitch Video',
    description: 'Create your 60-second elevator pitch',
    uploadButtonText: 'New Pitch Video',
    pageTitle: 'Pitch Videos',
    pageSubtitle: 'Create and manage your 60-second pitch videos'
  };
};

/**
 * Upload a pitch video to Cloudinary
 * @param {File} videoFile - The video file to upload
 * @param {string} userId - The ID of the user uploading the video
 * @param {Object} metadata - Video metadata including title, description, etc.
 * @returns {Promise<Object>} - Information about the uploaded video
 */
export const uploadPitchVideo = async (videoFile, userId, metadata) => {
  try {
    console.log('Starting pitch video upload to Cloudinary...');
    
    // Validate the video file first
    const validation = validateVideoFile(videoFile);
    if (!validation.isValid) {
      throw new Error(`Video validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Video upload warnings:', validation.warnings);
    }
    
    // Determine video type based on userType or metadata
    const videoType = metadata.videoType || VIDEO_TYPES.PITCH;
    
    // Prepare upload options
    const uploadOptions = {
      folder: `${videoType === VIDEO_TYPES.INVESTMENT_CRITERIA ? 'investment-videos' : 'pitch-videos'}/${userId}`,
      publicId: `${userId}_${Date.now()}`,
      tags: [videoType, metadata.category || 'other'],
      context: {
        user_id: userId,
        title: metadata.title || 'Untitled Video',
        category: metadata.category || 'other',
        video_type: videoType
      }
    };
    
    console.log('Uploading to Cloudinary with options:', uploadOptions);
    
    // Upload to Cloudinary
    const cloudinaryResult = await uploadVideoToCloudinary(videoFile, uploadOptions);
    
    console.log('Cloudinary upload successful:', cloudinaryResult);
    
    // Prepare video data for Firestore
    const videoData = {
      userId,
      userType: metadata.userType || null,
      videoType,
      title: metadata.title || 'Untitled Video',
      description: metadata.description || '',
      category: metadata.category || 'other',
      
      // Cloudinary data
      cloudinaryPublicId: cloudinaryResult.publicId,
      videoUrl: cloudinaryResult.secureUrl,
      thumbnailUrl: cloudinaryResult.thumbnailUrl,
      
      // Video properties
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      duration: cloudinaryResult.duration || metadata.duration || 0,
      format: cloudinaryResult.format,
      fileSize: cloudinaryResult.bytes,
      aspectRatio: metadata.aspectRatio || '9:16',
      
      // URLs for different qualities
      urls: {
        mobile: generateVideoUrl(cloudinaryResult.publicId, 'mobile'),
        desktop: generateVideoUrl(cloudinaryResult.publicId, 'desktop'),
        hd: generateVideoUrl(cloudinaryResult.publicId, 'hd'),
        original: cloudinaryResult.secureUrl
      },
      
      // Engagement metrics
      views: 0,
      likes: 0,
      
      // Status and timestamps
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Saving video metadata to Firestore...');
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), videoData);
    
    console.log('Video metadata saved with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
  } catch (error) {
    console.error('Error in uploadPitchVideo:', error);
    throw error;
  }
};

/**
 * Get a pitch video by ID
 * @param {string} videoId - The ID of the video to retrieve
 * @returns {Promise<Object>} - The video data
 */
export const getPitchVideo = async (videoId) => {
  try {
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (videoSnap.exists()) {
      const videoData = videoSnap.data();
      
      // Increment view count
      await updateDoc(videoRef, {
        views: (videoData.views || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      return {
        id: videoSnap.id,
        ...videoData,
        createdAt: videoData.createdAt?.toDate() || new Date(),
        updatedAt: videoData.updatedAt?.toDate() || new Date()
      };
    } else {
      throw new Error('Video not found');
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

/**
 * Get pitch videos for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of video data objects
 */
export const getUserPitchVideos = async (userId) => {
  try {
    console.log('Fetching videos for user:', userId);
    
    const q = query(
      collection(db, VIDEOS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    
    console.log('Query successful. Found', querySnapshot.docs.length, 'videos');
    
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
    
    console.log('Processed videos:', videos);
    
    return videos;
  } catch (error) {
    console.error('Error fetching user videos:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // If it's an index error, provide helpful message
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error('🔥 Firestore Index Required!');
      console.error('Create an index with these fields:');
      console.error('  Collection: pitchVideos');
      console.error('  Fields: userId (Ascending), status (Ascending), createdAt (Descending)');
      
      // Try to fetch without the status filter as fallback
      console.log('Attempting to fetch without status filter...');
      try {
        const fallbackQuery = query(
          collection(db, VIDEOS_COLLECTION),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackVideos = fallbackSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          }))
          .filter(video => video.status === 'active');
        
        console.log('Fallback query successful. Found', fallbackVideos.length, 'videos');
        return fallbackVideos;
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw error;
      }
    }
    
    throw error;
  }
};

/**
 * Get recent pitch videos across the platform, with optional category filtering
 * @param {string} category - Optional category to filter videos
 * @param {number} maxResults - Maximum number of videos to return
 * @returns {Promise<Array>} - Array of video data objects
 */
export const getRecentPitchVideos = async (category = null, maxResults = 10) => {
  try {
    let q;
    
    if (category) {
      q = query(
        collection(db, VIDEOS_COLLECTION),
        where('status', '==', 'active'),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
    } else {
      q = query(
        collection(db, VIDEOS_COLLECTION),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    throw error;
  }
};

/**
 * Update pitch video metadata
 * @param {string} videoId - ID of the video to update
 * @param {Object} metadata - Updated metadata fields
 * @returns {Promise<Object>} - Updated video data
 */
export const updatePitchVideo = async (videoId, metadata) => {
  try {
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }
    
    // Only allow updating certain fields
    const updatableFields = [
      'title',
      'description',
      'category',
      'status',
      'thumbnail'
    ];
    
    const updateData = {};
    
    Object.keys(metadata).forEach(key => {
      if (updatableFields.includes(key)) {
        updateData[key] = metadata[key];
      }
    });
    
    // Add timestamp
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(videoRef, updateData);
    
    // Return the updated data
    const updatedSnap = await getDoc(videoRef);
    const updatedData = updatedSnap.data();
    
    return {
      id: videoId,
      ...updatedData,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: new Date() // Use current date for immediate UI update
    };
  } catch (error) {
    console.error('Error updating video metadata:', error);
    throw error;
  }
};

/**
 * Delete a pitch video (both Firestore metadata and Cloudinary video)
 * @param {string} videoId - ID of the video to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deletePitchVideo = async (videoId) => {
  try {
    // Get the video data to find the Cloudinary public ID
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }
    
    const videoData = videoSnap.data();
    
    // Note: For security reasons, Cloudinary video deletion should be done from the backend
    // Here we'll just mark the video as deleted in Firestore
    console.warn('Cloudinary video deletion should be implemented on the backend');
    
    // Mark video as deleted instead of actually deleting
    await updateDoc(videoRef, {
      status: 'deleted',
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Video ${videoId} marked as deleted. Cloudinary public ID: ${videoData.cloudinaryPublicId}`);
    
    // TODO: Implement backend API call to delete from Cloudinary
    // Example: await fetch('/api/videos/delete', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ publicId: videoData.cloudinaryPublicId }) 
    // });
    
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

/**
 * Toggle like status for a video
 * @param {string} videoId - ID of the video
 * @param {string} userId - ID of the user liking/unliking
 * @returns {Promise<Object>} - Updated like status and count
 */
export const toggleVideoLike = async (videoId, userId) => {
  try {
    // Reference to the video
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (!videoSnap.exists()) {
      throw new Error('Video not found');
    }
    
    // Reference to the like record
    const likeRef = doc(db, 'videoLikes', `${videoId}_${userId}`);
    const likeSnap = await getDoc(likeRef);
    
    // Check if the user has already liked the video
    if (likeSnap.exists()) {
      // User already liked the video, so remove the like
      await deleteDoc(likeRef);
      
      // Decrement the like count
      await updateDoc(videoRef, {
        likes: (videoSnap.data().likes || 1) - 1,
        updatedAt: serverTimestamp()
      });
      
      return { liked: false, likes: (videoSnap.data().likes || 1) - 1 };
    } else {
      // User hasn't liked the video yet, add the like
      await setDoc(likeRef, {
        userId,
        videoId,
        createdAt: serverTimestamp()
      });
      
      // Increment the like count
      await updateDoc(videoRef, {
        likes: (videoSnap.data().likes || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      return { liked: true, likes: (videoSnap.data().likes || 0) + 1 };
    }
  } catch (error) {
    console.error('Error toggling video like:', error);
    throw error;
  }
};

/**
 * Check if a user has liked a video
 * @param {string} videoId - ID of the video
 * @param {string} userId - ID of the user
 * @returns {Promise<boolean>} - Whether the user has liked the video
 */
export const checkVideoLiked = async (videoId, userId) => {
  try {
    const likeRef = doc(db, 'videoLikes', `${videoId}_${userId}`);
    const likeSnap = await getDoc(likeRef);
    
    return likeSnap.exists();
  } catch (error) {
    console.error('Error checking video like status:', error);
    throw error;
  }
};